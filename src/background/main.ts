//------------------------------------------------------------------------------------------------
'use strict'
//------------------------------------------------------------------------------------------------
import StartupOptions from './StartupOptions';
//------------------------------------------------------------------------------------------------
import { app, dialog, protocol, BrowserWindow } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
//------------------------------------------------------------------------------------------------
const isDevelopment = process.env.NODE_ENV !== 'production';
//------------------------------------------------------------------------------------------------

let options: StartupOptions;

//------------------------------------------------------------------------------------------------

function FetchStartupOptions()
{
    options = new StartupOptions(app.getAppPath());
    if (!options.Parse()) {
        dialog.showMessageBox({
            type: 'warning',
            title: 'Unable to Parse Configuration File',
            message: `The configuration file on disk could not be used to initialization the application.
            Default settings will be used.`,
            buttons: ['Ok']
        });
    }
}

//------------------------------------------------------------------------------------------------

async function CreateMainWindow()
{
    const [width, height] = options.GetWindowDimensions();
    const [x, y] = options.GetWindowPosition();
    
    const window = new BrowserWindow({
        x, y, width, height,
        webPreferences: {
            nodeIntegration: (process.env.ELECTRON_NODE_INTEGRATION as unknown) as boolean
        }
    });
    
    window.on("close", () => {
        const {x, y, width, height} = window.getBounds();
        options.Update({ x, y, width, height });
        options.Serialize();
    });

    // If the application is in development mode, load application content through the development
    // server. Otherwise, load the index file directly. 
    if (process.env.WEBPACK_DEV_SERVER_URL) {
        await window.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
        if (!process.env.IS_TEST) { window.webContents.openDevTools(); }
    } else {
        createProtocol('app');
        window.loadURL('app://./index.html');
    }
}

//------------------------------------------------------------------------------------------------
// Register the 'app' scheme with electron. This must occue before the application is ready. 
//------------------------------------------------------------------------------------------------
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } }
]);

//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------
// Application ready handler. When electron notifies us that the application can be launched 
// this will handle creating the main window. 
//------------------------------------------------------------------------------------------------
app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        try {
            await installExtension(VUEJS_DEVTOOLS); // Attempt to install Vue.js development tools. 
        } catch (error) {
            console.error('Vue Devtools failed to install:', error.toString()); 
        }
    }

    FetchStartupOptions();
    CreateMainWindow();
});

//------------------------------------------------------------------------------------------------
// Activation handler. On MacOS, exiting all windows will not completely quit the app. This 
// will recreate the window when reactivated. 
//------------------------------------------------------------------------------------------------
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        if (!options) { FetchStartupOptions(); }
        CreateMainWindow();
    }
});

//------------------------------------------------------------------------------------------------
// Application window close handler. On MacOS, it is common for applications to hold the process 
// open even if all windows have been closed. This will quit the application on all other 
// operating systems. 
//------------------------------------------------------------------------------------------------
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') { app.quit(); }
});

//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------
// Exit cleanly on request from parent process in development mode.
//------------------------------------------------------------------------------------------------
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => { if (data === 'graceful-exit') { app.quit(); } });
    } else {
        process.on('SIGTERM', () => { app.quit(); });
    }
}

//------------------------------------------------------------------------------------------------
