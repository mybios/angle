///<reference path="./d/update.d.ts"/>
///<reference path="Update/AutoUpdate.ts"/>
///<reference path="PreUpdateView.ts"/>
/**
 * Created by TreyTang on 2015/7/14.
 */



module game
{

// 根据屏幕大小匹配好资源尺寸
    function adaptResolutionSize()
    {
        let glview = cc.Director.getInstance().getOpenGLView();
        let winSize = glview.getFrameSize();

        let resourceSize = {width : 1136 , height : 640};
        // 实际比率

        let radio = winSize.width / winSize.height;
        // 标准比率

        let resourceRadio = resourceSize.width / resourceSize.height;

        print("实际分辨率" , winSize.width , winSize.height);

        let finalResourceSize : size_table;
        // 比16:9还扁，就用标准高度，让宽度变宽

        if( radio > resourceRadio ){
            finalResourceSize = {width : resourceSize.width , height : resourceSize.height};
            print("资源分辨率（固定宽度）" , finalResourceSize.width , finalResourceSize.height);
            glview.setDesignResolutionSize(finalResourceSize.width , finalResourceSize.height, 2);
            // 比16:9高，就固定宽度，让高度变高

        }else{
            finalResourceSize = {width : resourceSize.width , height : resourceSize.width / radio};
            print("资源分辨率" , finalResourceSize.width , finalResourceSize.height);
            glview.setDesignResolutionSize(finalResourceSize.width , finalResourceSize.height, 0);
        }
        print("getWinSize" , cc.Director.getInstance().getWinSize().width , cc.Director.getInstance().getWinSize().height);
        print("getFrameSize" , glview.getFrameSize().width , glview.getFrameSize().height);
        print("getDesignResolutionSize" , glview.getDesignResolutionSize().width , glview.getDesignResolutionSize().height);
        print("finalResourceSize" , finalResourceSize.width , finalResourceSize.height);
    }

    export module preUpdate
    {
        // 屏幕常亮
        cc.Device.setKeepScreenOn(true);

        // 匹配屏幕尺寸
        adaptResolutionSize();
        function applicationScreenSizeChanged()
        {
            print("屏幕大小改变");
            adaptResolutionSize();
            let scene = cc.Director.getInstance().getRunningScene();
            if( scene ){
                let oldContentSize = scene.getContentSize();
                let director = cc.Director.getInstance();
                let glview = director.getOpenGLView();
                let newContentSize = glview.getDesignResolutionSize();
                // 全部重新布局

                function visit(n : cc.Node):boolean{
                    let node = <cc.Layout>n;
                    if( (node).requestDoLayout ){
                        //print("重新布局：" , node.getName());
                        (node).requestDoLayout();
                    }
                    if( node.getContentSize ){
                        let size = node.getContentSize();
                        if( size.width == oldContentSize.width && size.height == oldContentSize.height ){
                            //print("重新设置大小：" , node.getName());
                            node.setContentSize(newContentSize);
                        }
                    }
                    if( node.updateSizeAndPosition ){
                        node.updateSizeAndPosition();
                    }
                    return true;
                }
                scene.visitNode(visit);
            }
        }
        cc.Director.getInstance().getEventDispatcher().addEventListenerWithFixedPriority(cc.EventListenerCustom.createEventListenerCustom("applicationScreenSizeChanged" , applicationScreenSizeChanged) , 1);


        //let udpateUI = new PreUpdateView();
        //udpateUI.start();

        cc.FilePackage.getInstance ().tryLoadFiles ("");
        cc.Director.getInstance().getEventDispatcher().dispatchCustomEvent(cc.AFTER_PRELOAD_EVENT_NAME);
    }
}