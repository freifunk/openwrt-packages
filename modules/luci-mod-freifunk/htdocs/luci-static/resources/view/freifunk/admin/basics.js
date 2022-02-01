'use strict';
'require view';
'require form';
'require fs';
'require uci';
'require ui';
'require dom';

var OsmValue = form.Value.extend(/** @lends LuCI.form.ListValue.prototype */ {
    __name__: 'CBI.OSMValue',

    __init__: function () {
        this.super('__init__', arguments);
        this.zoom = "0";
        this.latfield = null;
        this.lonfield = null;
        this.centerlat = "";
        this.centerlon = "";
        this.zoom = "0";
        this.width = "100%"; //popups will ignore the %-symbol, "100%" is interpreted as "100";
        this.height = "400";
        this.displaytext = "OpenStreetMap"; //text on button, that loads and displays the OSMap;
        this.hidetext = "X"; // text on button, that hides OSMap;
    },

    /** @private */
    renderFrame: function (section_id, in_table, option_index, nodes) {
        var config_name = this.uciconfig || this.section.uciconfig || this.map.config,
            depend_list = this.transformDepList(section_id),
            optionEl;

        if (in_table) {
            var title = this.stripTags(this.title).trim();
            optionEl = E('td', {
                'class': 'td cbi-osmvalue-field',
                'data-title': (title != '') ? title : null,
                'data-description': this.stripTags(this.description).trim(),
                'data-name': this.option,
                'data-widget': this.typename || (this.template ? this.template.replace(/^.+\//, '') : null) || this.__name__
            }, E('div', {
                'id': 'cbi-%s-%s-%s'.format(config_name, section_id, this.option),
                'data-index': option_index,
                'data-depends': depend_list,
                'data-field': this.cbid(section_id)
            }));
        }
        else {
            optionEl = E('div', {
                'class': 'cbi-osmvaalue',
                'id': 'cbi-%s-%s-%s'.format(config_name, section_id, this.option),
                'data-index': option_index,
                'data-depends': depend_list,
                'data-field': this.cbid(section_id),
                'data-name': this.option,
                'data-widget': this.typename || (this.template ? this.template.replace(/^.+\//, '') : null) || this.__name__
            });

            if (this.last_child)
                optionEl.classList.add('cbi-value-last');

            if (typeof (this.title) === 'string' && this.title !== '') {
                optionEl.appendChild(E('label', {
                    'class': 'cbi-value-title',
                    'for': 'widget.cbid.%s.%s.%s'.format(config_name, section_id, this.option),
                    'click': function (ev) {
                        var node = ev.currentTarget,
                            elem = node.nextElementSibling.querySelector('#' + node.getAttribute('for')) || node.nextElementSibling.querySelector('[data-widget-id="' + node.getAttribute('for') + '"]');

                        if (elem) {
                            elem.click();
                            elem.focus();
                        }
                    }
                },
                    this.titleref ? E('a', {
                        'class': 'cbi-title-ref',
                        'href': this.titleref,
                        'title': this.titledesc || _('Go to relevant configuration page')
                    }, this.title) : this.title));

                optionEl.appendChild(E('div', { 'class': 'cbi-value-field' }));
            }
        }

        if (!in_table && typeof (this.description) === 'string' && this.description !== '')
            dom.append(optionEl.lastChild || optionEl,
                E('div', { 'class': 'cbi-value-description' }, this.description));

        if (nodes)
            (optionEl.lastChild || optionEl).parentNode.appendChild(nodes);

        if (depend_list && depend_list.length)
            optionEl.classList.add('hidden');

        optionEl.addEventListener('widget-change',
            L.bind(this.map.checkDepends, this.map));

        optionEl.addEventListener('widget-change',
            L.bind(this.handleValueChange, this, section_id, {}));

        dom.bindClassInstance(optionEl, this);

        return optionEl;
    },

    renderWidget: function (section_id, option_index, cfgvalue) {
        let widget = [];
        if (cfgvalue != false) {
            if (this.latfield != null && this.lonfield != null) {
                widget.push(
                    E('input', { 'type': 'hidden', 'value': `widget.cbid.${this.config}.${section_id}.${this.latfield}`, 'id': `${section_id}.latfield`, 'name': `${section_id}.latfield` }),
                    E('input', { 'type': 'hidden', 'value': `widget.cbid.${this.config}.${section_id}.${this.lonfield}`, 'id': `${section_id}.lonfield`, 'name': `${section_id}.lonfield` })
                );
            }
            widget.push(
                E('input', { 'type': 'hidden', 'value': `${this.centerlat}`, 'id': `${section_id}.centerlat`, 'name': `${section_id}.centerlat` }),
                E('input', { 'type': 'hidden', 'value': `${this.centerlon}`, 'id': `${section_id}.centerlon`, 'name': `${section_id}.centerlon` }),
                E('input', { 'type': 'hidden', 'value': `${this.zoom}`, 'id': `${section_id}.zoom`, 'name': `${section_id}.zoom` })
            )
        }
        let onclickShowButton = `document.getElementById('${section_id}.hideosm').style.display='inline';
        document.getElementById('${section_id}.displayosm').style.display='none';
        for(var i = 0; Math.min(i, window.frames.length)!=window.frames.lengths; i++){
            if(frames[i].name && frames[i].name=='${section_id}.iframe'){								
                document.getElementById('${section_id}.iframediv').style.display='block';
                frames[i].location.href='/luci-static/resources/OSMLatLon.htm';
            }
        }`;
        let onclickHideButton = `
            document.getElementById('${section_id}.displayosm').style.display='inline';
            document.getElementById('${section_id}.hideosm').style.display='none';
            document.getElementById('${section_id}.iframediv').style.display='none';
        `;

        widget.push(
            E('div', {}, [
                E('button', { 'class': 'cbi-button cbi-input-button', 'type': 'button', 'id': `${section_id}.displayosm`, 'name': `${section_id}.displayosm`, 'onclick': onclickShowButton }, `${this.displaytext}`),
                E('button', { 'class': 'cbi-button cbi-input-button', 'style': 'display:none', 'type': 'button', 'id': `${section_id}.hideosm`, 'name': `${section_id}.hideosm`, 'onclick': onclickHideButton }, `${this.hidetext}`),
            ]),
            E('div', { 'class': 'cbi-value-osmiframesection', 'id': `${section_id}.iframediv`, 'style': 'display:none' }, [
                E('iframe', { 'src': '', 'id': `${section_id}.iframe`, 'name': `${section_id}.iframe`, 'width': this.width, 'height': this.height, 'frameborder': 0, 'scrolling': 'no' })
            ])
        )

        return E([], {}, widget);
    },
});


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
            }),
            uci.load('system')
        ])
    },
    render: (communities) => {
        let communityMap, communitySection, communityOption;

        communityMap = new form.Map('freifunk', _('Community'));

        communitySection = communityMap.section(form.NamedSection, 'community', 'public', null, _('These are the basic settings for your local wireless community. These settings define the default values for the wizard and DO NOT affect the actual configuration of the router.'));

        communityOption = communitySection.option(form.ListValue, 'name', _('Community'));
        communityOption.rmempty = false;
        let communityName;
        communities[0].forEach(community => {
            communityName = uci.get_first(community.name, 'community', 'name');
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

        let deflat = uci.get_first(communityName, "community", "latitude");
        deflat = (deflat === undefined) ? 52 : deflat;
        let deflon = uci.get_first(communityName, "community", "longitude");
        deflon = (deflon === undefined) ? 10 : deflon;
        let zoom = 12
        if (deflat == 52 && deflon == 10) {
            zoom = 4
        }
        let lat = uci.get_first('system', 'system', 'latitude');
        let lon = uci.get_first('system', 'system', 'longitude');

        let osm = systemSection.option(OsmValue, 'latlon', _('Find your coordinates with OpenStreetMap'), _('Select your location with a mouse click on the map. The map will only show up if you are connected to the Internet.'));
        osm.latfield = 'latitude';
        osm.lonfield = 'longitude';
        osm.centerlat = (lat === undefined) ? deflat : lat;
        osm.centerlon = (lon === undefined) ? deflon : lon;
        osm.zoom = zoom
        osm.width = '100%';
        osm.height = '400';
        osm.displaytext = _('Show OpenStreetMap');
        osm.hidetext = _('Hide OpenStreetMap');


        return Promise.all([communityMap.render(), systemMap.render()]);
    }
})

