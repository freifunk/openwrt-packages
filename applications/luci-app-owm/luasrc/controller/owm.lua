--[[
LuCI - Lua Configuration Interface

Copyright 2008 Steven Barth <steven@midlink.org>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

$Id$
]]--

module("luci.controller.owm", package.seeall)

function index()
	entry({"owm.json"}, call("getjsonowm"))

	local page = node("owm")
	page.target = template("owm")
	page.title = "OpenWifiMap"
	page.order = 100
end

function getjsonowm()
	local root = {}
	local sys = require "luci.sys"
	local uci = require "luci.model.uci"
	local util = require "luci.util"
	local http = require "luci.http"
	local ltn12 = require "luci.ltn12"
	local json = require "luci.json"
	local owm = require "luci.owm"
	http.prepare_content("application/json")
	ltn12.pump.all(json.Encoder(owm.get()):source(), http.write)
end

