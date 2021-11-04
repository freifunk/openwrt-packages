'use strict';
'require uci';
'require view';

return view.extend({
    handleSave: null,
    handleReset: null,
    handleSaveApply: null,
    load: () => {
        return Promise.all([
            uci.load('olsrd').then(() => {
                return uci.sections('olsrd', 'LoadPlugin');
            })
        ])
    },
    render: (data) => {
        let hasLatLon = false;
        data[0].forEach(section => {
            if (section.library === 'olsrd_nameservice') {
                let latlonFile = uci.get('olsrd', section['.name'], 'latlon_file');
                if (latlonFile != null) hasLatLon = true;
            }
        });
        if (hasLatLon) {
            return E([], {}, [
                E('script', {}, ['function ffmapinit() {console.log("ach")}']),
                E('iframe', {'id': 'mapframe', 'style': 'width:100%; height:640px; border:none', 'src': L.resource('freifunk-map/map.htm')}),
                E('h2', _('Legend')),
                E('ul', {}, [
                    E('li', {}, [E('strong', {}, E('span', {'style': 'color:#00cc00'}, _('Green'))), ': ' + _('Very good (ETX < 2)')]),
                    E('li', {}, [E('strong', {}, E('span', {'style': 'color:#ffcb05'}, _('Yellow'))), ': ' + _('Good (2 < ETX < 4)')]),
                    E('li', {}, [E('strong', {}, E('span', {'style': 'color:#ff6600'}, _('Orange'))), ': ' + _('Still usable (4 < ETX < 10)')]),
                    E('li', {}, [E('strong', {}, E('span', {'style': 'color:#bb3333'}, _('Red'))), ': ' + _('Bad (ETX > 10)')]),
                ])
            ]);
        } else {
            return E([], {}, [
            E('h2', _('Map Error')),
            E('p', _('The OLSRd service is not configured to capture position data from the network.<br />\
            Please make sure that the nameservice plugin is properly configured and that the <em>latlon_file</em> option is enabled.'))
            ])
        };
    }
})

/*

<% if has_latlon then %>
	<iframe style="width:100%; height:640px; border:none" src="<%=url("freifunk/map/content")%>"></iframe>

 */
