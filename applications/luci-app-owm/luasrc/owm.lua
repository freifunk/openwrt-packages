--[[
LuCI - Lua Configuration Interface

Copyright 2013 Patrick Grimm <patrick@lunatiki.de>
Copyright 2022 Sven Roederer <S.Roederer@b2social.de>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

$Id$

]]--

local bus = require "ubus"
local string = require "string"
local sys = require "luci.sys"
local uci = require "uci".cursor()
local util = require "luci.util"
local json = require "luci.json"
local sysinfo = luci.util.ubus("system", "info") or { }
local boardinfo = luci.util.ubus("system", "board") or { }
local table = require "table"
local nixio = require "nixio"

local ipairs, pairs, tonumber, tostring = ipairs, pairs, tonumber, tostring
local dofile, _G = dofile, _G

-- load extendion and set status-variables on success
-- taken from https://stackoverflow.com/a/44423956/19761878
local extension_interface_loaded, ext_interface = pcall(function() return require "luci.owm.interface" end)

--- LuCI OWM-Library
-- @cstyle	instance
module "luci.owm"

-- backported from LuCI 0.11 and adapted form berlin-stats
--- Returns the system type (in a compatible way to LuCI 0.11)
-- @return	String indicating this as an deprecated value
--        	(instead of the Chipset-type)
-- @return	String containing hardware model information
--        	(trimmed to router-model only)
function sysinfo_for_kathleen020()
	local cpuinfo = nixio.fs.readfile("/proc/cpuinfo")

	local system = 'system is deprecated'

	local model =
		boardinfo['model'] or
		cpuinfo:match("machine\t+: ([^\n]+)") or
		cpuinfo:match("Hardware\t+: ([^\n]+)") or
		nixio.uname().machine or
		system

        return system, model
end

-- inspired by luci.version
--- Returns the system version info build from /etc/openwrt_release
--- switch from luci.version which always includes
--- the revision in the "distversion" field and gives empty "distname"
-- @ return	the releasename
--         	(DISTRIB_ID + DISTRIB_RELEASE)
-- @ return	the releaserevision
--         	(DISTRIB_REVISION)
function get_version()
	local distname = ""
	local distrev = ""
	local version = {}

	dofile("/etc/openwrt_release")
	if _G.DISTRIB_ID then
		distname = _G.DISTRIB_ID .. " "
	end
	if _G.DISTRIB_RELEASE then
		distname = distname .. _G.DISTRIB_RELEASE
	end
	if _G.DISTRIB_REVISION then
		distrev = _G.DISTRIB_REVISION
	end
	version['distname'] = distname
	version['distrevision'] = distrev
	return version
end

function get_position()
	local position = {}
	uci:foreach("system", "system", function(s)
		position['latitude'] = tonumber(s.latitude)
		position['longitude'] = tonumber(s.longitude)
	end)
	if (position['latitude'] and  position['longitude']) then
		return position
	else
		return nil
	end
end

function get()
	local root = {}
	local position = get_position()
	local version = get_version()

	root.type = 'node' --owm
	root.updateInterval = 3600 --owm one hour

	root.system = {
		uptime = {sys.uptime()},
		loadavg = {sysinfo.load[1] / 65536.0},
		sysinfo = {sysinfo_for_kathleen020()},
	}

	root.hostname = sys.hostname() --owm
	root.hardware = boardinfo['system'] --owm

	root.firmware = {
		name=version.distname, --owm
		revision=version.distrevision --owm
	}

	root.latitude = position["latitude"] --owm
	root.longitude = position["longitude"] --owm

	root.script = 'luci-app-owm'
	root.api_rev = '1.0'

	if extension_interface_loaded then
		root.interfaces = ext_interface.get()
	end

	return root
end
