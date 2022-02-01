-- Copyright 2008 Steven Barth <steven@midlink.org>
-- Licensed to the public under the Apache License 2.0.

module("luci.controller.freifunk.freifunk", package.seeall)

function index()
	local page

	if nixio.fs.access("/usr/sbin/luci-splash") then
		assign({"freifunk", "status", "splash"}, {"splash", "publicstatus"}, _("Splash"), 40)
	end

	page = assign({"freifunk", "olsr"}, {"admin", "status", "olsr"}, _("OLSR"), 30)
	page.setuser = false
	page.setgroup = false
	page.acl_depends = {}

	if nixio.fs.access("/etc/config/luci_statistics") then
		assign({"freifunk", "graph"}, {"admin", "statistics", "graph"}, _("Statistics"), 40)
	end

	-- backend
	assign({"mini", "freifunk"}, {"admin", "freifunk"}, _("Freifunk"), 5)
end

function zeroes()
	local string = require "string"
	local http = require "luci.http"
	local zeroes = string.rep(string.char(0), 8192)
	local cnt = 0
	local lim = 1024 * 1024 * 1024

	http.prepare_content("application/x-many-zeroes")

	while cnt < lim do
		http.write(zeroes)
		cnt = cnt + #zeroes
	end
end

function jsonstatus()
	local root = {}
	local sys = require "luci.sys"
	local uci = require "luci.model.uci"
	local util = require "luci.util"
	local http = require "luci.http"
	local json = require "luci.json"
	local ltn12 = require "luci.ltn12"
	local version = require "luci.version"
	local webadmin = require "luci.tools.webadmin"

	local cursor = uci.cursor_state()

	local ffzone = webadmin.firewall_find_zone("freifunk")
	local ffznet = ffzone and cursor:get("firewall", ffzone, "network")
	local ffwifs = ffznet and util.split(ffznet, " ") or {}

	local sysinfo = util.ubus("system", "info") or { }
	local boardinfo = util.ubus("system", "board") or { }

	local loads = sysinfo.load or { 0, 0, 0 }

	local memory = sysinfo.memory or {
		total = 0,
		free = 0,
		shared = 0,
		buffered = 0
	}

	local swap = sysinfo.swap or {
		total = 0,
		free = 0
	}


	root.protocol = 1

	root.system = {
		uptime = { sysinfo.uptime or 0 },
		loadavg = { loads[1] / 65535.0, loads[2] / 65535.0, loads[3] / 65535.0 },
		sysinfo = {
			boardinfo.system or "?",
			boardinfo.model or "?",
			memory.total,
			0, -- former cached memory
			memory.buffered,
			memory.free,
			0, -- former bogomips
			swap.total,
			0, -- former cached swap
			swap.free
		},
		hostname = boardinfo.hostname
	}

	root.firmware = {
		luciname=version.luciname,
		luciversion=version.luciversion,
		distname=version.distname,
		distversion=version.distversion
	}

	root.freifunk = {}
	cursor:foreach("freifunk", "public", function(s)
		root.freifunk[s[".name"]] = s
	end)

	cursor:foreach("system", "system", function(s)
		root.geo = {
			latitude = s.latitude,
			longitude = s.longitude
		}
	end)

	root.network = {}
	root.wireless = {devices = {}, interfaces = {}, status = {}}
	local wifs = root.wireless.interfaces

	for _, vif in ipairs(ffwifs) do
		root.network[vif] = cursor:get_all("network", vif)
		root.wireless.devices[vif] = cursor:get_all("wireless", vif)
		cursor:foreach("wireless", "wifi-iface", function(s)
			if s.device == vif and s.network == vif then
				wifs[#wifs+1] = s
				if s.ifname then
					local iwinfo = luci.sys.wifi.getiwinfo(s.ifname)
					if iwinfo then
						root.wireless.status[s.ifname] = { }

						local _, f
						for _, f in ipairs({
							"channel", "txpower", "bitrate", "signal", "noise",
							"quality", "quality_max", "mode", "ssid", "bssid", "encryption", "ifname"
						}) do
							root.wireless.status[s.ifname][f] = iwinfo[f]
						end
					end
				end
			end
		end)
	end

	http.prepare_content("application/json")
	ltn12.pump.all(json.Encoder(root):source(), http.write)
end
