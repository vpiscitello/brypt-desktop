//------------------------------------------------------------------------------------------------
'use strict'
//------------------------------------------------------------------------------------------------
import path from 'path';
import fs, { unwatchFile } from 'fs';
import { readonly } from 'vue';
//------------------------------------------------------------------------------------------------

const Constants =
{
    Version: "0.0.0",
    VersionParts: [ 0, 0, 0 ],
    InitializationStateFilename: "config.json",
    WindowStateFilename: "window.json",
    EncodingType: 'utf-8'
} as const;

//------------------------------------------------------------------------------------------------

export default class StartupOptions
{
    constructor(applicationFilepath: string)
    {
        this.filepath = path.join(applicationFilepath, Constants.InitializationStateFilename);
        this.window = new WindowOptions(applicationFilepath);
    }

    //------------------------------------------------------------------------------------------------

    public Parse(): boolean
    {
        return this.window.Parse();
    }

    //------------------------------------------------------------------------------------------------

    public Update(window: Partial<WindowOptions> = {})
    {
        this.window.Update(window);
    }

    //------------------------------------------------------------------------------------------------

    public Serialize(): boolean
    {
        return this.window.Serialize();
    }
    
    //------------------------------------------------------------------------------------------------
    
    public GetWindowPosition(): Array<number | undefined>
    {
        const { x, y } = this.window;
        return [ x, y ];
    }

    //------------------------------------------------------------------------------------------------

    public GetWindowDimensions(): Array<number>
    {
        const { width, height } = this.window;
        return [ width, height ];
    }

    //------------------------------------------------------------------------------------------------

    readonly filepath: string;
    
    private window: WindowOptions;
};

//------------------------------------------------------------------------------------------------

class WindowOptions
{
    constructor(applicationFilepath: string, window: Partial<WindowOptions> = {})
    {
        this.filepath = path.join(applicationFilepath, Constants.WindowStateFilename);
        this.x = this.DefaultXPosition;
        this.y = this.DefaultYPosition;
        this.width = this.DefaultWidth;
        this.height = this.DefaultHeight;
    }
    
    //------------------------------------------------------------------------------------------------

    public Parse(): boolean
    {
        // Attempt to read the window state file. If the window state is not found or has no
        // content return true to indicate the file needs to be initialized. Otherwise, 
        // continue with the state parsing. 
        if (!fs.existsSync(this.filepath)) { return true; }

        let deserialized = null;
        try {
            deserialized = JSON.parse(fs.readFileSync(this.filepath, Constants.EncodingType));
        } catch(error) {}

        if (!deserialized) { return false; }

        if (typeof deserialized.version === 'undefined' || deserialized.version === null) {
            return false;
        }

        if (typeof deserialized.state === 'undefined' || deserialized.state === null) { 
            return false;
        }
    
        if (typeof deserialized.state.x !== 'undefined' && deserialized.state.x !== null) {
            this.x = deserialized.state.x;
        }

        if (typeof deserialized.state.y !== 'undefined' && deserialized.state.y !== null) {
            this.y = deserialized.state.y;
        }

        if (typeof deserialized.state.width !== 'undefined' && deserialized.state.width !== null) {
            this.width = deserialized.state.width;
        }

        if (typeof deserialized.state.height !== 'undefined' && deserialized.state.height !== null) {
            this.height = deserialized.state.height;
        }

        return true;
    }

    //------------------------------------------------------------------------------------------------

    public Update(other: Partial<WindowOptions> = {})
    {
        if (other !== null) {
            if (other.x !== undefined) { this.x = other.x; }
            if (other.y !== undefined) { this.y = other.y; }
            if (other.width !== undefined) { this.width = other.width; }
            if (other.height !== undefined) { this.height = other.height; }
        }
    }

    //------------------------------------------------------------------------------------------------

    public Serialize(): boolean
    {
        // Serialize only select items of the window options. Namely, we don't want to serialize the
        // constants and file information. 
        fs.writeFileSync(this.filepath, JSON.stringify(
            { 
                version: Constants.Version,
                state: {  x: this.x, y: this.y, width: this.width, height: this.height }
            }, null, 4));

        return true;
    }
    
    //------------------------------------------------------------------------------------------------
    
    readonly DefaultXPosition: undefined = undefined;
    readonly DefaultYPosition: undefined = undefined;
    readonly DefaultHeight: number = 600;
    readonly DefaultWidth: number = 800;

    readonly filepath: string;
    
    public x: number | undefined;
    public y: number | undefined;
    public width: number;
    public height: number;
}

//------------------------------------------------------------------------------------------------
