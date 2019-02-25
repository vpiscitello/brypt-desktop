const zeromq = require('zeromq');
const bryptMessage = require('../../build/Release/brypt-message.node');

const BRYPT_CONNECTED = 'CONNECTED';
const BRYPT_COLLECTED = 'COLLECTED';
const BRYPT_RESPONSE = 'RESPONSE';

let currentJobID = null;
let currentJobType = null;

let backgroundJobID = null;
let backgroundJobType = null;

/* **************************************************************************
 ** Function: cycleTimer
 ** Description: Handles interactive event timer such that it can be paused
 ** and started on demand.
 ** *************************************************************************/
function cycleTimer(callback, delay) {
    let cycleID = null; // Timeout object returned by setTimeout
    let cycleStart = null; // The start of the cycle timeout
    let cycleRemaining = delay; // The time remaining until the callback of the cycle
    let cycleActive = false; // Boolean of the cycle state

    // cycleTimer function to pause the current timeout
    this.pause = function() {
        clearTimeout(cycleID);
        cycleRemaining -= new Date().getTime() - cycleStart; // Calculate the time remaining of the timeout
        cycleActive = false;
    };

    // cycleTimer function to pause the current timeout
    this.start = function() {
        cycleStart = new Date().getTime(); // Get the starting time of the timeout
        clearTimeout(cycleID);
        cycleID = setTimeout(callback, cycleRemaining);
        cycleActive = true;
    };

    // cycleTimer function to return the timeout state
    this.active = function() {
        return cycleActive;
    };

    this.start(); // Start the cycle for first call
}

/* **************************************************************************
 ** Function: BryptConnection
 ** Description: Class defining the connection methods to the Brypt network
 ** *************************************************************************/
class BryptConnection {

    constructor() {
        this.socket = null;
        this.connIP = ''; // Peer connection IP address
        this.connPort = 0; // Peer connection port
        this.requests = []; // Holds queued requests to the peer
        this.responses = []; // Holds queued responses from the peer

        this.selfIP = ''; // Connection IP address of this device
        this.selfPort = 0; // Connection port of this device
        this.selfID = ''; // Node ID of this device

        this.cycleCommand = 0; // The command to cycle
        this.cyclePhase = 0; // The command phase of the cycle
        this.cycleData = ''; // The request data message of the cycle
        this.cycleKey = null; // The cryptographic key for the cycle
        this.cycleNonce = 0; // The cryptographic nonce for the cycle
        this.cycleTimer = null; // The cycle timer handler
    }

    /* **************************************************************************
     ** Function: setup
     ** Description: Handles establishing the initial state of the BryptConnection
     ** *************************************************************************/
    setup(id, ip, port) {
        // Prevent multiple connections from being created
        if (this.socket != null) {
            return new Error('Connection Already Established');
        }

        this.selfID = id; // Store the ID of the our node
        this.connIP = ip; // Store the peer connection IP
        this.connPort = port; // Store the peer connection port

        this.socket = new zeromq.socket('req'); // Create a new ZMQ socket using the Request/Reply paradigm

        // Socket connect handler
        this.socket.on('connect', function(fd, ep) {
            // Notify parent the connection to the peer was successful
            process.send({
                id: currentJobID,
                type: BRYPT_CONNECTED,
                payload: {
                    status: 'Connected on endpoint:' + ep
                }
            });
            currentJobID = null;
            currentJobType = null;
        });

        // Socket connect retry handler
        this.socket.on('connect_retry', function(fd, ep) {
            console.log('connect_retry, endpoint:', ep);
            // TODO: Handle extended retries
        });

        // Socket disconnect handler - expected
        this.socket.on('close', function(fd, ep) {
            console.log('close, endpoint:', ep);
            // TODO: Handle socket known disconnect
        });

        // Socket disconnect handler - unexpected
        this.socket.on('disconnect', function(fd, ep) {
            console.log('disconnect, endpoint:', ep);
            // TODO: Handle socket unknown disconnect
        });

        // Socket reply message recieved handler
        this.socket.on('message', (message) => {
            this.receive(message.toString()); // Forward the message to the connection collection manager
        });

        this.socket.connect('tcp://' + this.connIP + ':' + this.connPort); // Connect to the peer using the known information over TCP

        // Socket monitor error handler
        this.socket.on('monitor_error', function(err) {
            setTimeout(function() {
                this.socket.monitor(1000, 0);
            }, 5000);
        });

        console.log('Start monitoring...');
        this.socket.monitor(1000, 0); // Start a socket monitor to check the socket every 1 second.

    }

    /* **************************************************************************
     ** Function: send
     ** Description: Sends a request to the Brypt peer. This peer is currently
     ** always the root network coordinator.
     ** *************************************************************************/
    send(command, phase, data, key, nonce) {
        console.log("Sending Message For: ", currentJobID, currentJobType);

        if (currentJobType != 'CYCLE' && this.cycleTimer) {
            if (this.cycleTimer.active()) {
                this.cycleTimer.pause();
            }
        }

        // Create a new message using the provided information
        let request = new bryptMessage.Init(this.selfID, command, phase, data, nonce);
        this.socket.send(request.getPack()); // Send the packed message to the peer
    }

    /* **************************************************************************
     ** Function: receive
     ** Description: Handle a recieved reply to the last request
     ** *************************************************************************/
    receive(message) {
        console.log("Recived Message Handling With: ", currentJobID, currentJobType);
        switch (currentJobType) {
            case 'CYCLE':
                {
                    process.send({
                        id: currentJobID,
                        type: BRYPT_COLLECTED,
                        payload: {
                            collected: message
                        }
                    });
                    break;
                }
            case 'REQUEST':
                {
                    process.send({
                        id: currentJobID,
                        type: BRYPT_RESPONSE,
                        payload: {
                            response: message
                        }
                    });
                    currentJobID = null;
                    currentJobType = null;
                    break;
                }
            default:
                throw new Error('Unrecognized Brypt Connection Job');
        }

        if (backgroundJobID) {
            this.cycleTimer.start();
            currentJobID = backgroundJobID;
            currentJobType = backgroundJobType;
            backgroundJobID = null;
            backgroundJobType = null;
        }

    }

    /* **************************************************************************
     ** Function: cycle
     ** Description: Hanles establishing a flooded message cycle to the network.
     ** *************************************************************************/
    cycle(command, data, key, delay) {
        this.cycleCommand = command; // Store the cycle command
        this.cycleData = data; // Store the the cycle data
        this.cycleKey = key; // Store the cycle key

        this.cycleDelay = delay; // Store the desired request delay for the cycle

        // Send an initial message to the cycle
        this.send(this.cycleCommand, this.cyclePhase, this.cycleData, this.cycleKey, this.cycleNonce);
        this.cycleNonce += 1;

        this.cycleInterval(); // Start the cycle interval
    }

    /* **************************************************************************
     ** Function: cycleInterval
     ** Description: Handles creating a cycleTimer and the callback for the each
     ** cycle.
     ** *************************************************************************/
    cycleInterval() {
        this.cycleTimer = new cycleTimer(() => {
            this.send(this.cycleCommand, this.cyclePhase, this.cycleData, this.cycleKey, this.cycleNonce);
            this.cycleNonce += 1;

            // Don't start again until message response is recieved?
            this.cycleInterval();
        }, this.cycleDelay);
    }

}

const connection = new BryptConnection(); // Create a Brypt network connection

// Process IPC handler for messages from the parent
process.on('message', (message) => {
    // console.log(message);
    try {
        // Switch on the type of command sent
        switch (message.type) {
            case 'CONNECT':
                {
                    // Handle a command to connect to a Brypt network
                    currentJobID = message.id;
                    currentJobType = 'CONNECT';

                    connection.setup(message.payload.id, message.payload.ip, message.payload.port);
                    break;
                }
            case 'CYCLE':
                {
                    // Handle a command to create a cycle with the Brypt network
                    currentJobID = message.id;
                    currentJobType = 'CYCLE';

                    connection.cycle(message.payload.command, message.payload.data, message.payload.key, message.payload.delay);
                    break;
                }
            case 'REQUEST':
                {
                    // Handle a command to create a cycle with the Brypt network
                    if (currentJobID != null) {
                        backgroundJobID = currentJobID;
                        backgroundJobType = currentJobType;
                    }

                    currentJobID = message.id;
                    currentJobType = 'REQUEST';

                    connection.send(
                        message.payload.command,
                        message.payload.phase,
                        message.payload.data,
                        message.payload.key,
                        message.payload.nonce
                    );
                    break;
                }
            default:
                throw new Error('Unrecognized Connection Command');
        }
    } catch (error) {
        console.log(error);
    }
});
