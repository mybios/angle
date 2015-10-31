///<reference path="UpdateTools.ts"/>
///<reference path="PackageUpdate.ts"/>
/**
 * Created by TreyTang on 2015/7/15.
 */

module game
{
    export module preUpdate
    {
        let PRELOAD_PACKAGE = "preload.zip";
        export class AutoUpdate
        {
            serverConfig : PackagesInfo;
            localConfig:PackagesInfo;
            httpData : cc.MemoryDataStreamWrap;

            //1.获取服务器文件。
            private checkUpdateFile ()
            {
                var me = this;
                preEventManager.dispatchEvent(preEvent.updateMessage,"检查文件中...");
                FileHelper.downLoad (RomSetting.UpdateHttpServer + "Update.xml" , function (status:string , data:cc.MemoryDataStreamWrap)
                {
                    if (status === "successed")
                    {
                        me.httpData = data;
                        var serverUpdate = FileHelper.readFromServerStream (data);
                        me.serverConfig = JSON.parse (serverUpdate.formatString ());
                        serverUpdate.clear ();

                        //如果本地和服务器是匹配的，说明不需要再继续检测了。
                        if (cc.FilePackage.getInstance ().tryLoadFiles (me.serverConfig.hashCode))
                        {
                            me.finished(false);
                            return;
                        }
                        let localStream = updateTools.getLocalFile ("Update.xml");
                        let localUpdate = FileHelper.readFromServerStream (localStream);
                        me.localConfig = JSON.parse (localUpdate.formatString ());
                        localUpdate.clear ();
                        me.checkPreloadPackage ();
                    }else{
                        preEventManager.dispatchEvent(preEvent.updateError,"更新出错");
                    }
                });
            }

            checkPreloadPackage()
            {
                let me = this;
                totalDownloadSize = 0;
                downloadedSize = 0;
                if(me.serverConfig.packages[PRELOAD_PACKAGE])
                {
                    let serverPart:PackagePartInfo = me.serverConfig.packages[PRELOAD_PACKAGE];
                    let localPart:PackagePartInfo = me.localConfig.packages[PRELOAD_PACKAGE];

                    let packageUpdate = new PackageUpdate (localPart , serverPart , function(){
                        updateQue.start();
                    },function (packageName:string , updated:boolean){
                        me.packageUpdateFinish (packageName);
                        if(updated)
                        {
                            console.log("更新了preload，重新启动中。");
                            preEventManager.dispatchEvent(preEvent.updateRestart);
                        }else{
                            console.log("preload不需要更新，继续更新其他包。");
                            me.checkOtherPackageUpdate ();
                        }
                    });
                    packageUpdate.packageCheckUpdate (function(){
                        checkQue.start();
                    });

                }else{
                    me.checkOtherPackageUpdate ();
                }
            }

            checkOtherPackageUpdate ()
            {
                let me = this;
                let checkNames:{[key:string]:number} = {
                    checkFileLength : 0,
                    checkUpdateLength : 0
                };
                for (let index in me.serverConfig.packages)
                {
                    if(index == PRELOAD_PACKAGE)
                        continue;
                    checkNames[index] = 1;
                    checkNames["checkFileLength"] ++;
                    checkNames["checkUpdateLength"] ++;
                }

                totalDownloadSize = 0;
                downloadedSize = 0;

                totalFileCount = 0;
                checkedFileCount = 0;

                preEventManager.dispatchEvent(preEvent.updateMessage,"检查文件中...");
                for (let index in me.serverConfig.packages)
                {
                    if(index == PRELOAD_PACKAGE)
                        continue;
                    let serverPart:PackagePartInfo = me.serverConfig.packages[index];
                    let localPart:PackagePartInfo = me.localConfig.packages[index];

                    let packageUpdate = new PackageUpdate (localPart,serverPart,function(packageName:string){
                        if(checkNames[packageName])
                        {
                            checkNames["checkUpdateLength"]--;
                            //检查完所有文件之后，再统一开始下载文件。方便统计。
                            if(checkNames["checkUpdateLength"]<=0 )
                            {
                                preEventManager.dispatchEvent(preEvent.updateMessage,"开始下载文件...");
                                updateQue.start();
                            }
                        }else{
                            console.log("更新错误");
                            preEventManager.dispatchEvent(preEvent.updateError,"更新出错");
                        }
                    },function(packageName:string){
                        me.packageUpdateFinish(packageName);
                    });
                    //把所有文件加入到遍历队列中，然后再进行校验文件。
                    packageUpdate.packageCheckUpdate(function(packageName:string){
                        if(checkNames[packageName])
                        {
                            checkNames["checkFileLength"]--;
                            if(checkNames["checkFileLength"]<=0 )
                            {
                                checkQue.start();
                            }
                        }
                    });
                }

            }

            packageUpdateFinish(packageName:string)
            {
                this.serverConfig.fileCount -= this.serverConfig.packages[packageName].fileCount;
                if(this.serverConfig.fileCount <= 0)
                    this.finished(true);
            }

            finished(needUpdate : boolean)
            {
                let me = this;
                if(needUpdate){
                    cc.FilePackage.getInstance().saveFiles(SDCardFolder + packageFileCache);
                    //覆盖旧的update.xml文件
                    updateTools.saveFile (me.httpData , "Update.xml");
                }
                if(me.httpData) me.httpData.clear ();
                console.log("更新结束。");
                preEventManager.dispatchEvent(preEvent.updateFinish);
            }
            start ()
            {
                this.checkUpdateFile ();
            }
        }
    }
}