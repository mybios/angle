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
/**
 * Created by TreyTang on 2015/7/14.
 */
// version xml file
// file structure description xml file
// full addition file
//
var game;
(function (game) {
    var FileHelper = (function () {
        function FileHelper() {
        }
        FileHelper.getFilePath = function (path) {
            return path.replace(/^(.+[\\/])?([^\\/]+?)(\.[^\.\\/]*?)?$/gi, "$1");
        };
        FileHelper.getFileNameNoExtName = function (path) {
            return path.replace(/^(.+[\\/])?([^\\/]+?)(\.[^\.\\/]*?)?$/gi, "$2");
        };
        FileHelper.getFileName = function (path) {
            return path.replace(/^(.+[\\/])?([^\\/]+?\.[^\.\\/]*?)?$/gi, "$2");
        };
        FileHelper.getFileExtName = function (path) {
            return path.replace(/.+\./, "");
        };
        FileHelper.downLoad = function (path, func, startPos, dataSize) {
            if (dataSize)
                cc.CURLManager.getInstance().createTask(path, func, 0, startPos, dataSize);
            else if (startPos)
                cc.CURLManager.getInstance().createTask(path, func, 0, startPos);
            else
                cc.CURLManager.getInstance().createTask(path, func);
        };
        FileHelper.saveFile = function (stream, filePath) {
            filePath = FileHelper.fullPathForFilename(filePath);
            stream.saveToFile(filePath);
        };
        FileHelper.addToFile = function (stream, filePath) {
            filePath = FileHelper.fullPathForFilename(filePath);
            stream.addToFile(filePath);
        };
        FileHelper.fullPathForFilename = function (path) {
            return path;
        };
        FileHelper.readData = function (filePath) {
            filePath = FileHelper.fullPathForFilename(filePath);
            return cc.FileSystem.readData(filePath);
        };
        FileHelper.compress = function (source) {
            return cc.ExtTools.snappyCompress(source);
        };
        FileHelper.uncompress = function (source) {
            return cc.ExtTools.snappyUncompress(source);
        };
        FileHelper.decrypt = function (source) {
            return cc.ExtTools.decrypt(source);
        };
        FileHelper.encrypt = function (source) {
            return cc.ExtTools.encrypt(source);
        };
        FileHelper.createServerStream = function (filePath) {
            var stream1 = FileHelper.readData(filePath);
            var stream2 = FileHelper.encrypt(stream1);
            stream1.clear();
            var stream3 = FileHelper.compress(stream2);
            stream2.clear();
            return stream3;
        };
        FileHelper.createClientStream = function (filePath) {
            var stream1 = FileHelper.readData(filePath);
            var stream2 = FileHelper.encrypt(stream1);
            stream1.clear();
            return stream2;
        };
        FileHelper.readFromServerFile = function (filePath) {
            var stream1 = FileHelper.readData(filePath);
            var stream2 = FileHelper.uncompress(stream1);
            stream1.clear();
            var stream3 = FileHelper.decrypt(stream2);
            stream2.clear();
            return stream3;
        };
        FileHelper.readFromClientFile = function (filePath) {
            var stream1 = FileHelper.readData(filePath);
            var stream2 = FileHelper.decrypt(stream1);
            stream1.clear();
            return stream2;
        };
        FileHelper.readFromClientStream = function (stream) {
            return FileHelper.decrypt(stream);
        };
        FileHelper.readFromServerStream = function (stream) {
            var stream1 = FileHelper.uncompress(stream);
            var stream2 = FileHelper.decrypt(stream1);
            stream1.clear();
            return stream2;
        };
        FileHelper.clientStreamToServerStream = function (client) {
            return FileHelper.compress(client);
        };
        FileHelper.serverStreamToClientStream = function (server) {
            return FileHelper.uncompress(server);
        };
        FileHelper.convertToClientStream = function (stream) {
            return FileHelper.decrypt(stream);
        };
        FileHelper.convertToServerStream = function (stream) {
            var stream1 = FileHelper.encrypt(stream);
            var stream2 = FileHelper.compress(stream1);
            stream1.clear();
            return stream2;
        };
        return FileHelper;
    })();
    game.FileHelper = FileHelper;
})(game || (game = {}));
/**
 * Created by TreyTang on 2015/7/16.
 */
var game;
(function (game) {
    game.RomType = {
        APK: true,
        SDCard: false
    };
    game.packageFileCache = "files.cache";
    //for test
    game.SDCardFolder = cc.FileUtils.getInstance().getWritablePath();
    game.APKFolder = "assets/";
})(game || (game = {}));
///<reference path="../FileHelper.ts"/>
///<reference path="../CommonInfo.ts"/>
/**
 * Created by TreyTang on 2015/7/17.
 */
var game;
(function (game) {
    cc.Widget.prototype.registerClick = function (callfunc) {
        var me = this;
        me.addTouchEventListener(function (target, eventType, touch, event) {
            if (eventType == 2 /* ENDED */) {
                callfunc.call(me, touch.getLocation());
            }
            return true;
        });
    };
    //let fs = require("fs");
    cc.AFTER_PRELOAD_EVENT_NAME = "GAME_AFTER_PRELOAD";
    var preUpdate;
    (function (preUpdate) {
        preUpdate.preEventManager = new game.tools.CustomEventManager();
        preUpdate.preEvent = {
            updateFinish: "updateFinish",
            updateError: "updateError",
            updateMessage: "updateMessage",
            updateRestart: "updateRestart",
            fileDownloaded: "fileDownloaded",
            fileChecked: "fileChecked"
        };
        var updateTools;
        (function (updateTools) {
            function saveFile(clientStream, fileName) {
                clientStream.saveToFile(game.SDCardFolder + fileName);
            }
            updateTools.saveFile = saveFile;
            function getLocalFile(fileName) {
                if (cc.FileSystem.fileExists(game.SDCardFolder + fileName)) {
                    return game.FileHelper.readData(game.SDCardFolder + fileName);
                }
                if (cc.FileSystem.fileExists(game.APKFolder + fileName)) {
                    return game.FileHelper.readData(game.APKFolder + fileName);
                }
                return undefined;
            }
            updateTools.getLocalFile = getLocalFile;
            function getFileFromSDCard(fileName) {
                if (cc.FileSystem.fileExists(game.SDCardFolder + fileName)) {
                    return game.FileHelper.readData(game.SDCardFolder + fileName);
                }
                return undefined;
            }
            updateTools.getFileFromSDCard = getFileFromSDCard;
            function getFileFromAPK(fileName) {
                if (cc.FileSystem.fileExists(game.APKFolder + fileName)) {
                    return game.FileHelper.readData(game.APKFolder + fileName);
                }
                return undefined;
            }
            updateTools.getFileFromAPK = getFileFromAPK;
            function removeFromSDCard(fileName) {
                //for test
                //这个路径需要修改
                //let base = cc.FileUtils.getInstance ().getWritablePath ();
                //base = base.replace (/storage.?$/g , "");
                //let path = base + SDCardFolder;
                if (cc.FileSystem.fileExists(game.SDCardFolder + fileName)) {
                    cc.ExtTools.removeFile(game.SDCardFolder + fileName);
                }
            }
            updateTools.removeFromSDCard = removeFromSDCard;
            function runInNextFrame(func) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                cc.Director.getInstance().getScheduler().performFunctionInCocosThread(function () {
                    func(args);
                });
            }
            updateTools.runInNextFrame = runInNextFrame;
            function isExistInSDCard(fileName) {
                return cc.FileSystem.fileExists(game.SDCardFolder + fileName);
            }
            updateTools.isExistInSDCard = isExistInSDCard;
            function isExistInAPK(fileName) {
                return cc.FileSystem.fileExists(game.APKFolder + fileName);
            }
            updateTools.isExistInAPK = isExistInAPK;
            function addFileToSystem(isRomFile, fileInfo) {
                var info = {
                    isRomFile: isRomFile,
                    origin: fileInfo.origin,
                    name: fileInfo.name,
                    md5: fileInfo.md5,
                    size: fileInfo.size,
                    realFilePath: ""
                };
                if (isRomFile == game.RomType.APK)
                    info.realFilePath = game.APKFolder + fileInfo.md5;
                else
                    info.realFilePath = game.SDCardFolder + fileInfo.md5;
                fileInfo.isRomFile = isRomFile;
                fileInfo.realFilePath = info.realFilePath;
                cc.FilePackage.getInstance().addFile(info);
            }
            updateTools.addFileToSystem = addFileToSystem;
        })(updateTools = preUpdate.updateTools || (preUpdate.updateTools = {}));
    })(preUpdate = game.preUpdate || (game.preUpdate = {}));
})(game || (game = {}));
/**
 * Created by TreyTang on 2015/8/10.
 */
var game;
(function (game) {
    var preUpdate;
    (function (preUpdate) {
        preUpdate.totalDownloadSize = 0;
        preUpdate.downloadedSize = 0;
        preUpdate.totalFileCount = 0;
        preUpdate.checkedFileCount = 0;
        var StepQueue = (function () {
            function StepQueue(eachSize) {
                if (eachSize === void 0) { eachSize = 5; }
                this.que = [];
                //private isRunning : boolean = false;
                this.isUpdateStop = false;
                this.eachSize = eachSize;
            }
            StepQueue.prototype.add = function (func) {
                this.que.push(func);
            };
            StepQueue.prototype.start = function () {
                var me = this;
                me.eachUpdate();
            };
            StepQueue.prototype.stop = function () {
                this.isUpdateStop = true;
                this.clear();
            };
            StepQueue.prototype.isStopped = function () {
                return this.isUpdateStop;
            };
            StepQueue.prototype.clear = function () {
                this.que.length = 0;
            };
            StepQueue.prototype.eachUpdate = function () {
                var me = this;
                for (var i = 0; i < me.eachSize && me.que.length > 0; i++) {
                    me.que.pop()();
                }
                if (me.que.length > 0) {
                    preUpdate.updateTools.runInNextFrame(function () {
                        me.eachUpdate();
                    });
                }
            };
            return StepQueue;
        })();
        preUpdate.updateQue = new StepQueue(5);
        preUpdate.checkQue = new StepQueue(100);
    })(preUpdate = game.preUpdate || (game.preUpdate = {}));
})(game || (game = {}));
///<reference path="UpdateQueue.ts"/>
/**
 * Created by TreyTang on 2015/7/17.
 */
var game;
(function (game) {
    var preUpdate;
    (function (preUpdate) {
        var FileUpdate = (function () {
            function FileUpdate(serverPart, serverFile, localFile, endCallFunc) {
                this.serverPart = serverPart;
                this.serverFile = serverFile;
                this.localFile = localFile;
                if (endCallFunc)
                    this.endCallFunc = endCallFunc;
            }
            FileUpdate.prototype.fileCheckUpdate = function () {
                var me = this;
                //如果文件已经在apk中，如果sdcard中存在文件，直接删掉。
                if (preUpdate.updateTools.isExistInAPK(me.serverFile.md5)) {
                    preUpdate.updateTools.removeFromSDCard(me.serverFile.md5);
                    preUpdate.updateTools.addFileToSystem(game.RomType.APK, me.serverFile);
                    me.finished(false);
                    return;
                }
                var sdCardFile = preUpdate.updateTools.getFileFromSDCard(me.serverFile.md5);
                if (sdCardFile) {
                    if (sdCardFile.getMd5() == me.serverFile.md5) {
                        preUpdate.updateTools.addFileToSystem(game.RomType.SDCard, me.serverFile);
                        me.finished(false);
                        return;
                    }
                }
                preUpdate.totalDownloadSize += me.serverFile.size;
                preUpdate.updateQue.add(function () {
                    game.FileHelper.downLoad(RomSetting.UpdateHttpServer + me.serverPart.package, function (status, data) {
                        if (status === "successed") {
                            //保存文件
                            var serverUpdate = game.FileHelper.serverStreamToClientStream(data);
                            data.clear();
                            preUpdate.updateTools.saveFile(serverUpdate, me.serverFile.md5);
                            serverUpdate.clear();
                            if (me.localFile && me.localFile.md5 != me.serverFile.md5) {
                                preUpdate.updateTools.removeFromSDCard(me.localFile.md5);
                            }
                            preUpdate.updateTools.addFileToSystem(game.RomType.SDCard, me.serverFile);
                            preUpdate.preEventManager.dispatchEvent(preUpdate.preEvent.fileDownloaded, me.serverFile.size);
                            me.finished(true);
                        }
                        else {
                            console.log("更新文件，网络错误");
                            preUpdate.preEventManager.dispatchEvent(preUpdate.preEvent.updateError, "更新出错");
                        }
                    }, me.serverFile.startPos, me.serverFile.size);
                });
            };
            FileUpdate.prototype.finished = function (isUpdate) {
                if (this.endCallFunc)
                    this.endCallFunc(this.serverFile.name, isUpdate);
            };
            return FileUpdate;
        })();
        preUpdate.FileUpdate = FileUpdate;
    })(preUpdate = game.preUpdate || (game.preUpdate = {}));
})(game || (game = {}));
///<reference path="FileUpdate.ts"/>
///<reference path="UpdateQueue.ts"/>
/**
 * Created by TreyTang on 2015/7/17.
 */
var game;
(function (game) {
    var preUpdate;
    (function (preUpdate) {
        var FileListUpdate = (function () {
            function FileListUpdate(serverPart, serverFilesInfo, localFilesInfo, checkEndFunc, endCallFunc) {
                this.isUpdated = false;
                this.serverPart = serverPart;
                this.localFilesInfo = localFilesInfo;
                this.serverFilesInfo = serverFilesInfo;
                this.checkEndFunc = checkEndFunc;
                this.endCallFunc = endCallFunc;
                this.checkedCount = this.serverFilesInfo.fileCount;
                this.updatedCount = this.serverFilesInfo.fileCount;
            }
            FileListUpdate.prototype.removeNeedlessFile = function () {
                if (!this.localFilesInfo)
                    return;
                for (var fileName in this.localFilesInfo.files) {
                    //需要删掉
                    if (!this.serverFilesInfo.files[fileName]) {
                        var curFileName = this.localFilesInfo.files[fileName].md5;
                        preUpdate.updateTools.removeFromSDCard(curFileName);
                    }
                }
            };
            FileListUpdate.prototype.fileListCheckUpdate = function () {
                var me = this;
                //先删掉多余的。
                me.removeNeedlessFile();
                preUpdate.totalFileCount += me.serverFilesInfo.fileCount;
                //再检测更新
                for (var fileName in me.serverFilesInfo.files) {
                    var serverFile = me.serverFilesInfo.files[fileName];
                    var localFile = void 0;
                    if (me.localFilesInfo)
                        localFile = me.localFilesInfo.files[fileName];
                    var fileUpdate = new preUpdate.FileUpdate(me.serverPart, serverFile, localFile, function (name, isUpdated) {
                        me.fileFinished(name, isUpdated);
                    });
                    (function (fileUpdate) {
                        preUpdate.checkQue.add(function () {
                            fileUpdate.fileCheckUpdate();
                            me.checkFinished();
                        });
                    })(fileUpdate);
                }
            };
            FileListUpdate.prototype.checkFinished = function (fileName) {
                this.checkedCount--;
                preUpdate.preEventManager.dispatchEvent(preUpdate.preEvent.fileChecked, 1);
                if (this.checkedCount <= 0) {
                    if (this.checkEndFunc)
                        this.checkEndFunc();
                }
            };
            FileListUpdate.prototype.fileFinished = function (fileName, isUpdated) {
                this.isUpdated = this.isUpdated || isUpdated;
                if (this.serverFilesInfo.files[fileName]) {
                    this.updatedCount--;
                    if (this.updatedCount <= 0)
                        this.finished(this.isUpdated);
                }
            };
            FileListUpdate.prototype.finished = function (isUpdated) {
                if (this.endCallFunc)
                    this.endCallFunc(isUpdated);
            };
            return FileListUpdate;
        })();
        preUpdate.FileListUpdate = FileListUpdate;
    })(preUpdate = game.preUpdate || (game.preUpdate = {}));
})(game || (game = {}));
///<reference path="FileListUpdate.ts"/>
/**
 * Created by TreyTang on 2015/7/17.
 */
var game;
(function (game) {
    var preUpdate;
    (function (preUpdate) {
        var PackageUpdate = (function () {
            function PackageUpdate(localPart, serverPart, checkFinishCallFunc, endCallFunc) {
                this.localPart = localPart;
                this.serverPart = serverPart;
                if (checkFinishCallFunc)
                    this.checkFinishCallFunc = checkFinishCallFunc;
                if (endCallFunc)
                    this.endCallFunc = endCallFunc;
            }
            PackageUpdate.prototype.packageCheckUpdate = function (checkFunc) {
                var me = this;
                var apkFilesInfo;
                var apkFileStream = preUpdate.updateTools.getFileFromAPK(me.serverPart.packageJson);
                if (apkFileStream) {
                    var apkFileClientStream = game.FileHelper.readFromClientStream(apkFileStream);
                    apkFileStream.clear();
                    apkFilesInfo = JSON.parse(apkFileClientStream.formatString());
                    apkFileClientStream.clear();
                }
                var sdCardFilesInfo;
                var sdCardStream = preUpdate.updateTools.getFileFromSDCard(me.serverPart.packageJson);
                if (sdCardStream) {
                    var sdCardClientStream = game.FileHelper.readFromClientStream(sdCardStream);
                    sdCardStream.clear();
                    sdCardFilesInfo = JSON.parse(sdCardClientStream.formatString());
                    sdCardClientStream.clear();
                }
                if (apkFilesInfo) {
                    //如果apk中为最新
                    if (apkFilesInfo.md5 === me.serverPart.md5) {
                        //如果sdCard中有残留文件，全部删掉
                        if (sdCardFilesInfo) {
                            for (var fileName in sdCardFilesInfo.files) {
                                var fileInfo = sdCardFilesInfo.files[fileName];
                                preUpdate.updateTools.removeFromSDCard(fileInfo.md5);
                            }
                            preUpdate.updateTools.removeFromSDCard(me.serverPart.packageJson);
                        }
                        for (var fileName in apkFilesInfo.files) {
                            var fileInfo = apkFilesInfo.files[fileName];
                            preUpdate.updateTools.addFileToSystem(fileInfo.isRomFile, fileInfo);
                        }
                        checkFunc(me.serverPart.package);
                        if (me.checkFinishCallFunc)
                            me.checkFinishCallFunc(me.serverPart.package);
                        me.finished(false);
                        return;
                    }
                }
                //如果apk不是最新，那么需要下载服务器的xml文件去对比
                print("下载文件：" + me.serverPart.packageJson);
                var localFilesInfo = sdCardFilesInfo || apkFilesInfo;
                game.FileHelper.downLoad(RomSetting.UpdateHttpServer + me.serverPart.packageJson, function (status, data) {
                    if (status === "successed") {
                        var serverUpdate = game.FileHelper.readFromServerStream(data);
                        data.clear();
                        var serverFilesInfo = JSON.parse(serverUpdate.formatString());
                        serverUpdate.clear();
                        var fileUpdate = new preUpdate.FileListUpdate(me.serverPart, serverFilesInfo, localFilesInfo, function () {
                            if (me.checkFinishCallFunc)
                                me.checkFinishCallFunc(me.serverPart.package);
                        }, function (isUpdated) {
                            //覆盖文件列表文件。
                            if (isUpdated) {
                                var newStream = cc.MemoryDataStreamWrap.createDynamicMemoryDataStream();
                                newStream.writeString(JSON.stringify(serverFilesInfo));
                                //updateTools.saveFile (newStream , me.serverPart.packageJson + "1");//test
                                var saveStream = game.FileHelper.convertToClientStream(newStream);
                                newStream.clear();
                                preUpdate.updateTools.saveFile(saveStream, me.serverPart.packageJson);
                                saveStream.clear();
                            }
                            me.finished(isUpdated);
                        });
                        fileUpdate.fileListCheckUpdate();
                        checkFunc(me.serverPart.package);
                    }
                    else {
                        console.log("连接错误");
                        preUpdate.preEventManager.dispatchEvent(preUpdate.preEvent.updateError, "更新出错");
                    }
                });
            };
            PackageUpdate.prototype.finished = function (updated) {
                if (this.endCallFunc)
                    this.endCallFunc(this.serverPart.package, updated);
            };
            return PackageUpdate;
        })();
        preUpdate.PackageUpdate = PackageUpdate;
    })(preUpdate = game.preUpdate || (game.preUpdate = {}));
})(game || (game = {}));
///<reference path="UpdateTools.ts"/>
///<reference path="PackageUpdate.ts"/>
/**
 * Created by TreyTang on 2015/7/15.
 */
var game;
(function (game) {
    var preUpdate;
    (function (preUpdate) {
        var PRELOAD_PACKAGE = "preload.zip";
        var AutoUpdate = (function () {
            function AutoUpdate() {
            }
            //1.获取服务器文件。
            AutoUpdate.prototype.checkUpdateFile = function () {
                var me = this;
                preUpdate.preEventManager.dispatchEvent(preUpdate.preEvent.updateMessage, "检查文件中...");
                game.FileHelper.downLoad(RomSetting.UpdateHttpServer + "Update.xml", function (status, data) {
                    if (status === "successed") {
                        me.httpData = data;
                        var serverUpdate = game.FileHelper.readFromServerStream(data);
                        me.serverConfig = JSON.parse(serverUpdate.formatString());
                        serverUpdate.clear();
                        //如果本地和服务器是匹配的，说明不需要再继续检测了。
                        if (cc.FilePackage.getInstance().tryLoadFiles(me.serverConfig.hashCode)) {
                            me.finished(false);
                            return;
                        }
                        var localStream = preUpdate.updateTools.getLocalFile("Update.xml");
                        var localUpdate = game.FileHelper.readFromServerStream(localStream);
                        me.localConfig = JSON.parse(localUpdate.formatString());
                        localUpdate.clear();
                        me.checkPreloadPackage();
                    }
                    else {
                        preUpdate.preEventManager.dispatchEvent(preUpdate.preEvent.updateError, "更新出错");
                    }
                });
            };
            AutoUpdate.prototype.checkPreloadPackage = function () {
                var me = this;
                preUpdate.totalDownloadSize = 0;
                preUpdate.downloadedSize = 0;
                if (me.serverConfig.packages[PRELOAD_PACKAGE]) {
                    var serverPart = me.serverConfig.packages[PRELOAD_PACKAGE];
                    var localPart = me.localConfig.packages[PRELOAD_PACKAGE];
                    var packageUpdate = new preUpdate.PackageUpdate(localPart, serverPart, function () {
                        preUpdate.updateQue.start();
                    }, function (packageName, updated) {
                        me.packageUpdateFinish(packageName);
                        if (updated) {
                            console.log("更新了preload，重新启动中。");
                            preUpdate.preEventManager.dispatchEvent(preUpdate.preEvent.updateRestart);
                        }
                        else {
                            console.log("preload不需要更新，继续更新其他包。");
                            me.checkOtherPackageUpdate();
                        }
                    });
                    packageUpdate.packageCheckUpdate(function () {
                        preUpdate.checkQue.start();
                    });
                }
                else {
                    me.checkOtherPackageUpdate();
                }
            };
            AutoUpdate.prototype.checkOtherPackageUpdate = function () {
                var me = this;
                var checkNames = {
                    checkFileLength: 0,
                    checkUpdateLength: 0
                };
                for (var index in me.serverConfig.packages) {
                    if (index == PRELOAD_PACKAGE)
                        continue;
                    checkNames[index] = 1;
                    checkNames["checkFileLength"]++;
                    checkNames["checkUpdateLength"]++;
                }
                preUpdate.totalDownloadSize = 0;
                preUpdate.downloadedSize = 0;
                preUpdate.totalFileCount = 0;
                preUpdate.checkedFileCount = 0;
                preUpdate.preEventManager.dispatchEvent(preUpdate.preEvent.updateMessage, "检查文件中...");
                for (var index in me.serverConfig.packages) {
                    if (index == PRELOAD_PACKAGE)
                        continue;
                    var serverPart = me.serverConfig.packages[index];
                    var localPart = me.localConfig.packages[index];
                    var packageUpdate = new preUpdate.PackageUpdate(localPart, serverPart, function (packageName) {
                        if (checkNames[packageName]) {
                            checkNames["checkUpdateLength"]--;
                            //检查完所有文件之后，再统一开始下载文件。方便统计。
                            if (checkNames["checkUpdateLength"] <= 0) {
                                preUpdate.preEventManager.dispatchEvent(preUpdate.preEvent.updateMessage, "开始下载文件...");
                                preUpdate.updateQue.start();
                            }
                        }
                        else {
                            console.log("更新错误");
                            preUpdate.preEventManager.dispatchEvent(preUpdate.preEvent.updateError, "更新出错");
                        }
                    }, function (packageName) {
                        me.packageUpdateFinish(packageName);
                    });
                    //把所有文件加入到遍历队列中，然后再进行校验文件。
                    packageUpdate.packageCheckUpdate(function (packageName) {
                        if (checkNames[packageName]) {
                            checkNames["checkFileLength"]--;
                            if (checkNames["checkFileLength"] <= 0) {
                                preUpdate.checkQue.start();
                            }
                        }
                    });
                }
            };
            AutoUpdate.prototype.packageUpdateFinish = function (packageName) {
                this.serverConfig.fileCount -= this.serverConfig.packages[packageName].fileCount;
                if (this.serverConfig.fileCount <= 0)
                    this.finished(true);
            };
            AutoUpdate.prototype.finished = function (needUpdate) {
                var me = this;
                if (needUpdate) {
                    cc.FilePackage.getInstance().saveFiles(game.SDCardFolder + game.packageFileCache);
                    //覆盖旧的update.xml文件
                    preUpdate.updateTools.saveFile(me.httpData, "Update.xml");
                }
                if (me.httpData)
                    me.httpData.clear();
                console.log("更新结束。");
                preUpdate.preEventManager.dispatchEvent(preUpdate.preEvent.updateFinish);
            };
            AutoUpdate.prototype.start = function () {
                this.checkUpdateFile();
            };
            return AutoUpdate;
        })();
        preUpdate.AutoUpdate = AutoUpdate;
    })(preUpdate = game.preUpdate || (game.preUpdate = {}));
})(game || (game = {}));
/**
 * Created by TreyTang on 2015/7/20.
 */
var game;
(function (game) {
    var preUpdate;
    (function (preUpdate) {
        var PreUpdateView = (function () {
            function PreUpdateView() {
            }
            PreUpdateView.prototype.start = function () {
                var _this = this;
                var director = cc.Director.getInstance();
                var scene = cc.Scene.createScene();
                scene.setContentSize(director.getWinSize());
                this.ui = loadUI("preload/res/g_gengxin.ui");
                scene.addChild(this.ui);
                if (director.getRunningScene())
                    director.replaceScene(scene);
                else
                    director.runWithScene(scene);
                this.update = new preUpdate.AutoUpdate();
                this.ui.getItem("ImageView_1").setVisible(false);
                this.ui.getItem("Button").registerClick(function () {
                    _this.ui.getItem("ImageView_1").setVisible(false);
                    //感觉重启比较稳妥一点。
                    _this.restart();
                });
                this.initEvent();
                this.updatePercent();
                this.update.start();
            };
            PreUpdateView.prototype.initEvent = function () {
                var me = this;
                preUpdate.preEventManager.addEventListener(preUpdate.preEvent.fileDownloaded, function (eventName, eventData) {
                    preUpdate.downloadedSize += eventData;
                    me.updatePercent();
                });
                preUpdate.preEventManager.addEventListener(preUpdate.preEvent.fileChecked, function (eventName, eventData) {
                    preUpdate.checkedFileCount += eventData;
                    me.checkPercent();
                });
                preUpdate.preEventManager.addEventListener(preUpdate.preEvent.updateRestart, function () {
                    me.restart();
                });
                preUpdate.preEventManager.addEventListener(preUpdate.preEvent.updateMessage, function (eventName, eventData) {
                    me.message(eventData);
                });
                preUpdate.preEventManager.addEventListener(preUpdate.preEvent.updateError, function (eventName, eventData) {
                    me.error(eventData);
                });
                preUpdate.preEventManager.addEventListener(preUpdate.preEvent.updateFinish, function () {
                    me.finish();
                });
            };
            PreUpdateView.prototype.restart = function () {
                console.log("update restart");
                var text = this.ui.getItem("TextBMFont");
                text.setText("Restart");
                preUpdate.updateTools.runInNextFrame(function () {
                    preUpdate.updateTools.runInNextFrame(function () {
                        cc.Application.getInstance().restart();
                    });
                });
            };
            PreUpdateView.prototype.error = function (message) {
                console.log("update error:", message);
                var text = this.ui.getItem("TextBMFont");
                text.setText(message);
                this.ui.getItem("ImageView_1").setVisible(true);
                preUpdate.updateQue.stop();
            };
            PreUpdateView.prototype.message = function (info) {
                console.log("update Message:", info);
                var text = this.ui.getItem("TextBMFont");
                text.setText(info);
            };
            PreUpdateView.prototype.finish = function () {
                console.log("update finish.");
                var loading = this.ui.getItem("LoadingBar");
                loading.setPercent(100);
                var text = this.ui.getItem("TextBMFont");
                text.setText("更新完成。进入游戏！");
                preUpdate.updateTools.runInNextFrame(function () {
                    preUpdate.updateTools.runInNextFrame(function () {
                        cc.Director.getInstance().getEventDispatcher().dispatchCustomEvent(cc.AFTER_PRELOAD_EVENT_NAME);
                    });
                });
            };
            PreUpdateView.prototype.updatePercent = function () {
                //更新中止了
                if (preUpdate.updateQue.isStopped())
                    return;
                var loading = this.ui.getItem("LoadingBar");
                loading.setPercent(preUpdate.totalDownloadSize ? preUpdate.downloadedSize * 100 / preUpdate.totalDownloadSize : 0);
                var text = this.ui.getItem("TextBMFont");
                var M = 1024 * 1024;
                text.setText("下载文件:" + (preUpdate.downloadedSize / M).toFixed(2) + "M/" + (preUpdate.totalDownloadSize / M).toFixed(2) + "M");
            };
            PreUpdateView.prototype.checkPercent = function () {
                var loading = this.ui.getItem("LoadingBar");
                loading.setPercent(preUpdate.totalFileCount ? preUpdate.checkedFileCount * 100 / preUpdate.totalFileCount : 0);
                var text = this.ui.getItem("TextBMFont");
                text.setText("检测文件:" + preUpdate.checkedFileCount + "/" + preUpdate.totalFileCount);
            };
            return PreUpdateView;
        })();
        preUpdate.PreUpdateView = PreUpdateView;
    })(preUpdate = game.preUpdate || (game.preUpdate = {}));
})(game || (game = {}));
///<reference path="./d/update.d.ts"/>
///<reference path="Update/AutoUpdate.ts"/>
///<reference path="PreUpdateView.ts"/>
/**
 * Created by TreyTang on 2015/7/14.
 */
var game;
(function (game) {
    // 根据屏幕大小匹配好资源尺寸
    function adaptResolutionSize() {
        var glview = cc.Director.getInstance().getOpenGLView();
        var winSize = glview.getFrameSize();
        var resourceSize = { width: 1136, height: 640 };
        // 实际比率
        var radio = winSize.width / winSize.height;
        // 标准比率
        var resourceRadio = resourceSize.width / resourceSize.height;
        print("实际分辨率", winSize.width, winSize.height);
        var finalResourceSize;
        // 比16:9还扁，就用标准高度，让宽度变宽
        if (radio > resourceRadio) {
            finalResourceSize = { width: resourceSize.width, height: resourceSize.height };
            print("资源分辨率（固定宽度）", finalResourceSize.width, finalResourceSize.height);
            glview.setDesignResolutionSize(finalResourceSize.width, finalResourceSize.height, 2);
        }
        else {
            finalResourceSize = { width: resourceSize.width, height: resourceSize.width / radio };
            print("资源分辨率", finalResourceSize.width, finalResourceSize.height);
            glview.setDesignResolutionSize(finalResourceSize.width, finalResourceSize.height, 0);
        }
        print("getWinSize", cc.Director.getInstance().getWinSize().width, cc.Director.getInstance().getWinSize().height);
        print("getFrameSize", glview.getFrameSize().width, glview.getFrameSize().height);
        print("getDesignResolutionSize", glview.getDesignResolutionSize().width, glview.getDesignResolutionSize().height);
        print("finalResourceSize", finalResourceSize.width, finalResourceSize.height);
    }
    var preUpdate;
    (function (preUpdate) {
        // 屏幕常亮
        cc.Device.setKeepScreenOn(true);
        // 匹配屏幕尺寸
        adaptResolutionSize();
        function applicationScreenSizeChanged() {
            print("屏幕大小改变");
            adaptResolutionSize();
            var scene = cc.Director.getInstance().getRunningScene();
            if (scene) {
                var oldContentSize = scene.getContentSize();
                var director = cc.Director.getInstance();
                var glview = director.getOpenGLView();
                var newContentSize = glview.getDesignResolutionSize();
                // 全部重新布局
                function visit(n) {
                    var node = n;
                    if ((node).requestDoLayout) {
                        //print("重新布局：" , node.getName());
                        (node).requestDoLayout();
                    }
                    if (node.getContentSize) {
                        var size = node.getContentSize();
                        if (size.width == oldContentSize.width && size.height == oldContentSize.height) {
                            //print("重新设置大小：" , node.getName());
                            node.setContentSize(newContentSize);
                        }
                    }
                    if (node.updateSizeAndPosition) {
                        node.updateSizeAndPosition();
                    }
                    return true;
                }
                scene.visitNode(visit);
            }
        }
        cc.Director.getInstance().getEventDispatcher().addEventListenerWithFixedPriority(cc.EventListenerCustom.createEventListenerCustom("applicationScreenSizeChanged", applicationScreenSizeChanged), 1);
        //let udpateUI = new PreUpdateView();
        //udpateUI.start();
        cc.FilePackage.getInstance().tryLoadFiles("");
        cc.Director.getInstance().getEventDispatcher().dispatchCustomEvent(cc.AFTER_PRELOAD_EVENT_NAME);
    })(preUpdate = game.preUpdate || (game.preUpdate = {}));
})(game || (game = {}));
//# sourceMappingURL=main.js.map