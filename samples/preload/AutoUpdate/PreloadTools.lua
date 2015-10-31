

local instance = cc.FileUtils:getInstance();
print(instance , type(instance));

local writablePath = cc.FileUtils:getInstance():getWritablePath();

function handler(target, method)
    assert(method);
    return function(...)
        return method(target, ...)
    end
end

-- 是否是苹果操作系统
function isIOSPlatform()
	local targetPlatform = cc.Application:getInstance():getTargetPlatform();
	-- 苹果版本
	if (targetPlatform == 4 or targetPlatform == 5) then
		return true;
	else
		return false;
	end
end

-- 是否是Android操作系统
function isAndroidPlatform()
	local targetPlatform = cc.Application:getInstance():getTargetPlatform();
	-- Android版本
	if targetPlatform == 3 then
		return true;
	else
		return false;
	end
end


-- 获得应用程序版本
function getAppVersion()
	return PluginDevice:callString("getInfoValue" , "versionCode");
end

-- 从可写文件目录读取一个文件的原始数据
function getWritableFileData(fileName)
	local targetPath = writablePath .. fileName;
	local f = io.open(targetPath , "rb");
	if f then
		local data = f:read("*a");
		f:close();
		return data;
	else
		return nil;
	end
end

-- 可写文件目录中的文件是否存在
function isWritableFileExist(fileName)
	return cc.FileSystem:fileExists(writablePath .. fileName);
end

-- 获得一个文件在可写文件目录中的位置
function getWritableFullName(fileName)
	return writablePath .. fileName;
end

-- 从ROM读取原始文件数据
function getRomFileData(fileName)
	return cc.FileSystem:readData(fileName);
end

-- ROM中的文件是否存在
function isRomFileExist(fileName)
	return cc.FileSystem:fileExists(fileName);
end

-- 获得SD卡的剩余空间
function getSDCardFreeSize()
	local sdcardSize;
	local platformPlugin = PluginManager:getInstance():loadPlugin("AnalyticsPlatform");
	if platformPlugin then
		local params = PluginParamVector();
		local param = PluginParam();
		param:setString("SDCardFreeSize");
		params:push_back(param);
		local value = platformPlugin:callStringFuncWithParam("getInfoValue" , params);
		print("SDCARD剩余空间：" , value);
		sdcardSize = tonumber(value);
	end
	return sdcardSize;
end

-- 把一个字符串分割成数组
function split(szFullString, szSeparator)   
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


-- 检查文件内容是否等于md5
function checkFileMd5(filename , md5String)
	-- 读取整个文件数据
	local md5Result = cc.FilePackage:calcFileMd5(filename);
	if md5Result == md5String then
		print("校验文件：" , filename , "成功" , md5String);
		return true;
	else
		print("校验文件：" , filename , "失败" , "[" .. md5String .. "] != " , "[" .. md5Result .. "]");
		return false;
	end
end


-- 在下一帧执行一次函数func
function runInNextFrame(func , ...)
	local id
	local arg = {...}
	local function exec()
		cc.Director:getInstance():getScheduler():unscheduleScriptEntry(id);
		func(unpack(arg));
	end
	
	id = cc.Director:getInstance():getScheduler():scheduleScriptFunc(exec, 0, false)
end


-- 载入ROM中的文件
function loadRomFile(filename)
	return cc.FileSystem:getStringFromFile(cc.FileSystem:fullPath(filename));
end
-- 打开在ROM中的非加密脚本
function loadRomScript(scriptFile)
	local luaScript = loadRomFile(scriptFile);
	if luaScript == nil then
		return nil;
	end
	local luaFunc = loadstring(luaScript);
	return luaFunc();
end

-- 把1.0.1格式转换到数字格式
function string2VersionCode(str)
	if str == nil then
		return nil;
	end
	str = split(str, "%.");
	if #str ~= 3 then
		return nil;
	end	
	local ret = string.format("%04d%04d%04d" , str[1] , str[2] , str[3]);
	return tonumber(ret);
end


local g_isReviewVersion = false;
-- 是否是正在审核的版本
function isReviewVersion()
	return g_isReviewVersion;
end	

-- 从xml数据中获得服务器列表
function getFileServer(usertype , xmlData)
	print("获取用户类型：" , usertype , xmlData);

	-- 把所有记录保存到cfg
	local cfg = {};
	local function onStartElement(name , atts)			
		if name == "item" then
			cfg[atts.usertype] = atts;
		end
	end
	tiny.eval(xmlData , onStartElement);

	g_isReviewVersion = false;
	-- 处理审核服的问题
	if usertype == "0" then
		print("默认用户都要处理审核服的问题" , PluginDevice);
		local currentVersion = 1;
		if PluginDevice then
			local version = PluginDevice:callString("getInfoValue" , "versionName");
			print("获取应用版本号" , version);
			if version ~= nil and version ~= "" then
				currentVersion = string2VersionCode(version);
				print("code" , currentVersion);
			end
		end
		local appChannel;
		if NativePluginNetease then
			appChannel = NativePluginNetease:callString("getAppChannel");
		else
			local RomSetting = loadRomScript("romFiles/RomSetting.lua");
			appChannel = RomSetting.ChannelId;
		end
		print("appChannel" , appChannel);

		local allChannelCfgs = {};
		for i , v in pairs(cfg) do
			local cfgVersion = string2VersionCode(v.appversion);
			print("cfgVersion" , cfgVersion);
			-- 有定义最低版本号
			if cfgVersion ~= nil then
				-- 当前版本是审核版本
				if currentVersion >= cfgVersion then
					print("v.appchannel" , v.appchannel);
					if v.appchannel ~= nil then
						local channels = split(v.appchannel , "|");
						for ii , vv in ipairs(channels) do
							print("ii" , ii , vv);
							-- 渠道号绝对匹配上了
							if vv == appChannel then
								print("绝对匹配了渠道" , v.usertype , appChannel);
								-- 改成默认usertype
								v.usertype = "0";
								g_isReviewVersion = true;
								return v;
							-- 所有渠道通用的
							elseif vv == "all" then
								print("匹配所有渠道的" , v.usertype);
								table.insert(allChannelCfgs , v);
							-- 不匹配的
							else
								print("不匹配的渠道" , vv , "usertype" , v.usertype);
							end
						end
					-- 不填渠道也行
					else
						table.insert(allChannelCfgs , v);
					end
				end
			end
		end
		if #allChannelCfgs > 0 then
			local v = allChannelCfgs[1];
			print("使用全部审核渠道" , v.usertype);
			-- 改成默认usertype
			v.usertype = "0";
			g_isReviewVersion = true;
			return v;
		end
	end

	-- 取当前记录
	local item = cfg[usertype];
	print("取当前记录" , item.usertype);
	if item == nil then
		return cfg["0"];
	end
	return item;
end

function downloadFileByServers(updateHttpServer , filename , onEnd)
	local context = 
	{
		FileServers = split(updateHttpServer , ",");
	};
	-- 下载器
	local downloader = require("Downloader"):new(context);
	local task = downloader:createTask(filename , onEnd);
end

-- 根据用户类型，去网上找服务器列表和用户列表，通过onEnd返回一个表{usertype="1"; updateserver="http://update.h.joycombo.com/dev2/update/"; serverlist="http://180.150.178.244/dev2/serverlist/serverlist.xml";}
function getServerByUserType(usertype , updateHttpServer , onEnd)
	local function onDownloaded(state , str)
		if state ~= "successed" then
			onEnd(nil);
			return;
		end
		-- 根据用户类型获取服务器列表
		local server = getFileServer(usertype , str);
		onEnd(server);
	end

	downloadFileByServers(updateHttpServer , "usertype.xml" , onDownloaded);
end

-- 读取用户类型
function loadUsertype()
	local usertype = getWritableFileData("usertype.data");
	return usertype or "0";
end

-- 保存用户类型
function saveUsertype(usertype)
	local targetPath = writablePath .. "usertype.data";
	local f , err = io.open(targetPath , "wb");
	if f then
		f:write(usertype);
		f:close();
		return true;
	else
		return false , err;
	end
end


--[[
是否等待更新包下载完成	10001
"0.获取版本信息
1.无更新包
2.需要更新，但未等待更新完成
3.需要更新，并且更新成功
4.更新失败"

是否有完整看完开场视频并进入游戏登陆界面	10002
"0.开始播放视频；
1.跳过视频进入登录；
2.完整看完视频进入登录"

网易通行证是否登陆成功	10003
"0.否
1.是"

是否同意了用户协议	10004
"0.否
1.是"

是否确定了公告	10005
"0.显示了公告
1.确认公告"

是否在第一次登陆前点开过服务器列表	10006
"1.打开服务器列表
2.点击选服
3.点击空白位置取消选服"

是否登陆游戏进入到第一场战斗录像	10007
"0.开始播放录像
1.跳过录像
2.看完录像"
			
是否点击屏幕任意位置令其开始战斗	10008
1.开始播放PVE战斗录像

是否看完第一场战斗录像并进入到初始种族选择界面	10009
"1.看完PVE战斗录像并进入初始种族界面；
2.跳过录像进入初始种族选择界面"

是否在选初始种族界面点击任意种族图标	10010
N.第N次点击初始种族选择界面的种族图标

是否完成初始种族的选择并进入到创建角色界面	10011
1.选择完初始种族进入角色创建界面

初始种族选择了哪个种族	10012
N.玩家初始种族选择了XX族（返回”种族ID“N，和对应种族名称）

是否点击选择框选择了国王性别	10013
"1.选择男性国王；
2.选择女性国王"

是否输入了角色名	10014
"1.使用随机名字，但名字包含屏蔽字，创建角色失败
2.使用随机名字，但名字重名，创建角色失败
3.使用随机名字，创建角色成功
4.输入了名字，但名字包含屏蔽字，创建角色失败
5.输入了名字，但名字重名，创建角色失败
6.输入了名字，创建角色成功"

--]]


local g_monitor_state;

-- 读取用户类型
function loadMonitorState()
	local usertype = getWritableFileData("monitorState.data");
	return usertype or "0";
end

-- 保存用户类型
function saveMonitorState()
	local targetPath = writablePath .. "monitorState.data";
	local f , err = io.open(targetPath , "wb");
	if f then
		f:write(g_monitor_state);
		f:close();
		return true;
	else
		return false , err;
	end
end


local g_monitor_udid = nil;
-- 监控数据提交
function submitMonitor(key , value)
	if not PluginDevice then
		return;
	end
	if g_monitor_state == nil then
		g_monitor_state = loadMonitorState();
	end
	-- 状态等于1，表示
	if g_monitor_state == "1" then
		return;
	end
	-- 成功登陆角色，以后就不用记录了
	if key == 11000 and value == 1 then
		g_monitor_state = "1";
		saveMonitorState();
	end
	if not g_monitor_udid then
		g_monitor_udid = PluginDevice:callString("getUDID");
	end
	local postTable = 
	{
		udid = g_monitor_udid;
		key = tostring(key);
		value = tostring(value);
	};
	cc.CURLManager:getInstance():createPostTask("http://123.59.61.12:8080/tool/monitor", nil, postTable , function()end);
end