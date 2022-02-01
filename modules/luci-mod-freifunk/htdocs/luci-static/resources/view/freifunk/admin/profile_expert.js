'use strict';
'require view';
'require uci';
'require ui';
'require fs';

return view.extend({
    handleSave: () => {
        const profileContent = document.getElementById('widget.profileContent').value;
        const communityName = uci.get('freifunk', 'community', 'name');
        return fs.write('/etc/config/profile_' + communityName, profileContent)
    },
    handleSaveApply: null,
    load: () => {
        return Promise.all([
            uci.load('freifunk').then(() => {
                let communityName = uci.get('freifunk', 'community', 'name');
                return fs.read('/etc/config/profile_' + communityName);
            }).catch((error) => {
                console.log(_('Error while reading file: ') + error);
            })
        ])
    },
    render: (data) => {
        if (data[0] == null) {
            const errorUrl = L.url('admin/freifunk/profile_error');
            window.location.replace(errorUrl);
            return;
        }
        let textarea = new ui.Textarea(data[0], { 'id': 'profileContent', 'rows': 15 });
        return E([], {}, [
            E('h2', {}, _('Community profile')),
            E('div', {}, _('You can manually edit the selected community profile here.')),
            E('br', {}, []),
            textarea.render()
        ])
    }
});