///<reference path="FileUpdate.ts"/>
///<reference path="UpdateQueue.ts"/>
/**
 * Created by TreyTang on 2015/7/17.
 */
module game
{
    export module preUpdate
    {
        export class FileListUpdate
        {
            localFilesInfo:FilesInfo;
            serverFilesInfo:FilesInfo
            serverPart:PackagePartInfo;
            checkEndFunc:func;
            endCallFunc:func;
            isUpdated : boolean  = false;
            checkedCount:number ;
            updatedCount:number ;

            constructor (serverPart:PackagePartInfo , serverFilesInfo:FilesInfo , localFilesInfo:FilesInfo , checkEndFunc : func,endCallFunc ?:func)
            {
                this.serverPart = serverPart;
                this.localFilesInfo = localFilesInfo;
                this.serverFilesInfo = serverFilesInfo;
                this.checkEndFunc = checkEndFunc;
                this.endCallFunc = endCallFunc;
                this.checkedCount = this.serverFilesInfo.fileCount;
                this.updatedCount = this.serverFilesInfo.fileCount;
            }

            removeNeedlessFile ()
            {
                if(!this.localFilesInfo) return;
                for (let fileName in this.localFilesInfo.files)
                {
                    //需要删掉
                    if (!this.serverFilesInfo.files[fileName])
                    {
                        let curFileName = this.localFilesInfo.files[fileName].md5;
                        updateTools.removeFromSDCard (curFileName);
                    }
                }
            }

            fileListCheckUpdate ()
            {
                let me = this;
                //先删掉多余的。
                me.removeNeedlessFile ();

                totalFileCount += me.serverFilesInfo.fileCount;

                //再检测更新
                for (let fileName in me.serverFilesInfo.files)
                {
                    let serverFile = me.serverFilesInfo.files[fileName];
                    let localFile:FilePartInfo;
                    if (me.localFilesInfo)
                        localFile = me.localFilesInfo.files[fileName];

                    let fileUpdate = new FileUpdate (me.serverPart , serverFile , localFile , function (name:string , isUpdated:boolean)
                    {
                        me.fileFinished (name , isUpdated);
                    });
                    (function(fileUpdate:FileUpdate){
                        checkQue.add (function ()
                        {
                            fileUpdate.fileCheckUpdate ();
                            me.checkFinished();
                        });
                    })(fileUpdate);
                }
            }

            checkFinished(fileName?:string)
            {
                this.checkedCount--;
                preEventManager.dispatchEvent(preEvent.fileChecked,1);
                if(this.checkedCount <= 0)
                {
                    if(this.checkEndFunc) this.checkEndFunc();
                }
            }

            fileFinished (fileName:string,isUpdated:boolean)
            {
                this.isUpdated = this.isUpdated || isUpdated;
                if (this.serverFilesInfo.files[fileName])
                {
                    this.updatedCount--;
                    if (this.updatedCount <= 0)
                        this.finished (this.isUpdated);
                }
            }

            finished (isUpdated:boolean)
            {
                if (this.endCallFunc)
                    this.endCallFunc (isUpdated);
            }
        }
    }
}