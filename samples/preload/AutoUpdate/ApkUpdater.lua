local ApkUpdater = {};
ApkUpdater.__index = ApkUpdater;

-- 创建新对象
function ApkUpdater:new(...)
	local instance = {};
	setmetatable(instance , ApkUpdater);
	instance:ctor(...);
	return instance;
end

-- 创建新对象
function ApkUpdater:ctor(context)
	self.Context = context;
end

-- 下载并安装apk
function ApkUpdater:downloadAndInstallAPK(urls , apkFile)
	-- 检查之前的文件是否已经下载完毕
	if PluginDevice:callBool("checkApkFile" , apkFile) then
		self.Context:dispatchEvent("apk" , PLN.APK_DOWNLOADED_FINISH);
		PluginDevice:callVoid("installApp" , apkFile);
		return;
	end

	local url = split(urls, ",");
	print("确认要更新" , url[1] , apkFile);

	local function onDownload(status)
		if status == "successed" then
			self.Context:dispatchEvent("apk" , PLN.APK_INSTALLING);
			PluginDevice:callVoid("installApp" , apkFile);
		elseif status == "failed" then
			self.Context:dispatchEvent("error" , PLN.APK_FAILED);
		else
			self.Context:dispatchEvent("download" , {percent = tonumber(status) / 100 ; text = string.format(PLN.APK_DOWNLOADING , tonumber(status))});
		end
	end

	PluginDevice:callVoid("downloadFile" , url[1] , apkFile , onDownload);

	self.Context:dispatchEvent("apk" , PLN.APK_NEW_VER);
end
local writablePath = cc.FileUtils:getInstance():getWritablePath();

-- 检查版本，并通过onEnd回调，onEnd（true）则表示正在下载新版本，onEnd（false）表示没有新版本
function ApkUpdater:checkNewVersion(onEnd)
	local romSetting = loadRomScript("romFiles/RomSetting.lua");
	
	self.Context:dispatchEvent("apk" , PLN.APK_CHECK_NEW);
	local function onUpdate(status, data)
		if status == "successed" then
			--print("下载配置文件成功， 开始解析文件");
			self.Context:dispatchEvent("apk" , PLN.APK_CFG_DOWNLOADED);
			local cfg = {};
			local function onStartElement(name , atts)			
				if name == "item" then
					cfg[tonumber(atts.channelId)] = atts;
				end
			end
			tiny.eval(data , onStartElement)
			
			--print("解析更新配置文件完毕");
			self.Context:dispatchEvent("apk" , PLN.APK_CFG_PARSED);

			local value = PluginDevice:callString("getInfoValue" , "versionCode");
			print("versionCode: " .. tostring(value));
				
			local item = cfg[romSetting.ChannelId];
			if item then
				
				local saveFilename;
				
				local function onClick(id)
					if id == "1" then
						self:downloadAndInstallAPK(item.url , saveFilename);
						onEnd(true);
					else
						onEnd(false);
					end
				end;
				
				if item.itemType == "1" then
					if cc.Application:getInstance():getTargetPlatform() == 3 then
						-- android版
						local curVersionCode = tonumber(value);
						local minVersionCode = tonumber(item.minAppVersionCode);
						local newVersionCode = tonumber(item.versionCode);
						
						saveFilename = writablePath .. "com.joycombo.w3h_" .. romSetting.ChannelId  .. "_" .. item.versionCode .. ".apk";
						
						if curVersionCode < minVersionCode then
							deviceAlert(item.desc , item.title , onClick);
						elseif curVersionCode >= minVersionCode and curVersionCode < newVersionCode then
							deviceMessageBox(item.desc , item.title , onClick);
						else
							-- 更新完毕，删除临时包
							os.remove(saveFilename);
							onEnd(false);
						end
						
						return;
					end
					
				elseif item.itemType == "2" then
					if cc.Application:getInstance():getTargetPlatform() == 4 or cc.Application:getInstance():getTargetPlatform() == 5 then
						-- 苹果官方版本						
						
						local function onAppStoreUpdate(id)
							if id == "1" then
								local url = item.url;
								self.Context:dispatchEvent("apk" , PLN.APP_NEW);
								PluginDevice:callVoid("openUrl" , url);
								onEnd(true);
							else
								onEnd(false);
							end
						end;
						
						local curVersionCode = string2VersionCode(value);
						local minVersionCode = string2VersionCode(item.minAppVersionCode);
						local newVersionCode = string2VersionCode(item.versionCode);

						print("版本号" , curVersionCode , minVersionCode , newVersionCode);
						
						saveFilename = "";
						
						if curVersionCode < minVersionCode then
							deviceAlert(item.desc , item.title , onAppStoreUpdate);
						elseif curVersionCode >= minVersionCode and curVersionCode < newVersionCode then
							deviceMessageBox(item.desc , item.title , onAppStoreUpdate);
						else
							onEnd(false);
						end
						
						return;
					end
				elseif item.itemType == "3" then
					-- 苹果越狱版
				else
					print("无法识别的更新类型 " .. item.itemType);
				end
			else
				print("未找到此渠道id的更新配置 " .. tonumber(romSetting.ChannelId));
			end
		else
			print("下载APK版本控制文件失败");
		end;
		onEnd(false);
	end;
	
	cc.CURLManager:getInstance():createTask(romSetting.VersionConfigUrl , onUpdate);
end;

return ApkUpdater;