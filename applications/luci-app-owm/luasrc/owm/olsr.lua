--[[
OWM-Client extension to support Olsr data
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
module "luci.owm_olsr"

function fetch_olsrd_config()
	local data = {}
	local IpVersion = uci:get("olsrd", "olsrd","IpVersion")
	if IpVersion == "4" or IpVersion == "6and4" then
		local jsonreq4 = util.exec("echo /config | nc 127.0.0.1 9090 2>/dev/null") or {}
		local jsondata4 = json.decode(jsonreq4) or {}
		if jsondata4['config'] then
			data['ipv4Config'] = jsondata4['config']
		end
	end
	if IpVersion == "6" or IpVersion == "6and4" then
		local jsonreq6 = util.exec("echo /config | nc ::1 9090 2>/dev/null") or {}
		local jsondata6 = json.decode(jsonreq6) or {}
		if jsondata6['config'] then
			data['ipv6Config'] = jsondata6['config']
		end
	end
	return data
end

function fetch_olsrd_links()
	local data = {}
	local IpVersion = uci:get("olsrd", "olsrd","IpVersion")
	if IpVersion == "4" or IpVersion == "6and4" then
		local jsonreq4 = util.exec("echo /links | nc 127.0.0.1 9090 2>/dev/null") or {}
		local jsondata4 = json.decode(jsonreq4) or {}
		local links = {}
		if jsondata4['links'] then
			links = jsondata4['links']
		end
		for i,v in ipairs(links) do
			links[i]['sourceAddr'] = v['localIP'] --owm sourceAddr
			links[i]['destAddr'] = v['remoteIP'] --owm destAddr
			local hostname = nixio.getnameinfo(v['remoteIP'], "inet")
			if hostname then
				links[i]['destNodeId'] = string.gsub(hostname, "mid..", "") --owm destNodeId
			end
		end
		data = links
	end
	if IpVersion == "6" or IpVersion == "6and4" then
		local jsonreq6 = util.exec("echo /links | nc ::1 9090 2>/dev/null") or {}
		local jsondata6 = json.decode(jsonreq6) or {}
		--print("fetch_olsrd_links v6 "..(jsondata6['links'] and #jsondata6['links'] or "err"))
		local links = {}
		if jsondata6['links'] then
			links = jsondata6['links']
		end
		for i,v in ipairs(links) do
			links[i]['sourceAddr'] = v['localIP']
			links[i]['destAddr'] = v['remoteIP']
			local hostname = nixio.getnameinfo(v['remoteIP'], "inet6")
			if hostname then
				links[i]['destNodeId'] = string.gsub(hostname, "mid..", "") --owm destNodeId
			end
			data[#data+1] = links[i]
		end
	end
	return data
end

function fetch_olsrd_neighbors(interfaces)
	local data = {}
	local IpVersion = uci:get("olsrd", "olsrd","IpVersion")
	if IpVersion == "4" or IpVersion == "6and4" then
		local jsonreq4 = util.exec("echo /links | nc 127.0.0.1 9090 2>/dev/null") or {}
		local jsondata4 = json.decode(jsonreq4) or {}
		--print("fetch_olsrd_neighbors v4 "..(jsondata4['links'] and #jsondata4['links'] or "err"))
		local links = {}
		if jsondata4['links'] then
			links = jsondata4['links']
		end
		for _,v in ipairs(links) do
			local hostname = nixio.getnameinfo(v['remoteIP'], "inet")
			if hostname then
				hostname = string.gsub(hostname, "mid..", "")
				local index = #data+1
				data[index] = {}
				data[index]['id'] = hostname --owm
				data[index]['quality'] = v['linkQuality'] --owm
				data[index]['sourceAddr4'] = v['localIP'] --owm
				data[index]['destAddr4'] = v['remoteIP'] --owm
				if #interfaces ~= 0 then
					for _,iface in ipairs(interfaces) do
						if iface['ipaddr'] == v['localIP'] then
							data[index]['interface'] = iface['name'] --owm
						end
					end
				end
				data[index]['olsr_ipv4'] = v
			end
		end
	end
	if IpVersion == "6" or IpVersion == "6and4" then
		local jsonreq6 = util.exec("echo /links | nc ::1 9090 2>/dev/null") or {}
		local jsondata6 = json.decode(jsonreq6) or {}
		local links = {}
		if jsondata6['links'] then
			links = jsondata6['links']
		end
		for _, link in ipairs(links) do
			local hostname = nixio.getnameinfo(link['remoteIP'], "inet6")
			if hostname then
				hostname = string.gsub(hostname, "mid..", "")
				local index = 0
				for i, v in ipairs(data) do
					if v.id == hostname then
						index = i
					end
				end
				if index == 0 then
					index = #data+1
					data[index] = {}
					data[index]['id'] = string.gsub(hostname, "mid..", "") --owm
					data[index]['quality'] = link['linkQuality'] --owm
					if #interfaces ~= 0 then
						for _,iface in ipairs(interfaces) do
							local name = iface['.name']
							local net = netm:get_network(name)
							local device = net and net:get_interface()
							if device and device:ip6addrs() then
								local local_ip = ip.IPv6(link.localIP)
								for _, a in ipairs(device:ip6addrs()) do
									if a:host() == local_ip:host() then
										data[index]['interface'] = name
									end
								end
							end
						end
					end
				end
				data[index]['sourceAddr6'] = link['localIP'] --owm
				data[index]['destAddr6'] = link['remoteIP'] --owm
				data[index]['olsr_ipv6'] = link
			end
		end
	end
	return data
end

function fetch_olsrd()
	local data = {}
	data['links'] = fetch_olsrd_links()
	local olsrconfig = fetch_olsrd_config()
	data['ipv4Config'] = olsrconfig['ipv4Config']
	data['ipv6Config'] = olsrconfig['ipv6Config']

	return data
end

function get()
	local root = {}
	local neighbors = fetch_olsrd_neighbors(root.interfaces)
	root.links = neighbors
	root.olsr = fetch_olsrd()

	return root
end
