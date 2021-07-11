# Copyright (C) 2011 Manuel Munz <freifunk at somakoma de>
# Copyright (c) 2021 Sven Roederer <freifunk@it-solutions.geroedel.de>
# This is free software, licensed under the Apache 2.0 license.

include $(TOPDIR)/rules.mk


LUCI_TITLE:=Freifunk gateway check script
LUCI_DEPENDS:=firewall +ip +iptables-mod-ipopt +olsrd-mod-dyn-gw-plain
LUCI_DESCRIPTION:=This script periodically checks if internet is available via your own gateway.\
  If it detects that it is broken, then the defaultroute is removed from the main table and temporarilly\
  placed in table gw-check until your internet works again. Config file is /etc/config/freifunk-gwcheck.

include ../../../freifunk.mk

# call BuildPackage - OpenWrt buildroot signature
