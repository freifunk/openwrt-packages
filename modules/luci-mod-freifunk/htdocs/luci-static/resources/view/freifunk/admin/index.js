'use strict';
'require uci';
'require view';

return view.extend({
    handleReset: null,
    handleSave: null,
    handleSaveApply: null,
    load: () => {
        return Promise.all([
            uci.load('freifunk'),
            uci.load('system')    
        ])
    },
    render: () => {
        let nickname = uci.get('freifunk', 'contact', 'nickname');
        let name = uci.get('freifunk', 'contact', 'name');
        let mail = uci.get('freifunk', 'contact', 'mail');
        let contacturl = L.url('admin/freifunk/contact');
        let hostname = uci.get_first('system', 'system', 'hostname');
        let latitude = uci.get_first('system', 'system', 'latitude');
        let longitude = uci.get_first('system', 'system', 'longitude');
        let location = uci.get_first('system', 'system', 'location');
        let basicsurl = L.url('admin/freifunk/basics');
        let basicSettingsWarning = (hostname == null || latitude == null || longitude == null)? E('div', {'class': 'label warning'}, [
            _('Basic settings are incomplete. Please go to'),
            ' ',
            E('a', {'href': basicsurl}, _('Basic settings')),
            ' ',
            _('and fill out all required fields.'),
            E('p')
        ]): E([]);
        let contactWarning = (nickname == null && name == null && mail == null)? E('div', {'class': 'label warning'}, [
            _('Contact information is incomplete. Please go to'),
            ' ',
            E('a', {'href': contacturl}, _('Contact')),
            ' ',
            _('and fill out all required fields.'),
            E('p')
        ]): E([]);
        return E([], {}, [
            E('h2', {}, _('Freifunk Overview')),
            _('These pages will assist you in setting up your router for Freifunk or similar wireless community networks.'),
            E('p'),
            basicSettingsWarning,
            
        ]);      
    }
})
