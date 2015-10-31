///<reference path="FileListUpdate.ts"/>
/**
 * Created by TreyTang on 2015/7/17.
 */
module game
{
    export module preUpdate
    {
        export class PackageUpdate
        {
            localPart:PackagePartInfo;
            serverPart:PackagePartInfo;
            endCallFunc : func;
            checkFinishCallFunc:func;
            constructor(localPart:PackagePartInfo ,serverPart:PackagePartInfo ,checkFinishCallFunc : func,endCallFunc : func)
            {
                this.localPart = localPart;
                this.serverPart = serverPart;
                if(checkFinishCallFunc)
                    this.checkFinishCallFunc = checkFinishCallFunc;
                if(endCallFunc)
                    this.endCallFunc = endCallFunc;
            }

            packageCheckUpdate(checkFunc:func)
            {
                let me = this;

                let apkFilesInfo:FilesInfo;
                let apkFileStream = updateTools.getFileFromAPK(me.serverPart.packageJson);
                if(apkFileStream)
                {
                    let apkFileClientStream = FileHelper.readFromClientStream (apkFileStream);
                    apkFileStream.clear();
                    apkFilesInfo = JSON.parse (apkFileClientStream.formatString ());
                    apkFileClientStream.clear();
                }

                let sdCardFilesInfo : FilesInfo;
                let sdCardStream = updateTools.getFileFromSDCard (me.serverPart.packageJson);
                if(sdCardStream)
                {
                    let sdCardClientStream = FileHelper.readFromClientStream (sdCardStream);
                    sdCardStream.clear ();
                    sdCardFilesInfo = JSON.parse (sdCardClientStream.formatString ());
                    sdCardClientStream.clear ();
                }

                if(apkFilesInfo)
                {
                    //如果apk中为最新
                    if (apkFilesInfo.md5 === me.serverPart.md5)
                    {
                        //如果sdCard中有残留文件，全部删掉
                        if(sdCardFilesInfo)
                        {
                            for (let fileName in sdCardFilesInfo.files)
                            {
                                let fileInfo = sdCardFilesInfo.files[fileName];
                                updateTools.removeFromSDCard(fileInfo.md5);
                            }
                            updateTools.removeFromSDCard(me.serverPart.packageJson);
                        }
                        for (let fileName in apkFilesInfo.files)
                        {
                            let fileInfo = apkFilesInfo.files[fileName];
                            updateTools.addFileToSystem (fileInfo.isRomFile , fileInfo);
                        }
                        checkFunc(me.serverPart.package);
                        if (me.checkFinishCallFunc)
                            me.checkFinishCallFunc (me.serverPart.package);
                        me.finished (false);
                        return;
                    }
                }

                //如果apk不是最新，那么需要下载服务器的xml文件去对比
                print("下载文件：" + me.serverPart.packageJson);
                let localFilesInfo:FilesInfo = sdCardFilesInfo || apkFilesInfo;
                FileHelper.downLoad (RomSetting.UpdateHttpServer + me.serverPart.packageJson , function (status:string , data:cc.MemoryDataStreamWrap)
                {
                    if (status === "successed")
                    {
                        var serverUpdate = FileHelper.readFromServerStream (data);
                        data.clear ();
                        let serverFilesInfo:FilesInfo = JSON.parse (serverUpdate.formatString ());

                        serverUpdate.clear ();

                        var fileUpdate = new FileListUpdate(me.serverPart , serverFilesInfo , localFilesInfo,function(){
                            if(me.checkFinishCallFunc)
                                me.checkFinishCallFunc(me.serverPart.package);
                        },function(isUpdated:boolean){
                            //覆盖文件列表文件。
                            if(isUpdated)
                            {
                                let newStream = cc.MemoryDataStreamWrap.createDynamicMemoryDataStream ();
                                newStream.writeString (JSON.stringify (serverFilesInfo));
                                //updateTools.saveFile (newStream , me.serverPart.packageJson + "1");//test
                                let saveStream = FileHelper.convertToClientStream (newStream);
                                newStream.clear ();
                                updateTools.saveFile (saveStream , me.serverPart.packageJson);
                                saveStream.clear ();
                            }
                            me.finished (isUpdated);
                        });
                        fileUpdate.fileListCheckUpdate ();
                        checkFunc(me.serverPart.package);
                    }
                    else
                    {
                        console.log("连接错误");
                        preEventManager.dispatchEvent(preEvent.updateError,"更新出错");
                    }
                });
            }

            finished(updated : boolean){
                if(this.endCallFunc)
                    this.endCallFunc(this.serverPart.package,updated);
            }

        }
    }
}