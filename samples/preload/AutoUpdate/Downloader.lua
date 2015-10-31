-- 实现下载器，用来根据设置里的下载地址尝试下载文件，如果失败就用备用地址下载
local SimpleDownloader = {};
SimpleDownloader.__index = SimpleDownloader;


-- 创建新对象
function SimpleDownloader:new(...)
	local instance = {};
	setmetatable(instance , SimpleDownloader);
	instance:ctor(...);
	return instance;
end

-- 创建新对象
function SimpleDownloader:ctor(context)
	-- 保存更新内容
	self.Context = context;
	-- 保存所有下载任务
	self.DownloadTasks = {};
end

-- 创建下载任务，如果下载失败，就用ip地址下载
function SimpleDownloader:createTask(filePath , onUpdate , priority , startPos , dataSize)
	priority = priority or 0;
	startPos = startPos or 0;
	dataSize = dataSize or 0;
	local index = 1;
	local task;
	local function onUpdateFirst(status , data)
		self.DownloadTasks[task] = nil;
		-- 解析域名失败
		if status == "failed" and self.Context.FileServers[index + 1] ~= nil then
			print("使用地址下载文件失败" , self.Context.FileServers[index] .. filePath , onUpdateFirst , priority , startPos , dataSize);
			index = index + 1;
			print("使用备用地址开始下载文件" , self.Context.FileServers[index] .. filePath , onUpdateFirst , priority , startPos , dataSize);
			local tid = cc.CURLManager:getInstance():createTask(self.Context.FileServers[index] .. filePath , onUpdateFirst , priority , startPos , dataSize);
			self.DownloadTasks[tid] = tid;
		else
			onUpdate(status , data);
		end
	end
	print("创建下载任务" , self.Context.FileServers[index] .. filePath , onUpdateFirst , priority , startPos , dataSize);
	task = cc.CURLManager:getInstance():createTask(self.Context.FileServers[index] .. filePath , onUpdateFirst , priority , startPos , dataSize);
	self.DownloadTasks[task] = task;
	return task;
end

-- 取消所有任务
function SimpleDownloader:cancelAll()
	for i , v in pairs(self.DownloadTasks) do
		cc.CURLManager:getInstance():cancelTask(v);
	end
	self.DownloadTasks = {};
end

return SimpleDownloader;