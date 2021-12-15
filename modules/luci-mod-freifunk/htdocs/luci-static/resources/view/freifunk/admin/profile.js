'use strict';
'require view';
'require uci';
'require form';

return view.extend({
    load: () => {
        return Promise.all([
            uci.load('freifunk').then(() => {
                let communityName = uci.get('freifunk', 'community', 'name');
                uci.load('profile_' + communityName);
                return communityName;
            }),
        ])
    },
    render: (data) => {
        let communityName = data[0];
        if (communityName == null) {
            const errorUrl = L.url('admin/freifunk/profile_error');
            window.location.replace(errorUrl);
            return;
        }
        let profileMap, profileSection, o;

        profileMap = new form.Map('profile_' + communityName, _('Community settings'),
            _('These are the settings of your local community.'));

        profileSection = profileMap.section(form.NamedSection, 'profile', 'community');

        let name = profileSection.option(form.Value, 'name', 'Name');
        name.rmempty = false;

        profileSection.option(form.Value, 'homepage', _('Homepage'));

        let countryCode = profileSection.option(form.Value, 'country', _('Country code'));
        countryCode.cfgvalue = () => {
            return uci.get('profile_' + communityName, 'wifi_device', 'country');
        };
        countryCode.write = (sectionId, value) => {
            if (value) {
                uci.set('profile_' + communityName, 'wifi_device', 'country', value);
                uci.save('profile_' + communityName);
            }
        };

        let ssid = profileSection.option(form.Value, 'ssid', _('ESSID'));
        ssid.rmempty = false;

        let meshNet = profileSection.option(form.Value, 'mesh_network', _('Mesh prefix'));
        meshNet.datatype = 'ip4addr';
        meshNet.rmempty = false;

        let splashNet = profileSection.option(form.Value, 'splash_network', _('Network for client DHCP addresses'));
        splashNet.datatype = 'ip4addr';
        splashNet.optional = true;
        splashNet.rmempty = false;

        let splashPrefix = profileSection.option(form.Value, 'splash_prefix', _('Client network size'));
        splashPrefix.datatype = 'range(0,32)';
        splashPrefix.optional = true;
        splashPrefix.rmempty = false;

        profileSection.option(form.Flag, 'ipv6', _('Enable IPv6'));

        let ipv6Config = profileSection.option(form.ListValue, 'ipv6_config', _('IPv6 Config'));
        ipv6Config.depends('ipv6', '1');
        ipv6Config.value('static');

        let ipv6Prefix = profileSection.option(form.Value, 'ipv6_prefix', _('IPv6 Prefix'), _('IPv6 network in CIDR notation.'));
        ipv6Prefix.datatype = 'ip6addr';
        ipv6Prefix.depends('ipv6', '1');

        profileSection.option(form.Flag, 'vap', _('VAP'), _('Enable a virtual access point (VAP) by default if possible.'));

        let latitude = profileSection.option(form.Value, 'latitude', _('Latitude'));
        latitude.datatype = 'range(-180,180)';
        latitude.rmempty = false;

        let longitude = profileSection.option(form.Value, 'longitude', _('Longitude'));
        longitude.rmempty = false;

        return profileMap.render();
    }
});