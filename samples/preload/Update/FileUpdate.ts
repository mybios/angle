///<reference path="UpdateQueue.ts"/>
/**
 * Created by TreyTang on 2015/7/17.
 */
module game
{
    export module preUpdate
    {
        export class FileUpdate
        {
            serverPart : PackagePartInfo;
            serverFile:FilePartInfo ;
            localFile:FilePartInfo;
            endCallFunc : func;

            constructor(serverPart : PackagePartInfo, serverFile:FilePartInfo , localFile:FilePartInfo , endCallFunc ?: func)
            {
                this.serverPart = serverPart;
                this.serverFile = serverFile;
                this.localFile = localFile;
                if(endCallFunc)
                    this.endCallFunc = endCallFunc;
            }

            fileCheckUpdate()
            {
                let me = this;

                //如果文件已经在apk中，如果sdcard中存在文件，直接删掉。
                if(updateTools.isExistInAPK(me.serverFile.md5))
                {
                    updateTools.removeFromSDCard(me.serverFile.md5);
                    updateTools.addFileToSystem (RomType.APK , me.serverFile);
                    me.finished(false);
                    return;
                }
                let sdCardFile = updateTools.getFileFromSDCard(me.serverFile.md5);
                if(sdCardFile)
                {
                    if(sdCardFile.getMd5() == me.serverFile.md5)
                    {
                        updateTools.addFileToSystem (RomType.SDCard , me.serverFile);
                        me.finished(false);
                        return;
                    }
                }

                totalDownloadSize += me.serverFile.size;
                updateQue.add (function ()
                {
                    FileHelper.downLoad (RomSetting.UpdateHttpServer + me.serverPart.package , function (status:string , data:cc.MemoryDataStreamWrap)
                    {
                        if (status === "successed")
                        {
                            //保存文件
                            var serverUpdate = FileHelper.serverStreamToClientStream (data);
                            data.clear ();
                            updateTools.saveFile (serverUpdate , me.serverFile.md5);
                            serverUpdate.clear();
                            if (me.localFile && me.localFile.md5 != me.serverFile.md5)
                            {
                                updateTools.removeFromSDCard (me.localFile.md5);
                            }
                            updateTools.addFileToSystem (RomType.SDCard , me.serverFile);
                            preEventManager.dispatchEvent(preEvent.fileDownloaded,me.serverFile.size);
                            me.finished(true);
                        }
                        else{
                            console.log("更新文件，网络错误");
                            preEventManager.dispatchEvent(preEvent.updateError,"更新出错");
                        }
                    } , me.serverFile.startPos , me.serverFile.size);
                });
            }

            finished(isUpdate:boolean)
            {
                if(this.endCallFunc)
                    this.endCallFunc(this.serverFile.name,isUpdate);
            }
        }
    }
}