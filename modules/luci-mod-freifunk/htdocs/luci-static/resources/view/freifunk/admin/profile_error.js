'use strict';
'require view';

return view.extend({
    handleSaveApply: null,
    handleSave: null,
    handleReset: null,
    render: (data) => {
        const profileUrl = L.url('admin/freifunk/basics');
        return E([], {}, [
            E('h2', {}, _('Error')),
            E('p', {}, [
                _('You need to select a profile before you can edit it. To select a profile go to'),
                ' ',
                E('a', {'href': profileUrl}, _('Basic Settings')),
                '.'
            ])
        ])
    }
})
