# Copyright (C) 2011 Manuel Munz <freifunk at somakoma de>
# This is free software, licensed under the Apache 2.0 license.

include $(TOPDIR)/rules.mk

PKG_NAME:=freifunk-common
PKG_RELEASE:=10

PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/freifunk-common
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=9. Freifunk
  TITLE:=Freifunk common files
  DEPENDS:=+uci
endef

define Package/freifunk-common/description
  Common files and scripts that are needed to run free wireless mesh networks.
endef

define Package/freifunk-common/conffiles
/etc/config/freifunk
endef

define Package/freifunk-common-olsr
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=9. Freifunk
  TITLE:=Freifunk common files for olsr-v1
  DEPENDS:=freifunk-common +olsrd +micrond +libuci-lua
endef

define Package/freifunk-common-olsr/description
  Additional files and scripts that are needed to run free wireless mesh networks based on OLSRv1.
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/freifunk-common/install
	$(CP) ./files-common/* $(1)/
endef

define Package/freifunk-common-olsr/install
	$(CP) ./files-olsrv1/* $(1)/
endef

$(eval $(call BuildPackage,freifunk-common))
$(eval $(call BuildPackage,freifunk-common-olsr))
