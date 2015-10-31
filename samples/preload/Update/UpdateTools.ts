///<reference path="../FileHelper.ts"/>
///<reference path="../CommonInfo.ts"/>
/**
 * Created by TreyTang on 2015/7/17.
 */
module game
{
    cc.Widget.prototype.registerClick = function (callfunc:(point:point_table)=>void)
    {
        let me = this;
        me.addTouchEventListener (function (target:cc.Widget , eventType:number , touch:cc.Touch , event:cc.Event)
        {
            if (eventType == cc.TouchEventType.ENDED)
            {
                callfunc.call(me,touch.getLocation ());
            }
            return true;
        });
    };
    //let fs = require("fs");
    cc.AFTER_PRELOAD_EVENT_NAME = "GAME_AFTER_PRELOAD";
    export module preUpdate
    {
        export let preEventManager = new game.tools.CustomEventManager();
        export let preEvent = {
            updateFinish : "updateFinish",
            updateError : "updateError",
            updateMessage : "updateMessage",
            updateRestart : "updateRestart",
            fileDownloaded : "fileDownloaded",
            fileChecked : "fileChecked"
        };
        export module updateTools
        {
            export function saveFile (clientStream:cc.MemoryDataStreamWrap , fileName:string)
            {
                clientStream.saveToFile (SDCardFolder + fileName);
            }

            export function getLocalFile (fileName:string):cc.MemoryDataStreamWrap
            {
                if (cc.FileSystem.fileExists (SDCardFolder + fileName))
                {
                    return FileHelper.readData (SDCardFolder + fileName);
                }
                if (cc.FileSystem.fileExists (APKFolder + fileName))
                {
                    return FileHelper.readData (APKFolder + fileName);
                }
                return undefined;
            }

            export function getFileFromSDCard(fileName:string):cc.MemoryDataStreamWrap
            {
                if (cc.FileSystem.fileExists (SDCardFolder + fileName))
                {
                    return FileHelper.readData (SDCardFolder + fileName);
                }
                return undefined;
            }

            export function getFileFromAPK(fileName:string):cc.MemoryDataStreamWrap
            {
                if (cc.FileSystem.fileExists (APKFolder + fileName))
                {
                    return FileHelper.readData (APKFolder + fileName);
                }
                return undefined;
            }


            export function removeFromSDCard (fileName:string)
            {
                //for test
                //这个路径需要修改
                //let base = cc.FileUtils.getInstance ().getWritablePath ();
                //base = base.replace (/storage.?$/g , "");
                //let path = base + SDCardFolder;

                if (cc.FileSystem.fileExists (SDCardFolder + fileName))
                {
                    cc.ExtTools.removeFile (SDCardFolder + fileName);
                }
            }

            export function runInNextFrame (func:Function , ...args:any[]):void
            {
                cc.Director.getInstance ().getScheduler ().performFunctionInCocosThread (function ()
                {
                    func (args);
                });
            }

            export function isExistInSDCard (fileName:string):boolean
            {
                return cc.FileSystem.fileExists (SDCardFolder + fileName);
            }

            export function isExistInAPK (fileName:string):boolean
            {
                return cc.FileSystem.fileExists (APKFolder + fileName);
            }

            export function addFileToSystem (isRomFile:boolean , fileInfo:FilePartInfo)
            {
                let info = {
                    isRomFile : isRomFile ,
                    origin : fileInfo.origin ,
                    name : fileInfo.name ,
                    md5 : fileInfo.md5 ,
                    size : fileInfo.size ,
                    realFilePath : ""
                };
                if (isRomFile == RomType.APK)
                    info.realFilePath = APKFolder + fileInfo.md5;
                else
                    info.realFilePath = SDCardFolder + fileInfo.md5;
                fileInfo.isRomFile = isRomFile;
                fileInfo.realFilePath = info.realFilePath;
                cc.FilePackage.getInstance ().addFile (info);
            }
        }
    }
}