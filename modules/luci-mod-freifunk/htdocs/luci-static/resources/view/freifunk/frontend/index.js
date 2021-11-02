'use strict';
'require fs';
'require uci';
'require view';

return view.extend({
    handleReset: null,
    handleSave: null,
    handleSaveApply: null,
    load:  () => {
        return Promise.all([
            uci.load('freifunk').then(() => {
                fs.read
            }),
            fs.read('/www/luci-static/index_user.html')
        ])
    },
    render: (data) => {
        console.log(data);
        let redirectPage = uci.get('freifunk', 'luci', 'redirect_landingpage');
        if (redirectPage != null) {
            window.location.replace(L.url(redirectPage));
            return;
        }
        let redirectUrl = uci.get('freifunk', 'luci', 'redirect_landingurl');
        if (redirectUrl != null) {
            window.location.replace(redirectUrl);
            return;
            
        }
        let defaultText = uci.get('freifunk', 'community', 'DefaultText');
        let nickName = uci.get('freifunk', 'contact', 'nickname');
        let community = uci.get('freifunk', 'community', 'name')
        return E('h2', 'yes');
    }
})