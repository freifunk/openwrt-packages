# Copyright (C) 2011 Manuel Munz <freifunk at somakoma de>
# Copyright (c) 2021 Sven Roederer <freifunk@it-solutions.geroedel.de>
# This is free software, licensed under the Apache 2.0 license.

include $(TOPDIR)/rules.mk

LUCI_TITLE:=Freifunk policy routing addon
LUCI_DEPENDS:=+ip
LUCI_DESCRIPTION:=Allows you to send your own traffic via your own default gateway while\
  sending traffic received from the mesh to a gateway in the mesh.

include ../../../freifunk.mk

# call BuildPackage - OpenWrt buildroot signature
