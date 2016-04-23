function querySpreadsheet(opts) {
    var params = {
        key: opts.spreadsheetKey,
        pub: 1,
        tqx: "responseHandler:" + opts.callback,
        tq: opts.sql
    };
    $.ajax({
        url: "http://spreadsheets.google.com/tq",
        dataType: "jsonp",
        data: params
    });
}

function response2GeoJson(response) {
    var geoJson = [];
    var cols = [];
    //populate columns:
	console.debug(response);
    $.each(response.table.cols, function(){
        cols.push(this.label);  
    })
    
    //populate rows:
    $.each(response.table.rows, function(){
        var entry = {
            type: "Feature",
            geometry: {
                type: 'Point',
                coordinates: []
            },
            properties: {}
        };
        var lat = null, lng = null, val = null;
        $.each(this.c, function(idx){
            val = this.f || this.v;
            switch(cols[idx].toLowerCase()) {
                case "lat":
                    lat = val;
                    break;
                case "lon":
                    lng = val;
                    break;
                default:
                    entry.properties[cols[idx]] = val;
            }
        });
        entry.geometry.coordinates.push(lng);
        entry.geometry.coordinates.push(lat);
        geoJson.push(entry);
    });
    //alert('var geoJSON = ' + JSON.stringify(geoJson) + ";");
    return geoJson;
}