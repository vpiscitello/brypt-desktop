//------------------------------------------------------------------------------------------------
'use strict'
//------------------------------------------------------------------------------------------------
import StartupOptions from './StartupOptions';
import SystemTray from './SystemTray';
import MainWindow from './MainWindow';
//------------------------------------------------------------------------------------------------
import { app, dialog, protocol, BrowserWindow, Main } from 'electron';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
//------------------------------------------------------------------------------------------------
const isDevelopment = process.env.NODE_ENV !== 'production';
//------------------------------------------------------------------------------------------------

const ApplicationElements = {
    Options: null as StartupOptions | null,
    SystemTray: null as SystemTray | null,
    MainWindow: null as MainWindow | null,
};

//------------------------------------------------------------------------------------------------

function FetchStartupOptions()
{
    if (ApplicationElements.Options) { return; }

    ApplicationElements.Options = new StartupOptions(app.getAppPath());
    if (!ApplicationElements.Options.Parse()) {
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
    if(!ApplicationElements.Options) { app.quit(); return; }

    ApplicationElements.SystemTray = new SystemTray();
    ApplicationElements.MainWindow = new MainWindow(ApplicationElements.Options);
    ApplicationElements.MainWindow.Initialize();
});

//------------------------------------------------------------------------------------------------
// Activation handler. On MacOS, exiting all windows will not completely quit the app. This 
// will recreate the window when reactivated. 
//------------------------------------------------------------------------------------------------
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        if (!ApplicationElements.Options) { FetchStartupOptions(); }
        if (!ApplicationElements.MainWindow && ApplicationElements.Options) {
            ApplicationElements.MainWindow = new MainWindow(ApplicationElements.Options);
            ApplicationElements.MainWindow.Initialize();
        }
    }
});

//------------------------------------------------------------------------------------------------
// Application window close handler. On MacOS, it is common for applications to hold the process 
// open even if all windows have been closed. This will quit the application on all other 
// operating systems. 
//------------------------------------------------------------------------------------------------
app.on('window-all-closed', () => {});

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
