--[[
LuCI - Lua Configuration Interface

Copyright 2013 Patrick Grimm <patrick@lunatiki.de>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

$Id$

]]--

local fs  = require "nixio.fs"
local uci = require "luci.model.uci".cursor()
local has_wireless = fs.access("/etc/config/wireless")
if not has_wireless then return end
local has_antennas = fs.access("/etc/config/antennas")

if not has_antennas then
	luci.sys.exec("touch /etc/config/antennas")
	local antennas = {}
	antennas.builtin=true
end

-- Create antennas config
uci:foreach("wireless", "wifi-device",
function(sec)
	if not uci:get("antennas", sec[".name"]) then
		uci:section("antennas", "wifi-device", sec[".name"], {
			builtin="true",
			type="omni",
			polarization="vertical"
		})
		uci:save("antennas")
	end
end)

m = Map("antennas", translate("Antennas settings"), translate("Antennas settings"))
uci:foreach("wireless", "wifi-device",
function(sec)
	s = m:section(NamedSection, sec[".name"], "wifi-device", "Wifi Device: "..sec[".name"])
	s.remove = true
	
	svc = s:option(Flag, "builtin", "Built in")
	
	svc = s:option(Value, "manufacturer", translate("Manufacturer"))
	svc:depends("builtin","")
	svc.optional = true
	svc:value("Huber & Suhner")
	svc:value("Mars")
	svc:value("Wimo")
	svc:value("Rappl")
	
	
	svc = s:option(Value, "model", translate("Model"))
	svc:depends("builtin", "")
	svc.optional = true
	
	svc = s:option(ListValue, "polarization", translate("Polarization"))
	svc.optional = true
	svc:value("vertical")
	svc:value("horizontal")
	svc:value("horizontal/vertical")
	
	-- Gain 0-100
	svc = s:option(Value, "gain", "Gain", "dBi")
	svc.optional = true
	svc.datatype = "range(0,100)"
	
	svc = s:option(ListValue, "type", "Type")
	svc.default = "omni"
	svc:value("omni")
	svc:value("directed")
	
	-- horizontalDirection 0-360
	svc = s:option(Value, "horizontalDirection", translate("Horizontal Direction"), "0º - 360º")
	svc:depends("type", "directed")
	svc.optional = true
	svc.datatype = "range(0,360)"
	
	-- horizontalBeamwidth 0-360
	svc = s:option(Value, "horizontalBeamwidth", translate("Horizontal Beamwidth"), "0º - 360º")
	svc:depends("type", "directed")
	svc.optional = true
	svc.datatype = "range(0,360)"
	
	-- verticalDirection -90,90
	svc = s:option(Value, "verticalDirection", translate("Vertical Direction"), "-90º - 90º")
	svc:depends("type", "directed")
	svc.optional = true
	svc.datatype = "range(-90,90)"
	
	-- verticalBeamwidth -90,90
	svc = s:option(Value, "verticalBeamwidth", translate("Vertical Beamwidth"), "-90º - 90º")
	svc:depends("type", "directed")
	svc.optional = true
	svc.datatype = "range(-90,90)"
end)


return m
