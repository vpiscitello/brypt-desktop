import {
    app, BrowserWindow, ipcMain, session
}
from 'electron';

import bryptConnection from '../connection';
import store from '../renderer/store';

if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\');
}

let mainWindow;
const loginURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`;
const dashboardURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080#dashboard` :
    `file://${__dirname}/index.html#dashboard`;

let winURL = "";
let winHeight = 0,
    winWidth = 0,
    winResize = false;

let bryptNetworkInfo = null;
let bryptNodesInfo = null;

function createWindow(url, height, width, resize) {
    const ses = session.fromPartition('persist:name');
    console.log(ses.getUserAgent());
    console.log(ses.cookies.get({}, (error, cookies) => {
        if (error) {
            console.log(error);
        }
        if (cookies) {
            console.log(cookies);
        }
    }));

    // Store passed variables in case we need to reopen the same window
    winURL = url;
    winHeight = height;
    winWidth = width;
    winResize = resize;

    // Catch the first call so we load in the Login window
    if (typeof winURL !== 'string') {
        winURL = loginURL;
    }
    if (typeof winHeight !== 'number') {
        winHeight = 580;
    }
    if (typeof winWidth !== 'number') {
        winWidth = 420;
    }
    if (typeof winResize !== 'boolean') {
        winResize = false;
    }

    // Create a new window with the provided properties
    mainWindow = new BrowserWindow({
        height: winHeight,
        width: winWidth,
        useContentSize: true,
        resizable: winResize,
        titleBarStyle: 'hidden',
        // webPreferences: {
        //     webSecurity: false
        // }
        // frame: false
    });

    mainWindow.loadURL(winURL);

    mainWindow.on('closed', () => {
        console.log('MainWindow closed');
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        console.log('Activate with no main window...');
        createWindow(winURL, winHeight, winWidth, winResize);
    }
});

ipcMain.on('openDashboard', function(event, message) {
    mainWindow.close();
    setTimeout(() => {
        createWindow(dashboardURL, 760, 1240, true);
    }, 1500);
});

function forwardCycleDataToRenderer(error, message) {
    mainWindow.webContents.send('cycleReadingsRecieved', message);
}

ipcMain.on('startBryptConnection', function(event, message) {
    console.log(JSON.parse(message));
    let messageJSON = JSON.parse(message);

    bryptNetworkInfo = messageJSON.network;
    bryptNodesInfo = messageJSON.nodes;

    // TODO: Pass in keys
    bryptConnection.setup(bryptNetworkInfo.root_ip, bryptNetworkInfo.root_port, function(error) {
        if (error != null) {}

        let initCommand = 0;
        let initPhase = 0;
        let initData = 'Request for Network Information.';
        let initKey = 'Grapefruit';
        let initNonce = 0;

        bryptConnection.send(
            initCommand, initPhase, initData, initKey, initNonce,
            function(error, message) {

                let cycleCommand = 1;
                let cycleData = 'Request for network sensor readings.';
                let cycleKey = 'Pineapple';
                let cycleNonce = 0;

                bryptConnection.cycle(cycleCommand, cycleData, cycleKey, cycleNonce, forwardCycleDataToRenderer);

                event.sender.send('bryptConnectionCompleted', {
                    payload: {
                        clusterInformation: message
                    }
                });
            });
    });
});

ipcMain.on('sendBryptMessage', function(event, message) {
    let destinationUID = message.destination;
    let responseHandler = message.handler;

    let messageCommand = message.payload.command;
    let messagePhase = message.payload.phase;
    let messageData = message.payload.data;

    // TODO: map uid to keys and nonces and track state
    // Get key and nonce from destinationUID
    let messageKey = 'Grapefruit';
    let messageNonce = 0;

    console.log('Sending Brypt message with:', messageCommand, messagePhase, messageData, messageKey, messageNonce);

    bryptConnection.send(
        messageCommand, messagePhase, messageData, messageKey, messageNonce,
        function(error, message) {
            event.sender.send(responseHandler, {
                payload: message,
            });
        });
});
