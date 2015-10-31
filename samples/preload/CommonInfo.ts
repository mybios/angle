/**
 * Created by TreyTang on 2015/7/16.
 */

module game
{
    export var RomType = {
        APK : true ,
        SDCard : false
    };

    export interface PackagePartInfo
    {
        md5: string,
        package: string,
        packageJson : string,
        fileCount:number
    }

    export interface FilePartInfo extends packageFileInfo_table
    {
        isRomFile: boolean;
        name: string;
        origin: string;
        realFilePath: string;
        md5: string;
        size: number;

        startPos : number;
    }

    export interface PackagesInfo
    {
        hashCode: string;
        packages:{[packageName:string]:PackagePartInfo};
        fileCount:number;
    }

    export interface FilesInfo
    {
        files : {[key:string]:FilePartInfo},
        fileCount : number,
        md5 : string
    }
    
    export var packageFileCache: string = "files.cache";
    //for test
    export var SDCardFolder: string = cc.FileUtils.getInstance().getWritablePath();
    export var APKFolder:string = "assets/";

    //export var APKFolder:string = "assets/";
    //export var SDCardFolder: string = cc.FileUtils.getInstance().getWritablePath();
}