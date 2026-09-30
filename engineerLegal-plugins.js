function engineerLegal_getPlugins(plugin){
    const plugins = {
        //example: './flag/flag_50k54n53j54q56h48q53.action'
        api: '',
        calendar: '',
        core: '',
        gantt: '',
        list: '',
        map: '',
        table: '',
        timeline: '',
        tree: '',
        // JavaScript library files
        excel: '',
        html2canvas: '',
    };
    if (plugin){
        return plugins[plugin];
    } else {
        return plugins;
    }
}

function engineerLegal_getMaps(map){
    const maps = {
        africa: '',
        americas: '',
        apac: '',
        asia: '',
        australia: '',
        canada: '',
        china_greater: '',
        europe_engwal_sc_ni: '',
        europe_engwal_sc_ni_mercator: '',
        europe_uk: '',
        europe_uk_eu: '',
        europe_uk_principalities: '',
        middle_east: '',
        latam: '',
        patent_regions: '',
        uk: '',
        us: '',
        us_atlantic: '',
        us_california: '',
        us_midwest: '',
        us_northeast: '',
        us_southeast: '',
        us_southwest: '',
        us_states_dc: '',
        us_states_dc_overseas: '',
        us_states_dc_pr: '',
        us_states_dc_pr_vi: '',
        us_west: '',
        world: '',     
    };
    if (map){
        return maps[map];
    } else {
        return maps;
    }
}