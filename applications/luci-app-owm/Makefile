# This is free software, licensed under the GNU General Public License v2.
# See /LICENSE for more information.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-owm
PKG_RELEASE:=0.5.1

PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/luci-app-owm/default
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=3. Applications
  URL:=https://github.com/freifunk/openwrt-packages
  PKGARCH:=all
endef

define Package/luci-app-owm
  $(call Package/luci-app-owm/default)
  DEPENDS:=+luci-lib-json +olsrd-mod-jsoninfo +luci-lib-ip +libuci-lua
  TITLE:=Luci JSON Export for Open Wireless Map
endef

define Package/luci-app-owm/description
  Luci JSON Export for Open Wireless Map
endef

define Package/luci-app-owm-cmd
  $(call Package/luci-app-owm/default)
  DEPENDS:=luci-app-owm +luci-lib-httpclient +libuci-lua
  TITLE:=luci-app-owm-cmd - Commandline update tool
endef

define Package/luci-app-owm-gui
  $(call Package/luci-app-owm/default)
  DEPENDS:=luci-app-owm +luci-base
  TITLE:=luci-app-owm-gui - GUI Open Wireless Map
endef
define Package/luci-app-owm-ant
  $(call Package/luci-app-owm/default)
  DEPENDS:=luci-app-owm +luci-base
  TITLE:=luci-app-owm-ant - GUI Antenna settings
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	$(CP) ./luasrc $(PKG_BUILD_DIR)/
endef

define Build/Configure
endef

define Build/Compile
	$(MAKE) -C $(PKG_BUILD_DIR)/luasrc
endef

define Package/luci-app-owm-cmd/postinst
#!/bin/sh
if [ -z $${IPKG_INSTROOT} ] ; then
	( . /etc/uci-defaults/owm ) && rm -f /etc/uci-defaults/owm
	rm -f /tmp/luci-indexcache
fi
endef

define Package/luci-app-owm-cmd/install
	$(INSTALL_DIR) $(1)/usr/sbin/
	$(CP) files/owm.lua $(1)/usr/sbin/owm.lua
	$(INSTALL_DIR) $(1)/etc/uci-defaults
	$(CP) files/owm-defaults $(1)/etc/uci-defaults/owm
endef

define Package/luci-app-owm-gui/install
	$(INSTALL_DIR) $(1)/usr/lib/lua/luci/controller
	$(CP) $(PKG_BUILD_DIR)/luasrc/controller/owm.lua $(1)/usr/lib/lua/luci/controller/owm.lua
	$(INSTALL_DIR) $(1)/usr/lib/lua/luci/view
	$(CP) $(PKG_BUILD_DIR)/luasrc/view/owm.htm $(1)/usr/lib/lua/luci/view/owm.htm
endef

define Package/luci-app-owm-ant/install
	$(INSTALL_DIR) $(1)/usr/lib/lua/luci/controller
	$(CP) $(PKG_BUILD_DIR)/luasrc/controller/antennas.lua $(1)/usr/lib/lua/luci/controller/antennas.lua
	$(INSTALL_DIR) $(1)/usr/lib/lua/luci/model/cbi
	$(CP) $(PKG_BUILD_DIR)/luasrc/model/cbi/antennas.lua $(1)/usr/lib/lua/luci/model/cbi/antennas.lua
endef

define Package/luci-app-owm/install
	$(INSTALL_DIR) $(1)/usr/lib/lua/luci
	$(CP) $(PKG_BUILD_DIR)/luasrc/owm.lua $(1)/usr/lib/lua/luci/owm.lua
endef

$(eval $(call BuildPackage,luci-app-owm))
$(eval $(call BuildPackage,luci-app-owm-cmd))
$(eval $(call BuildPackage,luci-app-owm-gui))
$(eval $(call BuildPackage,luci-app-owm-ant))
