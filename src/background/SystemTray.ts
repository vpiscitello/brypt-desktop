//------------------------------------------------------------------------------------------------
'use strict'
//------------------------------------------------------------------------------------------------
import path from 'path';
import { app, Menu, Tray } from 'electron';
//------------------------------------------------------------------------------------------------

const Constants =
{
    BaseIconPath: 'assets/icons/dark-badge.png' as string,
    OpenIconPath: 'assets/icons/white-logo.png' as string
} as const;

//------------------------------------------------------------------------------------------------

export default class SystemTray
{
    public constructor()
    {
        this.tray = new Tray(path.join(__static, Constants.BaseIconPath));

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Brypt Desktop',
                type: 'normal',
                icon: path.join(__static, Constants.OpenIconPath),
                enabled: false,
                click: (item, window, event) => {
                    
                }
            },
            { type: 'separator' },
            { role: 'quit' },
        ]);

        this.tray.setContextMenu(contextMenu);
    }

    //------------------------------------------------------------------------------------------------

    private readonly tray: Tray;
}

//------------------------------------------------------------------------------------------------
