const fork = require('child_process').fork;
const connection = fork('./src/connection/connection.js');

const BRYPT_CONNECT = 'CONNECT';
const BRYPT_COLLECT = 'COLLECT';
const BRYPT_CYCLE = 'CYCLE';
const BRYPT_REQUEST = 'REQUEST';

let callbackToHandle = null;

let jobID = 0;
let jobs = new Map();

module.exports = {
    setup: (ip, port, callback) => {
        console.log("Brypt Connection Setup");
        connection.send({
            id: jobID,
            type: BRYPT_CONNECT,
            payload: {
                id: "0xFFFFFFFFFF",
                ip: ip,
                port: port
            }
        });

        jobs.set(jobID, callback);
        jobID++;
    },
    send: (command, phase, data, key, nonce, callback) => {
        console.log("Sending Message to Brypt Network");
        connection.send({
            id: jobID,
            type: BRYPT_REQUEST,
            payload: {
                command: command,
                phase: phase,
                data: data,
                key: key,
                nonce: nonce
            }
        });

        jobs.set(jobID, callback);
        jobID++;
    },
    cycle: (command, data, key, nonce, callback) => {
        console.log("Starting Brypt Send Cycle");
        connection.send({
            id: jobID,
            type: BRYPT_CYCLE,
            payload: {
                command: command,
                data: data,
                key: key,
                nonce: nonce,
                delay: 30 * 1000
            }
        });

        jobs.set(jobID, callback);
        jobID++;
    },
    collect: (callback) => {

        jobs.set(jobID, callback);
        jobID++;
    }
};

// Process IPC handler for messages from the parent
connection.on('message', (message) => {
    // console.log(message);
    try {
        let callback = jobs.get(message.id);
        console.log(message.id, callback);
        // Switch on the type of command sent
        switch (message.type) {
            case 'CONNECTED':
                {
                    // Handle setup complete
                    console.log(message.payload.status);
                    callback(null);
                    jobs.delete(message.id);
                    break;
                }
            case 'RESPONSE':
                {
                    console.log('Response: ', message.payload.response);
                    callback(null, message.payload.response);
                    jobs.delete(message.id);
                    break;
                }
            case 'COLLECTED':
                {
                    // Handle recieved messages
                    console.log('Collected: ', message.payload.collected);
                    callback(null, message.payload.collected);
                    break;
                }
            default:
                throw new Error('Unrecognized Connection Command');
        }
    } catch (error) {
        console.log(error);
    }
});

process.on('exit', () => {
    connection.kill('SIGINT');
    process.exit(0);
});
