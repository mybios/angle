package.path = package.path .. "?;?.lua;preload/?.lua"
package.path = package.path .. ";preload/AutoUpdate/?.lua"
package.path = package.path .. ";preload/tools/?.lua"
require("preload");
require("PreloadTools")
if cc.Application:getInstance():getTargetPlatform() == 0 then
	-- 开启调试器
	--require("debugger")("127.0.0.1", 10000, "luaidekey")
end	


-- avoid memory leak
collectgarbage("setpause", 100)
collectgarbage("setstepmul", 5000)

local _logUploading = false;

-- 上传错误日志
function uploadLogs(msg)

	local err = "LUA ERROR: " .. tostring(msg) .. "\n" .. debug.traceback();
	print(err);

end

-- 调试信息
function __G__TRACKBACK__(msg)
	uploadLogs(msg);
end

-- 上传宕机日志的函数
function uploadDmpToftp()
	local platform = cc.Application:getInstance():getTargetPlatform()
	if platform == cc.PLATFORM_OS_WINDOWS then
		--print("window版本就不需要上传宕机日志了")
		return;
	end
	
	-- 拼接名字
	local name_file_prefix = "crash_" .. tostring(platform) .. "_" .. getDeviceCPUType()
	-- 上传下宕机日志
	cc.CURLManager:getInstance():postALLDump("123.59.61.12:33433" , "ftp_upload" , "ftp_163_com", name_file_prefix);
end


-- 根据屏幕大小匹配好资源尺寸
local function adaptResolutionSize()
	local glview = cc.Director:getInstance():getOpenGLView();
	local winSize = glview:getFrameSize();

	local resourceSize = {width = 1136 ; height = 640};
	-- 实际比率
	local radio = winSize.width / winSize.height;
	-- 标准比率
	local resourceRadio = resourceSize.width / resourceSize.height;

	print("实际分辨率" , winSize.width , winSize.height);

	local finalResourceSize;
	-- 比16:9还扁，就用标准高度，让宽度变宽
	if radio > resourceRadio then
		finalResourceSize = {width = resourceSize.width ; height = resourceSize.height};
		print("资源分辨率（固定宽度）" , finalResourceSize.width , finalResourceSize.height);
		glview:setDesignResolutionSize(finalResourceSize.width , finalResourceSize.height, 2);
	-- 比16:9高，就固定宽度，让高度变高
	else
		finalResourceSize = {width = resourceSize.width ; height = resourceSize.width / radio};
		print("资源分辨率" , finalResourceSize.width , finalResourceSize.height);
		glview:setDesignResolutionSize(finalResourceSize.width , finalResourceSize.height, 0);
	end
	if table.tostring then
		print("getWinSize" , table.tostring(cc.Director:getInstance():getWinSize()));
		print("getFrameSize" , table.tostring(glview:getFrameSize()));
		print("getDesignResolutionSize" , table.tostring(glview:getDesignResolutionSize()));
		print("finalResourceSize" , table.tostring(finalResourceSize));
	end
end


-- 侦听键盘返回键退出游戏
local function keyExitEvent()
	local function onKeyPressed(keyCode , event)
	end

	local function onOK(value)
		if tonumber(value) == 1 then
			cc.Director:getInstance():endToLua();
		end
	end

	local function onKeyReleased(keyCode , event)
		-- Windows的ESC 或 Android的返回键
		if keyCode == 6 and PluginDevice then
			local showed = false;
			if app and app.plugin then
				showed = app.plugin:showExit();
			end
			if not showed then
				-- 确认取消确认框
				local params = 
				{
					PLN.EXIT1;
					PLN.EXIT2;
					2; 
					onOK;
				}
				PluginDevice:callMemberMethod("showDialog"  , "(Ljava/lang/String;Ljava/lang/String;II)V" , params);
			end
		end
	end
	local listener = cc.EventListenerKeyboard:create(onKeyPressed , onKeyReleased);
	cc.Director:getInstance():getEventDispatcher():addEventListenerWithFixedPriority(listener, 1);
end


local function main()
	-- 屏幕常亮
	cc.Device:setKeepScreenOn(true);
	-- 打印设备信息
	devicePrintBaseInfo()
	-- initialize director
	local director = cc.Director:getInstance();
	local glview = director:getOpenGLView();
	if not glview then
		-- 把一个字符串分割成数组
		local function split(szFullString, szSeparator)   
			local nFindStartIndex = 1   
			local nSplitIndex = 1   
			local nSplitArray = {}   
			while true do   
			   local nFindLastIndex, endIndex= string.find(szFullString, szSeparator, nFindStartIndex)   
			   if not nFindLastIndex then   
				nSplitArray[nSplitIndex] = string.sub(szFullString, nFindStartIndex, string.len(szFullString))   
				break   
			   end   
			   nSplitArray[nSplitIndex] = string.sub(szFullString, nFindStartIndex, nFindLastIndex - 1)   
			   nFindStartIndex = endIndex + 1;   
			   nSplitIndex = nSplitIndex + 1   
			end   
			return nSplitArray   
		end
		local windowSize = {width = 1136, height = 640};
		--[[local args = split(CommandArguments , " ");
		for i , v in ipairs(args) do
			local vv = split(v , "=");
			if #vv == 2 then
				if vv[1] == "-size" then
					local size = split(vv[2] , "*");
					windowSize.width = size[1];
					windowSize.height = size[2];
				end
			end
		end--]]
		glview = cc.GLView:createWithRect("w3h", {x=0,y=0,width=windowSize.width,height=windowSize.height});
		director:setOpenGLView(glview);
	end
	-- 匹配屏幕尺寸
	adaptResolutionSize();

	local function applicationScreenSizeChanged()
		print("屏幕大小改变");
		adaptResolutionSize();
		local scene = cc.Director:getInstance():getRunningScene();
		if scene then
			local oldContentSize = scene:getContentSize();
			local newContentSize = glview:getDesignResolutionSize();
			-- 全部重新布局
			local function visit(node)
				if node.requestDoLayout then
					print("重新布局：" , node:getName());
					node:requestDoLayout();
				end
				if node.getContentSize then
					local size = node:getContentSize();
					if size.width == oldContentSize.width and size.height == oldContentSize.height then
						print("重新设置大小：" , node:getName());
						node:setContentSize(newContentSize);
					end
				end
				if node.updateSizeAndPosition then
					node:updateSizeAndPosition();
				end
			end
			scene:visitNode(visit);
		end
	end
	cc.Director:getInstance():getEventDispatcher():addEventListenerWithFixedPriority(cc.EventListenerCustom:create("applicationScreenSizeChanged" , applicationScreenSizeChanged) , 1);

	-- 侦听退出事件
	keyExitEvent();

	if cc.FilePackage:getInstance():isUsePackageFileSystem() then
	
		-- 载入打包的资源
		--[[if cc.FilePackage:getInstance():isUsePackageFileSystem() then
			cc.FilePackage:getInstance():parsePackageFile(cc.FileSystem:fullPath("assets/dataconfig.xml"));
			cc.FilePackage:getInstance():parsePackageFile(cc.FileSystem:fullPath("assets/res.xml"));
			cc.FilePackage:getInstance():parsePackageFile(cc.FileSystem:fullPath("assets/luaScript.xml"));
		end--]]

		local mainScene = cc.Scene:create();
		mainScene:setContentSize(glview:getDesignResolutionSize());
		mainScene:setAnchorPoint({x=0,y=0});

		director:runWithScene(mainScene);
		local updater;
		local function onState(name , value);
			print("OnEvent" , name , value);
			if name == "finish" then
				runInNextFrame(function()updater:destroy();require("luaScript/startup");end);
			end
		end
		updater = require("AutoUpdater"):new(loadRomScript("romFiles/RomSetting.lua") , onState , mainScene);
		runInNextFrame(function()runInNextFrame(function()
		updater:startUpdate();
		end)
		end)
	else
		require("luaScript/startup");
	end
end

xpcall(main, __G__TRACKBACK__)

print("main finish");