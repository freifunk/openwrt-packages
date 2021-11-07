'use strict';
'require view';
'require uci';

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
        let nickname = uci.get("freifunk", "contact", "nickname");
        let name = uci.get("freifunk", "contact", "name");
        let homepages = uci.get("freifunk", "contact", "homepage");
        let mail = uci.get("freifunk", "contact", "mail");
        let phone = uci.get("freifunk", "contact", "phone");
        let homepageNodes = []
        if (homepages != null) {
            homepages.forEach(element => {
                homepageNodes.push(E('a', { 'href': element }, element));
                homepageNodes.push(E('br'));
            })
        };
        let note = uci.get("freifunk", "contact", "note");
        let lon = uci.get_first("system", "system", "longitude");
        let lat = uci.get_first("system", "system", "latitude");
        let latlon = E([], {}, [
            lat + ' ' + lon + ' (',
            E('a', { 'href': L.url('freifunk/map') }, _('Show on map')),
            ')']);
        let location = uci.get_first("system", "system", "location")
        if (location == null) {
            location = uci.get("freifunk", "contact", "location")
        }
        let noteNode = [];
        if (note != null) {
            noteNode = E([], {}, [
                E('h2', {}, _('Notice')),
                E('table', { 'cellspacing': '10', 'width': '100%', 'style': 'text-align:left' }, [
                    E('tr', {}, [E('td', {}, note)])
                ])
            ]);
        }
        let body = E([], {}, [
            E('h2', {}, _('Contact')),
            E('h3', {}, _('Operator')),
            E('table', { 'cellspacing': '10', 'width': '100%', 'style': 'text-align:left' }, [
                E('tr', {}, [E('th', { 'width': '33%' }, _('Nickname') + ':'), E('td', {}, nickname)]),
                E('tr', {}, [E('th', { 'width': '33%' }, _('Realname') + ':'), E('td', {}, name)]),
                E('tr', {}, [E('th', { 'width': '33%' }, _('Homepage') + ':'), E('td', {}, homepageNodes)]),
                E('tr', {}, [E('th', { 'width': '33%' }, _('Email') + ':'), E('td', {}, E('a', { 'href': 'mailto:' + mail }, mail))]),
                E('tr', {}, [E('th', { 'width': '33%' }, _('Phone') + ':'), E('td', {}, phone)])
            ]),
            E('h2', {}, _('Location')),
            E('table', { 'cellspacing': '10', 'width': '100%', 'style': 'text-align:left' }, [
                E('tr', {}, [E('th', { 'width': '33%' }, _('Location') + ':'), E('td', {}, location)]),
                E('tr', {}, [E('th', { 'width': '33%' }, _('Coordinates') + ':'), E('td', {}, latlon)])
            ]),
            noteNode
        ])
        return body;
    }
})