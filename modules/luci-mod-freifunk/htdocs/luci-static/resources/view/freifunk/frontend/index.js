'use strict';
'require fs';
'require rpc';
'require uci';
'require view';

var getSystemBoard = rpc.declare({
    object: 'system',
    method: 'board',
    expect: {}
});

return view.extend({
    handleReset: null,
    handleSave: null,
    handleSaveApply: null,
    load: () => {
        return Promise.all([
            uci.load('freifunk').then(() => {
                let community = uci.get('freifunk', 'community', 'name');
                uci.load('profile_' + community);
            }).then(() => {
                return fs.read('/www/luci-static/index_user.html');
            }).catch((error) => {
                console.log(_('Error while reading file: ') + error);
            }),
            getSystemBoard()
        ])
    },
    render: (data) => {
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
        community = (community === undefined) ? 'Freifunk' : community;
        let url = uci.get_first('profile_' + community, 'community', 'homepage');
        url = (url === undefined) ? 'https://freifunk.net' : url;
        const hostname = data[1].hostname;
        const userText = data[0];
        let defaultContent;
        if (defaultText != 'disabled' || !defaultText) {
            defaultContent = E([], {}, [
                E('h2', {}, _('Hello and welcome in the network of') + ' ' + community),
                E('p', {}, [
                    _('We are an initiative to establish a free, independent and open wireless mesh network.'),
                    E('br', {}, []),
                    _('This is the access point') + ' ',
                    hostname + '.',
                    _('It is operated by') + ' ',
                    E('a', { 'href': L.url('freifunk/contact') }, (nickName === undefined) ? _('Please set your contact information') : nickName)
                ]),
                E('p', {}, [
                    _('You can find further information about the global Freifunk initiative at') + ' ',
                    E('a', { 'href': 'https://freifunk.net' }, 'Freifunk.net'),
                    '.',
                    E('br'),
                    _('If you are interested in our project then contact the local community') + ' ',
                    E('a', { 'href': url }, community),
                    '.'
                ]),
                E('p', {}, [
                    E('strong', _('Notice')),
                    ': ',
                    _('Internet access depends on technical and organisational conditions and may or may not work for you.')
                ])
            ]);
        } else {
            defaultContent = '';
        }
        return E([], {}, [
            defaultContent,
            E(userText)
        ]);
    }
})