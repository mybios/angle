/**
 * Created by TreyTang on 2015/8/3.
 */
var game;
(function (game) {
    var setting;
    (function (setting) {
        setting.PLN = {
            DLG_TITLE: "窗口"
        };
    })(setting = game.setting || (game.setting = {}));
})(game || (game = {}));
// android
var game;
(function (game) {
    if (cc.Application.getInstance().getTargetPlatform() == 3 /* OS_ANDROID */) {
        function createArgumentSign(v) {
            var t = typeof (v);
            if (t === "number") {
                return "D";
            }
            else if (t === "boolean") {
                return "Z";
            }
            else if (t === "string") {
                return "Ljava/lang/String;";
            }
            else if (t === "function") {
                return "I";
            }
            else if (t === "object") {
                return "Lorg/json/JSONObject;";
            }
            else {
                console.log(" ! support type " + t);
            }
            return "";
        }
        function createMethodSign(args) {
            var argsType = "";
            for (var i in args) {
                argsType += createArgumentSign(args[i]);
            }
            return argsType;
        }
        cc.Plugin.prototype.callVoid = function (methodName) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var methodSign = "(" + createMethodSign(args) + ")V";
            print("callMemberMethod", methodName, methodSign, args);
            this.callMemberMethod(methodName, methodSign, args);
        };
        cc.Plugin.prototype.callInt = function (methodName) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var methodSign = "(" + createMethodSign(args) + ")I";
            print("callMemberMethod", methodName, methodSign, args);
            return this.callMemberMethod(methodName, methodSign, args);
        };
        cc.Plugin.prototype.callDouble = function (methodName) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var methodSign = "(" + createMethodSign(args) + ")D";
            print("callMemberMethod", methodName, methodSign, args);
            return this.callMemberMethod(methodName, methodSign, args);
        };
        cc.Plugin.prototype.callBool = function (methodName) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var methodSign = "(" + createMethodSign(args) + ")Z";
            print("callMemberMethod", methodName, methodSign, args);
            return this.callMemberMethod(methodName, methodSign, args);
        };
        cc.Plugin.prototype.callString = function (methodName) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var methodSign = "(" + createMethodSign(args) + ")Ljava/lang/String;";
            print("callMemberMethod", methodName, methodSign, args);
            return this.callMemberMethod(methodName, methodSign, args);
        };
    }
    else if (cc.Application.getInstance().getTargetPlatform() == 4 /* OS_IPHONE */
        || cc.Application.getInstance().getTargetPlatform() == 5 /* OS_IPAD */) {
        //cc.Plugin.prototype.call = cc.Plugin.prototype.callMemberMethod;
        cc.Plugin.prototype.callVoid = cc.Plugin.prototype.callMemberMethod;
        cc.Plugin.prototype.callInt = cc.Plugin.prototype.callMemberMethod;
        cc.Plugin.prototype.callDouble = cc.Plugin.prototype.callMemberMethod;
        cc.Plugin.prototype.callString = cc.Plugin.prototype.callMemberMethod;
        cc.Plugin.prototype.callBool = cc.Plugin.prototype.callMemberMethod;
    }
    else {
        function getCall(name) {
            return function (methodName) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                console.log(name + "is called");
            };
        }
        cc.Plugin.prototype.callVoid = getCall("callVoid");
        cc.Plugin.prototype.callInt = getCall("callInt");
        cc.Plugin.prototype.callDouble = getCall("callDouble");
        cc.Plugin.prototype.callString = getCall("callString");
        cc.Plugin.prototype.callBool = getCall("callBool");
    }
})(game || (game = {}));
/**
 * Created by TreyTang on 2015/5/14.
 */
var game;
(function (game) {
    var tools;
    (function (tools) {
        //管理事件
        var CustomEventManager = (function () {
            function CustomEventManager() {
                //事件监听的列表，最终列表的存储对象格式为 { eventName : {listenerId : listenerFunction } }
                this._eventListener = {};
            }
            //手动触发事件，触发时需要eventParam,如果有事件监听的话返回true
            CustomEventManager.prototype.dispatchEvent = function (eventName, eventData) {
                var isSolved = false;
                if (this._eventListener[eventName]) {
                    for (var listenerId in this._eventListener[eventName]) {
                        isSolved = true;
                        try {
                            var lis = this._eventListener[eventName][listenerId];
                            lis.func(eventName, eventData);
                            if (lis.isOnce)
                                this.removeListener(listenerId);
                        }
                        catch (exception) {
                            this.removeListener(listenerId);
                        }
                    }
                }
                return isSolved;
            };
            //添加事件监听
            CustomEventManager.prototype.addEventListener = function (eventName, listener, _isOnce) {
                if (!this._eventListener[eventName])
                    this._eventListener[eventName] = {};
                this._eventListener[eventName][CustomEventManager.__listener_index] = {
                    func: listener,
                    isOnce: _isOnce || false
                };
                return CustomEventManager.__listener_index++;
            };
            //添加事件监听,监听只执行一次
            CustomEventManager.prototype.addEventListenerOnce = function (eventName, listener) {
                if (!this._eventListener[eventName])
                    this._eventListener[eventName] = {};
                this._eventListener[eventName][CustomEventManager.__listener_index] = {
                    func: listener,
                    isOnce: true
                };
                return CustomEventManager.__listener_index++;
            };
            //通过ID删除监听
            CustomEventManager.prototype.removeListener = function (listenerId) {
                for (var eventName in this._eventListener) {
                    if (this._eventListener[eventName][listenerId])
                        delete this._eventListener[eventName][listenerId];
                }
            };
            //通过回调函数删除监听
            CustomEventManager.prototype.removeListenerByFunc = function (listenerFunc) {
                for (var eventName in this._eventListener) {
                    for (var listenerId in this._eventListener[eventName]) {
                        if (this._eventListener[eventName][listenerId].func == listenerFunc)
                            delete this._eventListener[eventName][listenerId];
                    }
                }
            };
            //删除事件eventName下所有的监听
            CustomEventManager.prototype.removeAllEventListenersForEvent = function (eventName) {
                if (this._eventListener[eventName])
                    delete this._eventListener[eventName];
            };
            //删除所有监听
            CustomEventManager.prototype.removeAllEventListeners = function () {
                delete this._eventListener;
                this._eventListener = {};
            };
            /*
             printAllEventListeners()
             {
             for(let eventName in this._eventListener)
             {
             for(let listenerId in this._eventListener[eventName])
             {
             console.log(eventName +  this._eventListener[eventName][listenerId]);
             }
             }
             }
             */
            // 判断是否有对某事件的监听
            CustomEventManager.prototype.hasListenedEvent = function (eventName) {
                if (this._eventListener[eventName])
                    return true;
                return false;
            };
            //用于记录事件的ID
            CustomEventManager.__listener_index = 0;
            return CustomEventManager;
        })();
        tools.CustomEventManager = CustomEventManager;
        // 全局事件派发
        tools.GlobalEvent = {
            PreUpdateFinished: "preUpdate_Finished",
            // 定义网络状态发生改变时，EventManager所发送的的事件名
            Connected: "net_connected",
            Connecting: "net_connecting",
            DisConnect: "net_disconnect",
            ConnectErrorState: "net_connect_error_state",
            StartReconnect: "start_reconnect",
            ReconnectFinished: "reconnect_finished",
            ReconnectReLogin: "reconnect_reLogin",
            // 界面操作的全局事件派发
            fadeInBegin: "node_fadeInBegin",
            fadeIn: "node_fadeIn",
            fadeInEnd: "node_fadeInEnd",
            fadeOutBegin: "node_fadeOutBegin",
            fadeOut: "node_fadeOut",
            fadeOutEnd: "node_fadeOutEnd",
            node_enter: "node_enter",
            node_enterTransitionDidFinish: "node_enterTransitionDidFinish",
            node_exitTransitionDidStart: "node_exitTransitionDidStart",
            node_exit: "node_exit",
        };
        tools.globalEventManager = new CustomEventManager();
    })(tools = game.tools || (game.tools = {}));
})(game || (game = {}));
var SourceMapConsumer = require('./source-map/source-map-consumer').SourceMapConsumer;
var endsWith = function (s, suffix) {
    return s.indexOf(suffix, s.length - suffix.length) !== -1;
};
var cachedSourceMaps = {};
function loadSourceMap(sourceFile) {
    var sourcemap = cachedSourceMaps[sourceFile];
    if (typeof (sourcemap) == "undefined") {
        var sourceMapFile = sourceFile + ".map";
        if (cc.FileUtils.getInstance().isFileExist(sourceMapFile)) {
            var sourceMapContent = cc.FileUtils.getInstance().getStringFromFile(sourceMapFile);
            sourcemap = new SourceMapConsumer(sourceMapContent);
            cachedSourceMaps[sourceFile] = sourcemap;
            return sourcemap;
        }
        else {
            cachedSourceMaps[sourceFile] = null;
            return null;
        }
    }
    else {
        return sourcemap;
    }
}
function restoreStacktrace(stacktrace) {
    var lines = stacktrace.split('\n');
    var result = '';
    lines.forEach(function (stackLineOrigin) {
        var stackLine = stackLineOrigin.trim();
        // chakra format stack
        if (stackLine.indexOf('at ') === 0) {
            var sourceUrl = stackLine.substring(stackLine.lastIndexOf('(') + 1, stackLine.lastIndexOf(')'));
            var bundleFile = sourceUrl.substring(0, sourceUrl.lastIndexOf(':', sourceUrl.lastIndexOf(':') - 1));
            var sourceLine = parseInt(sourceUrl.substring(sourceUrl.lastIndexOf(':', sourceUrl.lastIndexOf(':') - 1) + 1, sourceUrl.lastIndexOf(':')));
            var column = parseInt(sourceUrl.substring(sourceUrl.lastIndexOf(':') + 1, sourceUrl.length));
            var sourceMap = loadSourceMap(bundleFile);
            if (sourceMap == null) {
                result += stackLineOrigin;
                return;
            }
            var originalPosition = sourceMap.originalPositionFor({
                line: sourceLine,
                column: column
            });
            result += '    at ';
            result += stackLine.substring('at '.length, stackLine.lastIndexOf('('));
            if (typeof (originalPosition.name) == "string") {
                result += originalPosition.name;
            }
            result += ' (' + originalPosition.source + ':' + originalPosition.line + ':' + originalPosition.column + ')';
        }
        else {
            /*
            -		matches	[uncaughtException@preload/preload.js:7457:43,uncaughtException@,preload/preload.js:7457:43,preload/preload.js,7457,43,]	Object, (Array)
+		__proto__	[]	Object, (Array)
        index	0	Number
        input	"uncaughtException@preload/preload.js:7457:43"	String
        length	7	Number
        [0]	"uncaughtException@preload/preload.js:7457:43"	String
        [1]	"uncaughtException@"	String
        [2]	"preload/preload.js:7457:43"	String
        [3]	"preload/preload.js"	String
        [4]	"7457"	String
        [5]	"43"	String
        [6]	undefined	Undefined

            */
            // JavaScriptCore format stack
            var matches = stackLine.match(/(.+@)?((.+):([\d]+):([\d]+))|(\[.*\])/);
            if (((typeof matches != "undefined") && (matches != null)) && matches.length == 7) {
                if (typeof (matches[3]) == "string" && typeof (matches[4]) == "string" && typeof (matches[5]) == "string") {
                    var sourceMap = loadSourceMap(matches[3]);
                    if (sourceMap == null) {
                        result += '    at ';
                        result += stackLine;
                        return;
                    }
                    var originalPosition = sourceMap.originalPositionFor({
                        line: Number(matches[4]),
                        column: Number(matches[5])
                    });
                    result += '    at ';
                    if (typeof (matches[1]) == "string") {
                        result += matches[1];
                    }
                    result += ' (' + originalPosition.source + ':' + originalPosition.line + ':' + originalPosition.column + ')\n';
                    return;
                }
            }
            result += stackLineOrigin;
        }
        result += '\n';
    });
    return result;
}
///<reference path="./d/update.d.ts"/>
///<reference path="./source-map.ts"/>
global.uncaughtException = function (err) {
    if (typeof (err) == "string") {
        throw new Error(err);
    }
    else {
        var errString = String(err.stack).toString();
        var sourceMapStack = restoreStacktrace(errString);
        //打印出错误
        console.log("originStack:", errString);
        console.log("sourceMappingStack:", sourceMapStack);
        cc.ExtTools.showMessageBox(sourceMapStack, "脚本出错");
    }
};
if (cc.Application.getInstance().getTargetPlatform() == 3 /* OS_ANDROID */) {
    cc.PluginManager.getInstance().createPlugin("device", "com/joycombo/plugin/Device");
}
else if (cc.Application.getInstance().getTargetPlatform() == 5 /* OS_IPAD */
    || cc.Application.getInstance().getTargetPlatform() == 4 /* OS_IPHONE */) {
    cc.PluginManager.getInstance().createPlugin("device", "PluginDevice");
}
//加载RomSetting
cc.ExtTools.excuteString(cc.FileSystem.getStringFromFile("romFiles/RomSetting.js"));
//# sourceMappingURL=preload.js.map