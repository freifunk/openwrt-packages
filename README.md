# Freifunk feed for OpenWrt

## Description

This feeds contains the OpenWrt packages for Freifunk. In February 2019 this feed was created by moving these packages out of the OpenWrt "luci"-feed.

## Usage

To enable this feed add the following line to your feeds.conf:
```
src-git freifunk https://github.com/freifunk/openwrt-packages.git
```

To install all its package definitions, run:
```
./scripts/feeds update freifunk
./scripts/feeds install -a -p freifunk
```

## License

See [LICENSE](LICENSE) file.
 
## Package Guidelines

See [CONTRIBUTING.md](CONTRIBUTING.md) file.
