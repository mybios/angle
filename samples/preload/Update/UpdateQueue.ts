/**
 * Created by TreyTang on 2015/8/10.
 */

module game
{
    export module preUpdate
    {
        export let totalDownloadSize = 0;
        export let downloadedSize = 0;

        export let totalFileCount = 0;
        export let checkedFileCount = 0;

        class StepQueue
        {
            private que : Array<func> = [];
            //private isRunning : boolean = false;
            private isUpdateStop: boolean = false;
            private eachSize:number;
            constructor(eachSize :number = 5)
            {
                this.eachSize = eachSize;
            }

            add(func:func)
            {
                this.que.push(func);
            }

            start()
            {
                let me = this;
                me.eachUpdate();
            }

            stop()
            {
                this.isUpdateStop = true;
                this.clear();
            }

            isStopped():boolean
            {
                return this.isUpdateStop;
            }

            private clear()
            {
                this.que.length = 0;
            }

            private eachUpdate()
            {
                var me = this;
                for(var i = 0 ; i < me.eachSize && me.que.length > 0; i++)
                {
                    me.que.pop ()();
                }
                if(me.que.length > 0)
                {
                    updateTools.runInNextFrame(function(){
                        me.eachUpdate();
                    });
                }
            }
        }

        export let updateQue = new StepQueue(5);
        export let checkQue = new StepQueue(100);
    }
}