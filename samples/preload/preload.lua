--[[local socket = require("preload/tools/socket")

local nn = cc.Node:new();
local startTime = os.clock();


for i = 1 , 10000000 do
	nn:isVisible();
end
local endTime = os.clock();

print("tttttt" , endTime - startTime);
--]]
-- I6176 17:28:59: [LUA] tttttt	6.995
-- I4100 17:31:22: [LUA] tttttt	4.552

-- I9132 17:27:09: [LUA] tttttt	1.646

-- error("end");

require("preload/Plugin");
require("preload/preloadLanguage");

-- 载入ROM中的文件
local function loadRomFile(filename)
	return cc.FileSystem:getStringFromFile(cc.FileSystem:fullPath(filename));
end

-- 打开在ROM中的非加密脚本
local function loadRomScript(scriptFile)
	local luaScript = loadRomFile(scriptFile);
	if luaScript == nil then
		return nil;
	end
	local luaFunc = loadstring(luaScript);
	return luaFunc();
end
local RomSetting = loadRomScript("romFiles/RomSetting.lua");

require("preload/PluginDevice")

local umengChannelId = RomSetting.ChannelId;

if RomSetting.PlatformID == 31 then
	-- ios 版
	if cc.Application:getInstance():getTargetPlatform() == 4 or cc.Application:getInstance():getTargetPlatform() == 5 then

		NativePluginNetease = cc.PluginManager:getInstance():createPlugin("netease" , "PluginNetease");
		NativePluginNetease:callVoid("setDebugMode" , 1);

		local developerInfo = 
		{
			MultiChannel = false;
			ChannelCode = "";
			UMengKey = "5404629bfd98c508d9023b40";

			-- 网易渠道配置参数
			netease = 
			{
				PropInt = 
						{
							-- 横屏
							SCR_ORIENTATION = 4 + 8;
							-- HostId如果没有就传0
							USERINFO_HOSTID = 0;
							-- 启用游客登陆
							ENABLE_EXLOGIN_GUEST = 1;
							-- 启用微博登陆
							ENABLE_EXLOGIN_WEIBO = 1;
						};

				PropStr = 
						{
							APP_KEY = "jrt8ax7c7i9mxd1lmhc0nq5sr63wus";
							APP_CHANNEL = "netease";
						};
				PropUserInfo = 
						{
						};
				RegProduct = 
						{
							{
								Id = "com.joycombo.hero.ticket_6";
								Name = "60" .. PLN.TICKET;
								Price = 6;
								Ratio = 1;
								--Pids = {};
							};
							{
								Id = "com.joycombo.hero.ticket_30";
								Name = "300" .. PLN.TICKET;
								Price = 30;
								Ratio = 1;
							};
							{
								Id = "com.joycombo.hero.ticket_68";
								Name = "680" .. PLN.TICKET;
								Price = 68;
								Ratio = 1;
							};
							{
								Id = "com.joycombo.hero.ticket_198";
								Name = "1980" .. PLN.TICKET;
								Price = 198;
								Ratio = 1;
							};
							{
								Id = "com.joycombo.hero.ticket_328";
								Name = "3280" .. PLN.TICKET;
								Price = 328;
								Ratio = 1;
							};
							{
								Id = "com.joycombo.hero.ticket_648";
								Name = "6480" .. PLN.TICKET;
								Price = 648;
								Ratio = 1;
							};
						};
			};
		};
		NativePluginNetease:callVoid("configDeveloperInfo" , developerInfo);
	else
		NativePluginNetease = cc.PluginManager:getInstance():createPlugin("netease" , "com/joycombo/plugin/PluginNetease");

		local developerInfo = 
		{
			MultiChannel = false;
			ChannelCode = "";
			UMengKey = "5404629bfd98c508d9023b40";

			-- 网易渠道配置参数
			netease = 
			{
				PropInt = 
						{
							-- 横屏
							SCR_ORIENTATION = 2;
							-- HostId如果没有就传0
							USERINFO_HOSTID = 0;
							-- 启用游客登陆
							ENABLE_EXLOGIN_GUEST = 1;
							-- 启用微博登陆
							ENABLE_EXLOGIN_WEIBO = 1;
						};

				PropStr = 
						{
							--APP_KEY = "jrt8ax7c7i9mxd1lmhc0nq5sr63wus";
							--APP_CHANNEL = "netease";
						};
				PropUserInfo = 
						{
						};
				RegProduct = 
						{
							{
								Id = "ticket";
								Name = PLN.TICKET;
								Price = 0.1;
								Ratio = 10;
								--Pids = {};
							}
						};
			};
		};
		NativePluginNetease:callVoid("configDeveloperInfo" , developerInfo);
	end
	--umengChannelId = NativePluginNetease:callString("getAppChannel");
	--if umengChannelId == nil  or umengChannelId == "" then
	--	umengChannelId = RomSetting.ChannelId;
	--end
else
	-- android
	if cc.Application:getInstance():getTargetPlatform() == 3 then
		PluginUMeng = cc.PluginManager:getInstance():createPlugin("umeng" , "com/joycombo/plugin/PluginUmeng");
		PluginUMeng:callVoid("configDeveloperInfo" , {UMengKey = "5404629bfd98c508d9023b40" , TestinKey = "d41b2b268ffeaa3e4e71ed36e4ccf1be" , ChannelId = umengChannelId , PushKey = "nubsnUAGIM81TLCdoFw14pl5"});
	-- ios
	elseif cc.Application:getInstance():getTargetPlatform() == 4 or cc.Application:getInstance():getTargetPlatform() == 5 then
		PluginUMeng = cc.PluginManager:getInstance():createPlugin("umeng" , "PluginUmeng");
		PluginUMeng:call("configDeveloperInfo" , {UMengKey = "5417a645fd98c565d4063385" , TestinKey = "32419a6b66db7869551bc606d6676538" , ChannelId = umengChannelId});
	end
end
print("preload finish");