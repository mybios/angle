///<reference path="./d/update.d.ts"/>
///<reference path="./source-map.ts"/>

(<any>global).uncaughtException = function (err: Error | string) {

    if (typeof (err) == "string")
    {
        throw new Error(<string>err);
    }
    else
    {
        let errString = String((<any>err).stack).toString();
        var sourceMapStack = restoreStacktrace(errString);
        //打印出错误
        console.log("originStack:", errString);
        console.log("sourceMappingStack:", sourceMapStack);
        cc.ExtTools.showMessageBox(sourceMapStack, "脚本出错");
    }
};

if (cc.Application.getInstance ().getTargetPlatform () == cc.ApplicationProtocolPlatform.OS_ANDROID)
{
    cc.PluginManager.getInstance ().createPlugin ("device" , "com/joycombo/plugin/Device");
    //cc.PluginManager.getInstance ().createPlugin ("LocationManager" , "com/joycombo/plugin/LocationManager");
}
else if (cc.Application.getInstance ().getTargetPlatform () == cc.ApplicationProtocolPlatform.OS_IPAD
    || cc.Application.getInstance ().getTargetPlatform () == cc.ApplicationProtocolPlatform.OS_IPHONE)
{
    cc.PluginManager.getInstance ().createPlugin ("device" , "PluginDevice");
    //cc.PluginManager.getInstance ().createPlugin ("LocationManager" , "LocationManager");
}
//加载RomSetting
cc.ExtTools.excuteString(cc.FileSystem.getStringFromFile("romFiles/RomSetting.js"));