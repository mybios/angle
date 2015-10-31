local AutoUpdaterView = {};
AutoUpdaterView.__index = AutoUpdaterView;

-- 创建新对象
function AutoUpdaterView:new(...)
	local instance = {};
	setmetatable(instance , AutoUpdaterView);
	instance:ctor(...);
	return instance;
end

function AutoUpdaterView:ctor(updater , mainScene)
	self.Context = updater;
	self.MainScene = mainScene;
	self:onEnter();
end

-- 创建更新界面
local function createUpdateUI()
	local ui = cc.Layout:create();
	local size = cc.Director:getInstance():getWinSize();
	ui:setSize(size);
	ui:setAnchorPoint({x=0,y=0});
	-- 底图
	local bg = cc.Layout:create();
	bg:setBackGroundImage("preload/res/g_gengxin_ditu.jpg");
	bg:setPositionPercent({x=0,y=0});
	bg:setPositionType(1);
	bg:setSizeType(1);
	bg:setSizePercent({x=1,y=1});
	ui:addChild(bg);

	-- 提示文本
	local text = cc.TextBMFont:create(PLN.UPDATING_RES , "preload/res/preload.fnt");
	ui:addChild(text);
	text:setPositionPercent({x=0.5,y=0.54});
	text:setPositionType(1);
	text:setAnchorPoint({x=0.5,y=0.5});

	-- 错误文本
	local errText = cc.TextBMFont:create(PLN.UPDATING_RES , "preload/res/preload.fnt");
	ui:addChild(errText);
	errText:setPositionPercent({x=0.5,y=0.54});
	errText:setPositionType(1);
	errText:setAnchorPoint({x=0.5,y=0.5});
	errText:setColor({r=255,g=0,b=0});
	errText:setVisible(false);

	-- 进度条底图
	local progressBg = cc.ImageView:create("preload/res/g_gengxin_jindu_di.png");
	ui:addChild(progressBg);
	progressBg:setPositionPercent({x=0.5,y=0.44});
	progressBg:setPositionType(1);

	-- 进度条
	local progress = cc.LoadingBar:create("preload/res/g_gengxin_jindu_tiao.png");
	progressBg:addChild(progress);
	progress:setAnchorPoint({x=0,y=0});
	progress:setPosition({x=10,y=15});

	-- 重试按钮底图
	local retryBg = cc.ImageView:create("preload/res/g_gengxin_di.png");
	ui:addChild(retryBg);
	retryBg:setPositionPercent({x=0.5,y=0.15});
	retryBg:setPositionType(1);

	-- 重试按钮
	local retry = cc.Button:create("preload/res/g_gengxin_anniu_liang.png" , "preload/res/g_gengxin_anniu_an.png");
	retry:setTouchEnabled(false);
	retry:setPressedEffect(cc.ScalePressedEffect:create());
	retry:setAnchorPoint({x=0,y=0});
	retry:setPosition({x=18,y=20});

	retryBg:addChild(retry);
	retryBg:setVisible(false);

	ui.Items = {};
	ui.Items.Text = text;
	ui.Items.ErrorText = errText;
	ui.Items.Progress = progress;
	ui.Items.RetryBg = retryBg;
	ui.Items.Retry = retry;
	return ui;
end

function AutoUpdaterView:onEnter()
	self.UI = createUpdateUI();
	self.MainScene:addChild(self.UI);

    local function onTouchEvent(sender, eventType)
         if eventType == 2 then
			self:onRetryClick();
         end
		 return true;
    end
	-- 点击重试按钮
    self.UI.Items.Retry:addTouchEventListener(onTouchEvent)
end

function AutoUpdaterView:onExit()
	self.UI:removeFromParent();
end

function AutoUpdaterView:onRetryClick()
	cc.Application:getInstance():restart();
end

-- 更新事件
function AutoUpdaterView:onEvent(eventName , eventValue)
	if type(eventValue) == "string" then
		self.UI.Items.Text:setString(eventValue);
	else
		self.UI.Items.Text:setString(eventValue.text);
		self.UI.Items.Progress:setPercent(eventValue.percent * 100);
	end
	-- 调试模式
	if self.Context.Setting.DebugMode ~= 0 then
		self.UI.Items.Text:setString("DebugMode:" .. tostring(self.Context.Setting.DebugMode) .. "!!!!" .. self.UI.Items.Text:getString());
	end
	-- 更新发生了错误
	if eventName == "error" then
		submitMonitor(10001 , 4);
		self.UI.Items.ErrorText:setString(eventValue);
		self.UI.Items.ErrorText:setVisible(true);
		self.UI.Items.Text:setVisible(false);
		self.UI.Items.RetryBg:setVisible(true);
		self.UI.Items.Retry:setTouchEnabled(true);
	elseif eventName == "finish" then
		self.UI.Items.Progress:setPercent(100);
	end
end

return AutoUpdaterView;