//------------------------------------------------------------------------------------------------
'use strict'
//------------------------------------------------------------------------------------------------
import StartupOptions from './StartupOptions';
//------------------------------------------------------------------------------------------------
import path from 'path';
import { BrowserWindow} from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
//------------------------------------------------------------------------------------------------

const Constants =
{
    FileProtocol: 'app' as string,
    AppContentPage: 'app://./index.html' as string,
    BaseIconPath: 'assets/icons/dark-badge.png' as string
} as const;

//------------------------------------------------------------------------------------------------

export default class MainWindow
{
    public constructor(options : StartupOptions)
    {
        const [width, height] = options.GetWindowDimensions();
        const [x, y] = options.GetWindowPosition();
    
        this.window = new BrowserWindow({
            x, y, width, height, 
            icon: path.join(__static, Constants.BaseIconPath),
            webPreferences: {
                nodeIntegration: (process.env.ELECTRON_NODE_INTEGRATION as unknown) as boolean
            }
        });
    
        this.window.on('close', () => {
            const {x, y, width, height} = this.window.getBounds();
            options.Update({ x, y, width, height });
            options.Serialize();
        });
    }

    //------------------------------------------------------------------------------------------------

    public async Initialize(): Promise<void>
    {
        const { window } = this;
        // If the application is in development mode, load application content through the development
        // server. Otherwise, load the index file directly. 
        if (process.env.WEBPACK_DEV_SERVER_URL) {
            await this.window.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
            if (!process.env.IS_TEST) { window.webContents.openDevTools(); }
        } else {
            createProtocol(Constants.FileProtocol);
            this.window.loadURL(Constants.AppContentPage);
        }
    }
    
    //------------------------------------------------------------------------------------------------

    private readonly window: BrowserWindow;
}

//------------------------------------------------------------------------------------------------
