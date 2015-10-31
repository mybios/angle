local FileUpdater = {};
FileUpdater.__index = FileUpdater;

local writablePath = cc.FileUtils:getInstance():getWritablePath();


-- 创建新对象
function FileUpdater:new(...)
	local instance = {};
	setmetatable(instance , FileUpdater);
	instance:ctor(...);
	return instance;
end

-- 创建新对象
function FileUpdater:ctor(context , fileAttributes , serverPackageFile , packageAttributes , oldFiles , onFinish)
	self.Context = context;

	-- 包中的旧文件列表
	self.OldFiles = oldFiles;
	-- 解析的文件属性
	self.FileAttributes = fileAttributes;
	self.PackageAttributes = packageAttributes;
	self.ServerPackageFile = serverPackageFile;
	-- 完成通知
	self.OnFinish = onFinish;
end


function FileUpdater:runFinish()
	self.OnFinish();
end

-- 添加文件信息到打包文件系统中
function FileUpdater:addFile(isRomFile , fileInfo)
	local info = 
	{
		isRomFile = isRomFile;
		origin = fileInfo.origin;
		name = fileInfo.name;		
		md5 = fileInfo.md5;
		size = tonumber(fileInfo.size)
	};

	if isRomFile then
		info.realFilePath = "assets/" .. fileInfo.md5;
	else
		info.realFilePath = getWritableFullName(fileInfo.md5);
	end
	print("加到文件系统" , info.realFilePath , fileInfo.md5 , fileInfo.name);

	cc.FilePackage:getInstance():addFile(info);
end

-- 下载完毕一个文件
function FileUpdater:onDownloadedFile(state , str)
	local atts = self.FileAttributes;
	if state ~= "successed" then
		print(atts.name .. "下载失败");
		self.Context:dispatchEvent("error" , PLN.DOWNLOAD_FILE_FAILED .. atts.name);
		return;
	end
	print("下载文件成功，添加到文件系统：" .. writablePath .. atts.origin);

	local targetFilename = writablePath .. atts.md5
	local uncompressData = lzma.uncompress(str);
	-- 解压成功
	if uncompressData then
	--[[	print("开始解密数据:" , #uncompressData);
		local data = cc.FilePackage:decrypt(uncompressData);
		print("开始校验数据MD5:" , #data);
		local md5Result = md5.sumhexa(data);
		print("MD5校验完毕" , md5Result);
		if md5Result ~= atts.md5 then
			print("下载回来的内容MD5校验失败：" , atts.md5 , md5Result);
		end
--]]
		local targetFile = io.open(targetFilename , "wb");
		--print("打开文件： " , targetFilename);
		if targetFile == nil then
			print("写入文件：" , targetFilename , "时磁盘创建文件失败");
			self.Context:dispatchEvent("error" , PLN.DISK_FULL);
			return;
		end
		--print("写入内容：" , #uncompressData);
		targetFile:write(uncompressData);
		--print("关闭文件");
		targetFile:close();
	else
		print("文件解压失败：" , atts.name , "压缩文件大小：" , #str , "/" , atts.compressedSize) ;
		self.Context:dispatchEvent("error" , PLN.FILE_UNCOMPRESS_FAILED);
		return;
	end
	-- 加到文件系统中
	self:addFile(false , atts);
	-- 检查MD5
	if not checkFileMd5(atts.name , atts.md5) then
		print("文件下载完毕，但是文件的md5跟服务器上面记录的md5不一致，删除本地文件：", targetFilename)
		os.remove(targetFilename);
		self.Context:dispatchEvent("error" , PLN.FILE_CHECKSUM_FAILED);
		return;
	end
	self:runFinish();
end

-- 解析一条Package信息（在update.xml中的条目）
function FileUpdater:parse()
	local atts = self.FileAttributes;
	print("正在检查文件 " .. atts.name .. " md5 : " .. atts.md5);

	local oldFile = self.OldFiles[atts.name];
	-- 如果老文件存在，并且md5不同，则自动删除老文件
	if oldFile and oldFile.md5 ~= atts.md5 then
		print("添加到删除列表:" .. writablePath .. oldFile.md5);
		self.Context:needDelete(writablePath .. oldFile.md5);						
	end
	
	-- 文件在ROM中
	if isRomFileExist("assets/" .. atts.md5) then
		self:addFile(true , atts);
	-- 如果文件存在
	elseif isWritableFileExist(atts.md5) then
		self:addFile(false , atts);

		-- 检查MD5
		local writableFile = writablePath .. atts.md5;
		-- 如果文件是坏的，就删掉，重新下载
		if not checkFileMd5(atts.name , atts.md5) then
			print("本地的文件被修改过，导致md5码改变，需要重新下载：", writableFile)
			os.remove(writableFile);
			-- 下载
			self.Context:download(self.ServerPackageFile 
				, function(state , str)self:onDownloadedFile(state , str)end 
				, 0
				, tonumber(atts.offset)
				, tonumber(atts.compressedSize)
				);
			return true;
		end
	-- 文件不存在
	else
		-- 下载
		self.Context:download(self.ServerPackageFile 
			, function(state , str)self:onDownloadedFile(state , str)end 
			, 0
			, tonumber(atts.offset)
			, tonumber(atts.compressedSize)
			);
		return true;
	end

	self:runFinish();
	return false;
end

return FileUpdater;