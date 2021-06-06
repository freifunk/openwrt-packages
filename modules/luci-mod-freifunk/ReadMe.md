# package "luci-mod-freifunk"

This package provides a new function view to present some Freifunk relavant information. This View includes
a "welcome page", "node info", "olsr info" (olsr-network summary, olsr-map) and a "testdownload" to check
the bandwidth.  
This view will become the initial page when accessing the node and the regular view ("luci-mod-admin-full",
"luci-mod-admin-mini", "luci-mod-dashboard") need to be selected explicitly.

## Customization

This package can be customized via uci-config "freifunk"

### section "luci"
* option "redirect_landingpage": Will forward the user to another LuCI-page. This can be used to present an
initial "setup Wizard".  
Example `uci set freifunk.luci.redirect_landingpage="admin/status/overview`
* option "redirect_landingurl": Will forward the use to any other URL This can be used to present an "setup
Wizard" outside of LuCI or any other webpage. The redirect_landingpage option has higher priority when both
are defined.  
Example `uci set freifunk.luci.redirect_landingpage="/cgi-bin/fancy-wizard`

