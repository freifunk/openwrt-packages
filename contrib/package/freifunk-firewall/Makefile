#
# Copyright (C) 2009 Jo-Philipp Wich <jow@openwrt.org>
# Copyright (c) 2021 Sven Roederer <freifunk@it-solutions.geroedel.de>
#
# This is free software, licensed under the Apache 2.0 license.
#

include $(TOPDIR)/rules.mk

LUCI_TITLE:=Freifunk Firewall Addon
LUCI_DEPENDS:=+firewall
LUCI_DESCRIPTION:=Various firewall extensions for Freifunk. Includes NAT fixes and advanced settings.

define Package/freifunk-firewall/postinst
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
  if ! grep -q /etc/firewall.freifunk /etc/config/firewall; then
    uci add firewall include >/dev/null
    uci set firewall.@include[-1].path=/etc/firewall.freifunk
    uci commit firewall
  fi
}
endef

include ../../../freifunk.mk

# call BuildPackage - OpenWrt buildroot signature
