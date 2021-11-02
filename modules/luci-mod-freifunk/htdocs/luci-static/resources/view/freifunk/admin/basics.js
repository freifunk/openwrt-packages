'use strict';
'require view';
'require form';
'require fs';
'require uci';

return view.extend({
    load: () => {
        return Promise.all([
            fs.list('/etc/config/').then((configs) => {
                let communities = configs
                    .filter(file => file.name.startsWith('profile_'));
                return communities;
            }).then((communities) => {
                communities.forEach(community => {
                    uci.load(community.name);
                });
                return communities;
            })
        ])
    },
    render: (communities) => {
        let communityMap, communitySection, communityOption;

        communityMap = new form.Map('freifunk', _('Community'));

        communitySection = communityMap.section(form.NamedSection, 'community', 'public', null, _('These are the basic settings for your local wireless community. These settings define the default values for the wizard and DO NOT affect the actual configuration of the router.'));

        communityOption = communitySection.option(form.ListValue, 'name', _('Community'));
        communityOption.rmempty = false;
        communities[0].forEach(community => {
            let communityName = uci.get_first(community.name, 'community', 'name');
            communityOption.value(community.name.replace('profile_', ''), communityName);
        });

        let systemMap, systemSection, option;

        systemMap = new form.Map('system', _('Basic system settings'));

        systemSection = systemMap.section(form.TypedSection, 'system');
        systemSection.anonymous = true;

        option = systemSection.option(form.Value, 'hostname', _('Hostname'));
        option.rmempty = false;

        option = systemSection.option(form.Value, 'location', _('Location'));
        option.optional = true;
        option.rmempty = false;

        option = systemSection.option(form.Value, 'latitude', _('Latitude'), _('e.g.') + ' 48.12345');
        option.optional = true;
        option.rmempty = false;

        option = systemSection.option(form.Value, 'longitude', _('Longitude'), _('e.g.') + ' 10.12345');
        option.optional = true;
        option.rmempty = false;


        return Promise.all([communityMap.render(), systemMap.render()]);
    }
})

