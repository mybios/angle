local PackageUpdater = {};
PackageUpdater.__index = PackageUpdater;

local writablePath = cc.FileUtils:getInstance():getWritablePath();


-- 创建新对象
function PackageUpdater:new(...)
	local instance = {};
	setmetatable(instance , PackageUpdater);
	instance:ctor(...);
	return instance;
end

-- 创建新对象
function PackageUpdater:ctor(context , onFinish)
	self.Context = context;

	-- 解析的包属性
	self.PackageAttributes = nil;
	-- 老的package.xml中的文件信息
	self.OldFiles = {};
	-- 新的package.xml中的文件信息
	self.NewFiles = {};
	-- 服务器上打包的大文件
	self.ServerPackageFile = nil;

	-- 完成通知
	self.OnFinish = onFinish;

	-- Package.xml文件数据（加密后），检查完毕包之后，需要保存到文件
	self.DownloadedPackageFile = nil;
	self.HasChanged = false;
end

function PackageUpdater:hasChanged()
	return self.HasChanged;
end

-- 下载完毕一个Package.xml
function PackageUpdater:onDownloadedPackageXml(atts , state , str)
	if state ~= "successed" then
		print(atts.name .. "下载失败");
		self.Context:dispatchEvent("error" , atts.name .. PLN.DOWNLOAD_FAILED);
		return;
	end
	print("包配置文件下载成功：" .. atts.name);
	local xmlData = lzma.uncompress(str);
	if xmlData == nil then
		print("文件解压失败：" , atts.name);
		self.Context:dispatchEvent("error" , atts.name .. PLN.FILE_UNCOMPRESS_FAILED , 0);
		return;
	end
	self.DownloadedPackageFile = xmlData;
	self:parsePackageData(false , atts , cc.FilePackage:decrypt(xmlData))
end


-- 解析一个包的内容，把所有文件添加到文件系统中
function PackageUpdater:parsePackageData(isWritablePackageFile , packageAttributes , packageXml , immeParse)
	local packageFile;

	local oldFiles = {}
	local newFiles = {}
	
	local needUpdatePackage = true
	print("正在检查包 " .. packageAttributes.name .. " md5 : " .. packageAttributes.md5);

	local function onStartElement(name , atts)
		if name == "file" then
			newFiles[atts.name] = atts;
		elseif name == "package" then
			packageFile = atts.file;
			-- 有改动，则下载新的包配置文件
			if packageAttributes.md5 ~= atts.md5 then
				needUpdatePackage = true;
				-- 返回true则不再遍历剩下的内容
				return true;
			else
				needUpdatePackage = false;
				if not isWritablePackageFile then
					-- 解析旧的文件，看看有没有文件需要删除
					local fileData = getWritableFileData(packageAttributes.name);
					if fileData then 
						print("添加到删除列表:" .. writablePath .. packageAttributes.name);
						self.Context:needDelete(writablePath .. packageAttributes.name);						
						local function onStartElementOld(name , atts)
							if name == "file" then
								--print("旧文件：" .. atts.name .. " md5:" .. atts.md5);
								oldFiles[atts.name] = atts;
							end
						end
						print("解析旧的Package：" .. writablePath .. packageAttributes.name);
						tiny.eval(cc.FilePackage:decrypt(fileData) , onStartElementOld)
					end
				end
			end
		end
	end
	local ret , result = tiny.eval(packageXml , onStartElement)
	if ret == nil then
		print(result);
		self.Context:dispatchEvent("error" , PLN.XML_PARSE_FAILED .. packageAttributes.name);
	end

	if needUpdatePackage then
		self.HasChanged = true;
		print("有改动，下载新的包配置文件" .. packageAttributes.name);
		self.Context:download(packageAttributes.name , function(state , str)self:onDownloadedPackageXml(packageAttributes , state , str)end)
		return true;
	else
		-- 把已经被删除的文件删除
		for i , v in pairs(oldFiles) do
			if newFiles[i] == nil then
				print("已不存在的文件添加到列表:" .. writablePath .. v.md5);
				self.Context:needDelete(writablePath .. v.md5);						
			end
		end	
	end

	self.OldFiles = oldFiles;
	self.NewFiles = newFiles;
	self.ServerPackageFile = packageFile;

	-- 检查所有文件，看是否需要加到文件系统或下载
	self:checkFiles(immeParse);
end

-- 检查是否完成了
function PackageUpdater:runFinish()
	print("完成了一个包检查" , self.PackageAttributes.name);
	-- 把数据写入到文件
	if self.DownloadedPackageFile then
		local targetFilename = getWritableFullName(self.PackageAttributes.name);
		local targetFile = io.open(targetFilename , "wb");
		if targetFile == nil then
			print("写入文件：" , targetFilename , "时磁盘创建文件失败");
			self.Context:dispatchEvent("error" , "磁盘已满");
			return;
		end
		targetFile:write(self.DownloadedPackageFile);
		targetFile:close();
	end
	self.OnFinish();
end

-- 检查文件，看是否需要下载
function PackageUpdater:checkFiles(immeParse)
	local fileCount = 0;
	local function onFinishFile()
		fileCount = fileCount - 1;
		if fileCount == 0 then
			self:runFinish();
		end
	end

	local parsers = {};
	-- 解析所有文件
	for i , atts in pairs(self.NewFiles) do
		local fileParser = require("FileUpdater"):new(self.Context , atts , self.ServerPackageFile , self.PackageAttributes , self.OldFiles , onFinishFile);
		fileCount = fileCount + 1;
		-- 立刻解析所有文件，对于preload包是这么处理的
		if immeParse then
			table.insert(parsers , fileParser);
			self.Context:noNeedParse(fileParser);
		else
			self.Context:needParse(fileParser);
		end
	end

	-- 立刻解析所有文件，对于preload包是这么处理的
	if immeParse then
		for i , v in ipairs(parsers) do
			if v:parse() then
				self.HasChanged = true;
			end
		end
	end
end

-- 解析一条Package信息（在update.xml中的条目）
function PackageUpdater:parse(atts , immeParse)
	-- 优先打开下载的文件
	print("解析package" .. atts.name);
	self.PackageAttributes = atts;
	local isFromWritable = false;
	local fileData = getWritableFileData(atts.name);
	if fileData == nil then
		fileData = getRomFileData("assets/" .. atts.name);
		if fileData then
			print("打开RomPackage成功：" .. atts.name);
		end
	else
		isFromWritable = true;
		print("打开WritablePackage成功：" .. atts.name);
	end
	-- 增加了新的包
	if fileData == nil then
		self.HasChanged = true;
		print("打开Package失败，开始下载新的Package文件：" .. atts.name);
		self.Context:download(atts.name , function(state , str)self:onDownloadedPackageXml(atts , state , str)end)
	-- 检查老的包是否有改变
	else
		print("打开Package成功，开始检查包文件：" .. atts.name);
		self:parsePackageData(isFromWritable , atts , cc.FilePackage:decrypt(fileData) , immeParse)
	end
end

return PackageUpdater;