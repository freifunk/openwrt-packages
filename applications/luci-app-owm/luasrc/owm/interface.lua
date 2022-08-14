--[[
LuCI - Lua Configuration Interface

Copyright 2013 Patrick Grimm <patrick@lunatiki.de>

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
local netm = require "luci.model.network"
local table = require "table"
local nixio = require "nixio"
local ip = require "luci.ip"

local ipairs, pairs, tonumber, tostring = ipairs, pairs, tonumber, tostring

--- LuCI OWM-Library
-- @cstyle	instance
module "luci.owm.interface"

function showmac(mac)
	if not is_admin then
		mac = mac:gsub("(%S%S:%S%S):%S%S:%S%S:(%S%S:%S%S)", "%1:XX:XX:%2")
	end
	return mac
end

function get()
	local root = {}
	local ntm = netm.init()
	local devices  = ntm:get_wifidevs()
	local assoclist = {}
	for _, dev in ipairs(devices) do
		for _, net in ipairs(dev:get_wifinets()) do
			assoclist[#assoclist+1] = {}
			assoclist[#assoclist]['ifname'] = net:ifname()
			assoclist[#assoclist]['network'] = net:shortname()
			assoclist[#assoclist]['device'] = dev:name()
			assoclist[#assoclist]['list'] = net:assoclist()
		end
	end

	devices = {}
	uci:foreach("wireless", "wifi-device",function(s)
		devices[#devices+1] = s
		devices[#devices]['name'] = s['.name']
		devices[#devices]['.name'] = nil
		devices[#devices]['.anonymous'] = nil
		devices[#devices]['.type'] = nil
		devices[#devices]['.index'] = nil
		if s.macaddr then
			devices[#devices]['macaddr'] = showmac(s.macaddr)
		end
	end)
	local antennas = {}
	uci:foreach("antennas", "wifi-device",function(s)
		antennas[#antennas+1] = s
		antennas[#antennas]['name'] = s['.name']
		antennas[#antennas]['.name'] = nil
		antennas[#antennas]['.anonymous'] = nil
		antennas[#antennas]['.type'] = nil
		antennas[#antennas]['.index'] = nil
	end)

	local interfaces = {}
	uci:foreach("wireless", "wifi-iface",function(s)
		interfaces[#interfaces+1] = s
		interfaces[#interfaces]['.name'] = nil
		interfaces[#interfaces]['.anonymous'] = nil
		interfaces[#interfaces]['.type'] = nil
		interfaces[#interfaces]['.index'] = nil
		interfaces[#interfaces]['key'] = nil
		interfaces[#interfaces]['key1'] = nil
		interfaces[#interfaces]['key2'] = nil
		interfaces[#interfaces]['key3'] = nil
		interfaces[#interfaces]['key4'] = nil
		interfaces[#interfaces]['auth_secret'] = nil
		interfaces[#interfaces]['acct_secret'] = nil
		interfaces[#interfaces]['nasid'] = nil
		interfaces[#interfaces]['identity'] = nil
		interfaces[#interfaces]['password'] = nil
		local iwinfo = sys.wifi.getiwinfo(s.ifname)
		if iwinfo then
			for _, f in ipairs({
			"channel", "txpower", "bitrate", "signal", "noise",
			"quality", "quality_max", "mode", "ssid", "bssid", "encryption", "ifname"
			}) do
				interfaces[#interfaces][f] = iwinfo[f]
			end
			if iwinfo['encryption'] then
				if iwinfo['encryption']['enabled'] then
					-- fingers off encrypted wifi interfaces, they are likely private
					table.remove(interfaces)
					return
				end
			end
		end
		local assoclist_if = {}
		for _, v in ipairs(assoclist) do
			if v.network == interfaces[#interfaces]['network'] and v.list then
				for assocmac, assot in pairs(v.list) do
					assoclist_if[#assoclist_if+1] = assot
					assoclist_if[#assoclist_if].mac = showmac(assocmac)
				end
			end
		end
		interfaces[#interfaces]['assoclist'] = assoclist_if
		for _, device in ipairs(devices) do
			if s['device'] == device.name then
				interfaces[#interfaces]['wirelessdevice'] = device
			end
		end
		for _, antenna in ipairs(antennas) do
			if s['device'] == antenna.name then
				interfaces[#interfaces]['wirelessdevice']['antenna'] = antenna --owm
			end
		end
	end)

	root.interfaces = {} --owm
	uci:foreach("network", "interface",function(vif)
		if 'lo' == vif.ifname then
			return
		end
		local name = vif['.name']
		if ('wan' == name) or ('wan6' == name) then
			-- fingers off wan as this will be the private internet uplink
			return
		end
		local net = netm:get_network(name)
		local device = net and net:get_interface()
		root.interfaces[#root.interfaces+1] =  vif
		root.interfaces[#root.interfaces].name = name --owm
		root.interfaces[#root.interfaces].ifname = vif.ifname --owm
		root.interfaces[#root.interfaces].ipv4Addresses = {vif.ipaddr} --owm
		local ipv6Addresses = {}
		if device and device:ip6addrs() then
			for _, a in ipairs(device:ip6addrs()) do
				table.insert(ipv6Addresses, a:string())
			end
		end
		root.interfaces[#root.interfaces].ipv6Addresses = ipv6Addresses --owm
		root.interfaces[#root.interfaces].physicalType = 'ethernet' --owm
		root.interfaces[#root.interfaces]['.name'] = nil
		root.interfaces[#root.interfaces]['.anonymous'] = nil
		root.interfaces[#root.interfaces]['.type'] = nil
		root.interfaces[#root.interfaces]['.index'] = nil
		root.interfaces[#root.interfaces]['username'] = nil
		root.interfaces[#root.interfaces]['password'] = nil
		root.interfaces[#root.interfaces]['password'] = nil
		root.interfaces[#root.interfaces]['clientid'] = nil
		root.interfaces[#root.interfaces]['reqopts'] = nil
		root.interfaces[#root.interfaces]['pincode'] = nil
		root.interfaces[#root.interfaces]['tunnelid'] = nil
		root.interfaces[#root.interfaces]['tunnel_id'] = nil
		root.interfaces[#root.interfaces]['peer_tunnel_id'] = nil
		root.interfaces[#root.interfaces]['session_id'] = nil
		root.interfaces[#root.interfaces]['peer_session_id'] = nil
		if vif.macaddr then
			root.interfaces[#root.interfaces]['macaddr'] = showmac(vif.macaddr)
		end

		local wireless_add = {}
		for _, interface in ipairs(interfaces) do
			if interface['network'] == name then
				root.interfaces[#root.interfaces].physicalType = 'wifi' --owm
				root.interfaces[#root.interfaces].mode = interface.mode
				root.interfaces[#root.interfaces].encryption = interface.encryption
				root.interfaces[#root.interfaces].access = 'free'
				root.interfaces[#root.interfaces].accessNote = "everyone is welcome!"
				root.interfaces[#root.interfaces].channel = interface.wirelessdevice.channel
				root.interfaces[#root.interfaces].txpower = interface.wirelessdevice.txpower
				root.interfaces[#root.interfaces].bssid = interface.bssid
				root.interfaces[#root.interfaces].ssid = interface.ssid
				root.interfaces[#root.interfaces].antenna = interface.wirelessdevice.antenna
				wireless_add[#wireless_add+1] = interface --owm
			end
		end
		root.interfaces[#root.interfaces].wifi = wireless_add
	end)

	local arptable = ip.neighbors() or {}
	if #root.interfaces ~= 0 then
		for idx,iface in ipairs(root.interfaces) do
			local neigh_mac = {}
			for _, arpt in ipairs(arptable) do
				local mac = showmac(tostring(arpt['mac']):lower())
				local ip_addr = tostring(arpt['dest'])
				if iface['ifname'] == tostring(arpt['dev']) then
					if not neigh_mac[mac] then
						neigh_mac[mac] = {}
						neigh_mac[mac]['ip4'] = {}
					elseif not neigh_mac[mac]['ip4'] then
						neigh_mac[mac]['ip4'] = {}
					end
					neigh_mac[mac]['ip4'][#neigh_mac[mac]['ip4']+1] = ip_addr
					for i, neigh in ipairs(neighbors) do
						if neigh['destAddr4'] == ip_addr then
							neighbors[i]['mac'] = mac
							neighbors[i]['ifname'] = iface['ifname']
						end
					end
				end
			end
			for _, v in ipairs(assoclist) do
				if v.ifname == iface['ifname'] and v.list then
					for assocmac, assot in pairs(v.list) do
						local mac = showmac(assocmac:lower())
						if not neigh_mac[mac] then
							neigh_mac[mac] = {}
						end
						if not neigh_mac[mac]['ip4'] then
							neigh_mac[mac]['ip4'] = {}
						end
						if not neigh_mac[mac]['ip6'] then
							neigh_mac[mac]['ip6'] = {}
						end
						neigh_mac[mac]['wifi'] = assot
						for i, neigh in ipairs(neighbors) do
							for _, ip_addr in ipairs(neigh_mac[mac]['ip4']) do
								if neigh['destAddr4'] == ip_addr then
									neighbors[i]['mac'] = mac
									neighbors[i]['ifname'] = iface['ifname']
									neighbors[i]['wifi'] = assot
									neighbors[i]['signal'] = assot.signal
									neighbors[i]['noise'] = assot.noise
								end
							end
							for _, ip_addr in ipairs(neigh_mac[mac]['ip6']) do
								if neigh['destAddr6'] == ip_addr then
									neighbors[i]['mac'] = mac
									neighbors[i]['ifname'] = iface['ifname']
									neighbors[i]['wifi'] = assot
									neighbors[i]['signal'] = assot.signal
									neighbors[i]['noise'] = assot.noise
								end
							end
						end
					end
				end
			end
			root.interfaces[idx].neighbors = neigh_mac
		end
	end

	return root
end
