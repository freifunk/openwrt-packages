# LuCI-theme Freifunk-generic

In the Ende of 2010 the package "Freifunk Generic Theme" was created (f00bf93f0739040b68fd53499652bcb00307fb8e), to have the router-pages
look more in the Freifunk-color and use some graphical elements.  

# legacy version - the original

By the years this package became forgotten and lost popularity, so only generic maintenance was done along
the changes that applied to a themes of the LuCI-feed. After spliting off the Freifunk-packages from the
LuCI-feed (b5f9ae0119cdb9f43b1465f45c38771fc3f04264) the theme did not receive the updates needed to perform with the changed JavaScript 
based core and was finylly broken in OpenWrt-19.07 (https://github.com/freifunk/openwrt-packages/pull/24).  
Below is a screenshot of the theme as it was looking with Lede-17.01 (End of 2019).  
![screenshot with Lede-17.01](docs/freifunk-theme_lede17.01.png?raw=true)

# refreshed version - taken from Openwrt2020-theme

Based on the conflict of investing time to update the existing theme and the intention to keep a custom
theme a form of the OpenWrt2020 theme was adopted (PR https://github.com/freifunk/openwrt-packages/pull/30).  
The initial version still looks a lot like
the original theme with only some small changes (logos, system-load on page header, ...)  
![screenshot with OpenWrt-21.02](docs/freifunk-theme_openwrt21.02.png?raw=true)
