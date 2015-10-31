-- android
if cc.Application:getInstance():getTargetPlatform() == 3 then
	local function createArgumentSign(t)
		if t == "number" then
			return "D";
		elseif t == "boolean" then
			return "Z";
		elseif t == "string" then
			return "Ljava/lang/String;";
		elseif t == "function" then
			return "I";
		elseif t == "table" then
			return "Lorg/json/JSONObject;";
		else
			error(" not support type " .. t);
		end
	end

	local function createMethodSign(...)
		local argsType = {};
		local args = {...}
		for i , v in ipairs(args) do
			local t = type(v);
			table.insert(argsType , createArgumentSign(t));
		end
		return table.concat(argsType);
	end

	function cc.Plugin:callVoid(methodName , ...)
		local methodSign = "(" .. createMethodSign(...) .. ")V";
		print("callMemberMethod" , methodName , methodSign , ...);
		self:callMemberMethod(methodName , methodSign , {...});
	end

	function cc.Plugin:callInt(methodName , ...)
		local methodSign = "(" .. createMethodSign(...) .. ")I";
		print("callMemberMethod" , methodName , methodSign , ...);
		return self:callMemberMethod(methodName , methodSign , {...});
	end

	function cc.Plugin:callDouble(methodName , ...)
		local methodSign = "(" .. createMethodSign(...) .. ")D";
		print("callMemberMethod" , methodName , methodSign , ...);
		return self:callMemberMethod(methodName , methodSign , {...});
	end

	function cc.Plugin:callBool(methodName , ...)
		local methodSign = "(" .. createMethodSign(...) .. ")Z";
		print("callMemberMethod" , methodName , methodSign , ...);
		return self:callMemberMethod(methodName , methodSign , {...});
	end

	function cc.Plugin:callString(methodName , ...)
		local methodSign = "(" .. createMethodSign(...) .. ")Ljava/lang/String;";
		print("callMemberMethod" , methodName , methodSign , ...);
		return self:callMemberMethod(methodName , methodSign , {...});
	end
-- ios
elseif cc.Application:getInstance():getTargetPlatform() == 4 or cc.Application:getInstance():getTargetPlatform() == 5 then
	cc.Plugin.call = cc.Plugin.callMemberMethod;
	cc.Plugin.callVoid = cc.Plugin.callMemberMethod;
	cc.Plugin.callInt = cc.Plugin.callMemberMethod;
	cc.Plugin.callDouble = cc.Plugin.callMemberMethod;
	cc.Plugin.callString = cc.Plugin.callMemberMethod;
	cc.Plugin.callBool = cc.Plugin.callMemberMethod;
end