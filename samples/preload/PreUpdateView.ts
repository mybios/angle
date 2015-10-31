/**
 * Created by TreyTang on 2015/7/20.
 */
module game
{
    export module preUpdate
    {

        export class PreUpdateView{
            ui : cc.UIFromFile;
            update : AutoUpdate;

            start()
            {
                let director = cc.Director.getInstance ();
                let scene = cc.Scene.createScene ();
                scene.setContentSize(director.getWinSize());

                this.ui = loadUI ("preload/res/g_gengxin.ui");
                scene.addChild (this.ui);

                if (director.getRunningScene ())
                    director.replaceScene (scene);
                else
                    director.runWithScene (scene);
                this.update = new AutoUpdate();
                this.ui.getItem("ImageView_1").setVisible(false);
                this.ui.getItem<cc.Button>("Button").registerClick(() => {
                    this.ui.getItem("ImageView_1").setVisible(false);
                    //感觉重启比较稳妥一点。
                    this.restart();
                });
                this.initEvent();
                this.updatePercent();
                this.update.start();
            }
            initEvent()
            {
                let me = this;
                preEventManager.addEventListener(preEvent.fileDownloaded,function(eventName:string , eventData : number){
                    downloadedSize+= eventData;
                    me.updatePercent();
                });
                preEventManager.addEventListener(preEvent.fileChecked,function(eventName:string , eventData : number){
                    checkedFileCount+= eventData;
                    me.checkPercent();
                });
                preEventManager.addEventListener(preEvent.updateRestart,function(){
                    me.restart();
                });
                preEventManager.addEventListener(preEvent.updateMessage,function(eventName:string , eventData : string){
                    me.message(eventData);
                });
                preEventManager.addEventListener(preEvent.updateError,function(eventName:string , eventData : string){
                    me.error(eventData);
                });
                preEventManager.addEventListener(preEvent.updateFinish,function(){
                    me.finish();
                });
            }

            restart()
            {
                console.log("update restart");
                let text = this.ui.getItem<cc.TextBMFont>("TextBMFont");
                text.setText("Restart");
                updateTools.runInNextFrame(function(){
                    updateTools.runInNextFrame(function(){
                        cc.Application.getInstance().restart();
                    });
                });
            }

            error(message:string)
            {
                console.log("update error:",message);
                let text = this.ui.getItem<cc.TextBMFont>("TextBMFont");
                text.setText(message);
                this.ui.getItem("ImageView_1").setVisible(true);
                updateQue.stop();
            }

            message(info:string)
            {
                console.log("update Message:",info);
                let text = this.ui.getItem<cc.TextBMFont>("TextBMFont");
                text.setText(info);
            }

            finish()
            {
                console.log("update finish.");
                let loading = this.ui.getItem<cc.LoadingBar>("LoadingBar");
                loading.setPercent(100);
                let text = this.ui.getItem<cc.TextBMFont>("TextBMFont");
                text.setText("更新完成。进入游戏！");
                updateTools.runInNextFrame(function(){
                    updateTools.runInNextFrame(function(){
                        cc.Director.getInstance().getEventDispatcher().dispatchCustomEvent(cc.AFTER_PRELOAD_EVENT_NAME);
                    });
                });
            }

            updatePercent()
            {
                //更新中止了
                if(updateQue.isStopped())
                    return;
                let loading = this.ui.getItem<cc.LoadingBar>("LoadingBar");
                loading.setPercent(totalDownloadSize ? downloadedSize * 100 / totalDownloadSize : 0);
                let text = this.ui.getItem<cc.TextBMFont>("TextBMFont");
                let M = 1024 * 1024;
                text.setText("下载文件:"+ (downloadedSize / M).toFixed(2)+ "M/" + (totalDownloadSize/ M).toFixed(2) + "M");
            }

            checkPercent()
            {
                let loading = this.ui.getItem<cc.LoadingBar>("LoadingBar");
                loading.setPercent(totalFileCount ? checkedFileCount * 100 / totalFileCount : 0);
                let text = this.ui.getItem<cc.TextBMFont>("TextBMFont");
                text.setText("检测文件:"+ checkedFileCount+ "/" + totalFileCount);
            }
        }
    }
}