'use strict';
'require view';
'require form';

return view.extend({
    render: () => {
        let freifunkMap, contactSection;

        freifunkMap = new form.Map('freifunk', _('Contact'),
            _('Please fill in your contact details below.'));

        contactSection = freifunkMap.section(form.NamedSection, 'contact', 'public', '');

        contactSection.option(form.Value, 'nickname', _('Nickname'));

        contactSection.option(form.Value, 'name', _('Realname'));

        contactSection.option(form.DynamicList, 'homepage', _('Homepage'));

        contactSection.option(form.Value, 'mail', _('E-Mail'));

        contactSection.option(form.Value, 'phone', _('Phone'));

        contactSection.option(form.TextValue, 'note', _('Notice'));

        return freifunkMap.render();

    }
});