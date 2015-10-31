local UpdateXmlParser = {};
UpdateXmlParser.__index = UpdateXmlParser;

-- 创建新对象
function UpdateXmlParser:new(...)
	local instance = {};
	setmetatable(instance , UpdateXmlParser);
	instance:ctor(...);
	return instance;
end

-- 创建新对象
function UpdateXmlParser:ctor(context , onFinish)
	self.Context = context;
	self.OnFinish = onFinish;

	self.ParsingPackageCount = 0;
	self.Packages = {};
end

-- 尝试载入文件列表，如果成功就不用那么麻烦去更新了
function UpdateXmlParser:tryLoadFiles(hashString)
	if cc.FilePackage.tryLoadFiles then
		print("尝试载入缓存文件列表");
		return cc.FilePackage:getInstance():tryLoadFiles(hashString);
	else
		print("尝试载入SDCARD中的缓存：" .. getWritableFullName("files.cache"));
		if not cc.FilePackage:getInstance():loadFiles(getWritableFullName("files.cache") , hashString) then
			print("尝试载入ROM中的缓存：assets/files.cache");
			return cc.FilePackage:getInstance():loadFiles("assets/files.cache" , hashString)
		else
			return true;
		end
	end
end

function UpdateXmlParser:onParseRoot(atts)
	-- 苹果版本
	if isIOSPlatform() then
		--print("当前是苹果版本");
		local appVersion = getAppVersion();
		--print("审核信息111：" , appVersion , atts.IOSReviewVersion , tostring(self.Context:isIOSReviewMode()));
		-- 如果是审核版本，就在地址后加一个review标签
		if appVersion == atts.IOSReviewVersion and not self.Context:isIOSReviewMode() then
			-- 设置成审核模式
			self.Context:setIOSReviewMode();
			return true;
		end
	end

	-- 从文件列表中载入
	if self:tryLoadFiles(atts.HashString) then
		print("使用已缓存的文件列表");
		submitMonitor(10001 , 1);

		self.OnFinish();
		return true;
	end
	submitMonitor(10001 , 2);

	-- 设置文件数量
	self.Context.FileTotalCount = tonumber(atts.fileCount);
	self.Context:dispatchEvent("checking" , PLN.CHECKING_FILE1);
	return false;
end

function UpdateXmlParser:onParseParckage(atts)
	local parser;
	local function onFinish()
		self.ParsingPackageCount = self.ParsingPackageCount - 1;
		print("完成一个包：" , self.ParsingPackageCount);
		if self.ParsingPackageCount == 0 then
			print("完成所有包");
			if cc.FilePackage:getInstance():saveFiles(getWritableFullName("files.cache")) then
				print("已成功缓存包文件列表, checksum:" , cc.FilePackage:getInstance():checksum());
			end
			submitMonitor(10001 , 3);
			self.OnFinish();
		end
	end
	parser = require("PackageUpdater"):new(self.Context , onFinish);
	parser:parse(atts);
end



function UpdateXmlParser:onStartElementDownloader(name , atts)
	if name == "package" then	
		self.Packages[atts.name] = atts;
		self.ParsingPackageCount = self.ParsingPackageCount + 1; 
	elseif name == "root" then
		return self:onParseRoot(atts);
	end
end

-- 解析XML数据
function UpdateXmlParser:parse(str)
	-- 解析update.xml
	local result , err = tiny.eval(str , handler(self , self.onStartElementDownloader))
	if result then
		local preloadPackage = self.Packages["preload.xml"];
		-- 如果在解析xml的root节点的时候可以使用缓存的文件跳过，则不再解析所有内容
		if preloadPackage then
			local parser;
			local function onFinish()
				self.ParsingPackageCount = self.ParsingPackageCount - 1; 
				-- preload被更新了，一切重头来过
				if parser:hasChanged() then
					cc.Application:getInstance():restart();
				else
					local function onApkUpdateEnd(hasNewVersion)
						print("APK版本检查完毕" , hasNewVersion);
						if not hasNewVersion then
							-- 开始更新
							for i , v in pairs(self.Packages) do
								if v ~= preloadPackage then
									-- 一帧只处理几个文件，以便让界面有时间显示
									self:onParseParckage(v , false);
								end
							end
						end
					end
					local apkUpdater = require("ApkUpdater"):new(self.Context);
					-- 检查APK版本号是否需要更新
					apkUpdater:checkNewVersion(onApkUpdateEnd);
				end
			end
			parser = require("PackageUpdater"):new(self.Context , onFinish);
			-- 解析preload.xml，并立即解析所有文件，不用分帧处理
			parser:parse(preloadPackage , true);
		end

	else
		print(err);
		self.Context:dispatchEvent("error" , PLN.PARSE_UPDATE_XML_ERROR);
	end
end

return UpdateXmlParser;