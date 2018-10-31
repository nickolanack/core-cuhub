return window.location.protocol+"//"+(window.location.href.split('//').pop()
    .split('/').shift()
    .split('#').shift()
    .split('?').shift())+'/Single/'+(item.getType().split('.').pop())+'-'+item.getId();
    