require("preload/Plugin");

-- android
if cc.Application:getInstance():getTargetPlatform() == 3 then
	PluginDevice = cc.PluginManager:getInstance():createPlugin("device" , "com/joycombo/plugin/Device");
	PluginLocationManager = cc.PluginManager:getInstance():createPlugin("LocationManager" , "com/joycombo/plugin/LocationManager");

	-- 弹出普通确认框
	function deviceAlert(message , title , func)
		-- 普通确认框
		local params = 
		{
			title or PLN.DLG_TITLE;
			message;
			0; 
			func or 0;
		}
		PluginDevice:callMemberMethod("showDialog"  , "(Ljava/lang/String;Ljava/lang/String;II)V" , params);
	end

	-- 确认取消确认框
	-- @message 消息内容
	-- @title 消息标题
	-- @func 回调函数，function(value)，确认时value="1"，取消时value="0"
	function deviceMessageBox(message , title , func)
		-- 确认取消确认框
		local params = 
		{
			title or PLN.DLG_TITLE;
			message;
			1; 
			func;
		}
		PluginDevice:callMemberMethod("showDialog"  , "(Ljava/lang/String;Ljava/lang/String;II)V" , params);
	end

	-- 输入框
	-- @title 标题
	-- @defaultValue 默认值
	-- @maxLength 最多输入多少字符
	-- @func 回调函数，function(value)确认时value=输入值，取消时value=""
	function deviceInputBox(title , defaultValue , maxLength , func)
		-- 确认取消确认框
		local params = 
		{
			title;
			defaultValue;
			6; -- 所有内容
			4; -- 任意字符
			0; -- 默认按钮
			maxLength; -- 12个字符
			func;
		}
		PluginDevice:callMemberMethod("showInputBoxDialog"  , "(Ljava/lang/String;Ljava/lang/String;IIIII)V" , params);
	end
	
	-- 发送一个通知
	-- loop 通知是否循环
	-- absoluteTime 当loop为false时，这个值生效，而且是个绝对 2015:06:15:12:00:00
	-- timeString 当loop为true时，这个值生效，为一个循环时间例如：21:00:00
	-- period 当loop为true时，这个值表示间隔时间(单位为毫秒)
	-- tickerText 标签
	-- title 提示标题
	-- contentText 提示的内容
	function deviceSendNotification(loop, absoluteTime, timeString, period, tickerText, title, contentText)
		local params = 
		{
			Nloop = loop,
			NabsoluteTime = absoluteTime,
			NtimeString = timeString,
			Nperiod = period,
			NtickerText = tickerText,
			Ntitle = title,
			NcontentText = contentText,
		}
		print("通知传入的参数：", table.tostring(params))
		PluginDevice:callVoid("addTimerNotification", params);
	end
	
	-- 开始所有的通知
	function deviceStartAllNotification()
		PluginDevice:callVoid("startAllNotifications");
	end
	
	-- 停止所有的通知
	function deviceStopAllNotification()
		PluginDevice:callVoid("stopAllNotifications");
	end
	
	-- 清空下所有的通知
	function deviceClearAllNotificaiton()
		PluginDevice:callVoid("clearAllNotifications");
	end
-- ios
elseif cc.Application:getInstance():getTargetPlatform() == 4 or cc.Application:getInstance():getTargetPlatform() == 5 then
	PluginDevice = cc.PluginManager:getInstance():createPlugin("device" , "PluginDevice");
	PluginLocationManager = cc.PluginManager:getInstance():createPlugin("LocationManager" , "LocationManager");

	-- 弹出普通确认框
	function deviceAlert(message , title , func)
		-- 普通确认框
		local params = 
		{
			message;
			title or PLN.DLG_TITLE;
			0;
			func or 0;
		}
		PluginDevice:callMemberMethod("showDialog"  , unpack(params));
	end

	-- 确认取消确认框
	-- @message 消息内容
	-- @title 消息标题
	-- @func 回调函数，function(value)，确认时value="1"，取消时value="0"
	function deviceMessageBox(message , title , func)
		-- 确认取消确认框
		local params = 
		{
			title or PLN.DLG_TITLE;
			message;
			1; 
			func;
		}
		PluginDevice:callMemberMethod("showDialog"  , unpack(params));
	end

	-- 输入框
	-- @title 标题
	-- @defaultValue 默认值
	-- @maxLength 最多输入多少字符
	-- @func 回调函数，function(value)确认时value=输入值，取消时value=""
	function deviceInputBox(title , defaultValue , maxLength , func)
		-- 确认取消确认框
		local params = 
		{
			title;
			defaultValue;
			title;
			false;
			maxLength; -- 12个字符
			0; -- 默认的键盘类型
			9; -- 确定按钮
			func;
		}
		PluginDevice:callMemberMethod("showInputBoxDialog"  , unpack(params));
	end
	
	-- 发送一个通知
	-- loop 通知是否循环
	-- remainSeconds 当loop为false时，这个值生效，而且是个绝对的时间戳，单位为毫秒（2015-06-11对应的时间戳就是585822221222毫秒）
	-- timeString 当loop为true时，这个值生效，为一个循环时间例如：21:00:00
	-- period 当loop为true时，这个值表示间隔时间(单位为毫秒)
	-- tickerText 标签
	-- title 提示标题
	-- contentText 提示的内容
	function deviceSendNotification(loop, remainSeconds, timeString, period, tickerText, title, contentText)
		print("deviceSendNotification", loop, remainSeconds, timeString, period, tickerText, title, contentText)
	end
	
	-- 开始所有的通知
	function deviceStartAllNotification()
		print("deviceStartAllNotification")
	end
	
	-- 停止所有的通知
	function deviceStopAllNotification()
		print("deviceStopAllNotification")
	end
	
	-- 清空下所有的通知
	function deviceClearAllNotificaiton()
		print("deviceClearAllNotificaiton")
	end
else
    --PluginDevice = cc.PluginManager:getInstance():createPlugin("device" , "PluginDevice");
	--PluginLocationManager = cc.PluginManager:getInstance():createPlugin("LocationManager" , "LocationManager");

	-- 弹出普通确认框
	function deviceAlert(message , title , func)
		print("deviceAlert(" , message , title , func , ")");
	end

	-- 确认取消确认框
	-- @message 消息内容
	-- @title 消息标题
	-- @func 回调函数，function(value)，确认时value="1"，取消时value="0"
	function deviceMessageBox(message , title , func)
		print("deviceMessageBox(" , message , title , func , ")");
	end

	-- 输入框
	-- @title 标题
	-- @defaultValue 默认值
	-- @maxLength 最多输入多少字符
	-- @func 回调函数，function(value)确认时value=输入值，取消时value=""
	function deviceInputBox(title , defaultValue , maxLength , func)
		--print("deviceInputBox(" , title , defaultValue , maxLength , func , ")");
		-- 确认取消确认框		
		app:showWinInputDialog(title , defaultValue , maxLength , func)
	end
	
	-- 发送一个通知
	-- loop 通知是否循环
	-- remainSeconds 当loop为false时，这个值生效，而且是个绝对的时间戳，单位为毫秒（2015-06-11对应的时间戳就是585822221222毫秒）
	-- timeString 当loop为true时，这个值生效，为一个循环时间例如：21:00:00
	-- period 当loop为true时，这个值表示间隔时间(单位为毫秒)
	-- tickerText 标签
	-- title 提示标题
	-- contentText 提示的内容
	function deviceSendNotification(loop, remainSeconds, timeString, period, tickerText, title, contentText)
		print("deviceSendNotification", loop, remainSeconds, timeString, period, tickerText, title, contentText)
	end
	
	-- 开始所有的通知
	function deviceStartAllNotification()
		print("deviceStartAllNotification")
	end
	
	-- 停止所有的通知
	function deviceStopAllNotification()
		print("deviceStopAllNotification")
	end
	
	-- 清空下所有的通知
	function deviceClearAllNotificaiton()
		print("deviceClearAllNotificaiton")
	end
end

-- 把设备信息打印到日志里
function devicePrintBaseInfo()
	if PluginDevice then
		local allNames = PluginDevice:callString("getBaseInfoNames");
		local names = split(allNames , ",")
		for i, v in pairs(names) do
			-- 这里不需要打印位置信息
			if v ~= "location" then
				local value = PluginDevice:callString("getInfoValue" , v);
				print(v , " = " , value);
			end
		end
	end
end

-- 获取设备的CPU型号
function getDeviceCPUType()
	if PluginDevice then
		if cc.Application:getInstance():getTargetPlatform() == 3 then
			return PluginDevice:callString("getInfoValue" , "CPU_ABI")
		elseif cc.Application:getInstance():getTargetPlatform() == 4 or cc.Application:getInstance():getTargetPlatform() == 5 then
			return PluginDevice:callString("getInfoValue" , "CPUType")
		end
	end
	print("找不到设备的CPU_ABI字段，使用默认的armeabi-v7a")
	return "armeabi-v7a"
end
