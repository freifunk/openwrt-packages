--[[
LuCI - Lua Configuration Interface

Copyright 2013 Patrick Grimm <patrick@lunatiki.de>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

$Id$

]]--

module("luci.controller.antennas", package.seeall)

function index()
	local page = entry({"admin", "system", "antennas"}, cbi("antennas"), "Antennas settings", 10)
	page.dependent = true	
	assign({"mini", "system", "antennas"}, {"admin", "system", "antennas"}, "Antennnas settings", 1)
end

