'use strict';
'require form';
'require view';
'require fs';

const INDEX_FILE = '/www/luci-static/index_user.html';

return view.extend({
    load: () => {
        return Promise.all([
            fs.read(INDEX_FILE)
                .catch((error) => {
                    console.log(_('Error while reading file: ') + error)
                })
        ])
    },
    render: (data) => {
        let freifunkMap = new form.Map('freifunk', _('Edit index page'),
            _('You can display additional content on the public index page by inserting valid XHTML in the form below.<br />Headlines should be enclosed between &lt;h2&gt; and &lt;/h2&gt;.'));

        let communitySection = freifunkMap.section(form.NamedSection, 'community', 'public', '');
        communitySection.anonymous = true;

        let flag = communitySection.option(form.Flag, 'DefaultText', _('Disable default content'),
            _('If selected then the default content element is not shown.'));
        flag.rmempty = false;

        let customHtml = communitySection.option(form.TextValue, '_text');
        customHtml.rmempty = true;
        customHtml.rows = 20;
        if (data[0]) {
            customHtml.cfgvalue = () => {
                return data[0];
            }
        }
        customHtml.write = (section, value) => {
            return fs.write(INDEX_FILE, value);
        };
        customHtml.remove = (section) => {
            return fs.remove(INDEX_FILE);
        };
        return freifunkMap.render();

    }

})
