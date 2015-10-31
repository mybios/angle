local AutoUpdater = {};
AutoUpdater.__index = AutoUpdater;

-- 创建新对象
function AutoUpdater:new(...)
	local instance = {};
	setmetatable(instance , AutoUpdater);
	instance:ctor(...);
	return instance;
end

-- 根据pvr支持情况来决定资源目录
function AutoUpdater:checkPvrSupport()
	local subfix = "png/";
	if isIOSPlatform() and cc.Configuration:getInstance():supportsPVRTC() then
		subfix = "pvr/";
	elseif isAndroidPlatform() and cc.Configuration:getInstance():supportsETC() then
		subfix = "etc/";
	end
	local newServer = {};
	for i , v in ipairs(self.FileServers) do
		newServer[i] = v .. subfix;
	end
	self.FileServers = newServer;
end

function AutoUpdater:ctor(setting , eventListener , mainScene)
	-- 保存全局配置
	self.Setting = setting;
	-- 进度处理器 function(eventName , eventText , eventValue)end;
	self.EventListener = eventListener;
	-- 下载器
	self.Downloader = require("Downloader"):new(self);
	-- 渲染视图
	self.View = require("AutoUpdaterView"):new(self, mainScene);

	-- 需要删除的文件列表
	self.NeedDeleteFiles = {};
	self.NeedParseFiles = {};
	self.NeedDownloadFileSize = 0;
	self.DownloadedFileSize = 0;
	self.FileParsed = 0;
	-- 文件总数量
	self.FileTotalCount = 0;
	self.IOSReviewMode = false;

    self.ParseFileHandle = cc.Director:getInstance():getScheduler():scheduleScriptFunc(function()self:parseFiles()end, 0, false)
end

function AutoUpdater:destroyParserFileHandle()
	if self.ParseFileHandle then
		cc.Director:getInstance():getScheduler():unscheduleScriptEntry(self.ParseFileHandle);
		self.ParseFileHandle = nil;
	end
end

-- 派发一个更新事件给外部侦听者
function AutoUpdater:dispatchEvent(eventName , eventValue)
	print("dispatchEvent" , eventName , eventValue);
	if eventName == "error" then
		self:destroyParserFileHandle();
	end
	self.View:onEvent(eventName , eventValue);
	self.EventListener(eventName , eventValue);

	if eventName == "error" then
		uploadLogs("AutoUpdate Error");
	end
end

function AutoUpdater:isIOSReviewMode()
	return self.IOSReviewMode;
end
-- 设置成苹果审核模式
function AutoUpdater:setIOSReviewMode()
	self.IOSReviewMode = true;
	print("设置成审核模式，重新下载");
	local newServer = {};
	for i , v in ipairs(self.FileServers) do
		print("更改服务器地址重新下载org " , newServer[i] , v);
		newServer[i] = v .. "review/";
		print("更改服务器地址重新下载new " , newServer[i]);
	end
	self.FileServers = newServer;
	-- 重新下载
	self:startUpdate();
end

function AutoUpdater:runFinish(updateData)
	if updateData then
		local targetFile = io.open(getWritableFullName("update.xml") , "wb");
		if targetFile == nil then
			print("写入文件：" , targetFilename , "时磁盘创建文件失败");
			self.Context:dispatchEvent("error" , PLN.DISK_FULL);
			return;
		end
		targetFile:write(updateData);
		targetFile:close();
	end
	self:destroyParserFileHandle();
	-- 删除该删除的文件
	self:deleteFiles();
	self:dispatchEvent("finish" , PLN.UPDATE_FINISH);
end

function AutoUpdater:destroy()
	-- 关闭更新界面
	self.View:onExit();
end

-- 下载完毕Update.xml
function AutoUpdater:onDownloadedUpdateXml(state , str)
	if state ~= "successed" then
		self:dispatchEvent("error" , PLN.NETWORK_ERROR);
		return;
	end

	self:dispatchEvent("info" , PLN.CHECKING_GAME_RES);
	local parser = require("UpdateXmlParser"):new(self , function()self:runFinish(str);end);
	parser:parse(str);
end


function AutoUpdater:updateFileServers(onEnd)
	local usertype = loadUsertype();

	local function onGetEnd(server)
		if not server then
			print("无法识别usertype：" .. tostring(usertype));
			self:dispatchEvent("error" , PLN.NETWORK_ERROR);
			return;
		end
		g_updateServer = server.updateserver;
		onEnd(server.updateserver);
	end
	getServerByUserType(usertype , self.Setting.UpdateHttpServer , onGetEnd);
end

function AutoUpdater:startUpdate()
	print("开始更新了！！！！！！");
	submitMonitor(10001 , 0);

	local function onEnd(fileServers)
		-- 保存文件服务器列表
		self.FileServers = split(fileServers , ",");
		self:checkPvrSupport();	

		local function onDownloadedUpdate(status , data)
			print("下载完毕update.xml" , status);
			self:onDownloadedUpdateXml(status , data);
		end
		-- 同时下载update.xml
		self:download("update.xml" , onDownloadedUpdate);
	end
	self:updateFileServers(onEnd);
end

-- 开始下载一个文件
function AutoUpdater:download(filePath , onUpdate , priority , startPos , dataSize)
	local onDownload
	-- 需要指定大小，则是游戏中下载资源
	if dataSize then
		self.NeedDownloadFileSize = self.NeedDownloadFileSize + dataSize;
		onDownload = function(...)
			self.DownloadedFileSize = self.DownloadedFileSize + dataSize;
			if self.FileParsed == self.FileTotalCount then
				local percent = self.DownloadedFileSize / self.NeedDownloadFileSize;
				self:dispatchEvent("downloadFile" , {text = string.format(PLN.DOWNLOADING_FILE , self.DownloadedFileSize / 1024 / 1024 , self.NeedDownloadFileSize / 1024 / 1024 , percent * 100) , percent = percent});
			end
			onUpdate(...);
		end
	else
		onDownload = onUpdate;
	end
	return self.Downloader:createTask(filePath , onDownload , priority , startPos , dataSize);
end

-- 指示需要删除这个文件，在全部更新完毕后才能删除
function AutoUpdater:needDelete(filePath)
	table.insert(self.NeedDeleteFiles , filePath);
end

-- 删除需要删除的文件
function AutoUpdater:deleteFiles()
	for i , v in pairs(self.NeedDeleteFiles) do
		os.remove(v);
	end
end

function AutoUpdater:needParse(parser)
	table.insert(self.NeedParseFiles , parser);
end

function AutoUpdater:noNeedParse(parser)
	self.FileTotalCount = self.FileTotalCount - 1;
end

function AutoUpdater:parseFiles()
	-- 每帧处理几个
	local parseCountPerFrame = 100;
	for i = 1 , parseCountPerFrame do
		if #self.NeedParseFiles > 0 then
			self.FileParsed = self.FileParsed + 1;
			local percent = self.FileParsed / self.FileTotalCount;
			self:dispatchEvent("checkFile" , {text = string.format(PLN.CHECKING_FILE , percent * 100) , percent = percent});
			self.NeedParseFiles[#self.NeedParseFiles]:parse();
			self.NeedParseFiles[#self.NeedParseFiles] = nil;
		end
	end
end

return AutoUpdater;