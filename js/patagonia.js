//define your variables first:
//var spreadsheetKey = '1ToIik9kgQwLhpSxFD1FJLpuRpgB8XKxg3ozspEHDaVw';
var spreadsheetKeypts = '1ToIik9kgQwLhpSxFD1FJLpuRpgB8XKxg3ozspEHDaVw';
var map;
var panoramicLayer;
var audioLayer;
var photoLayer;

function init() {
    initNavigation();
    initMap();
}

function gotoLoc(elem, id, num) {
    var pos = elem.target.getAttribute(id);
    if (pos) {
	var loc = pos.split(',');
	map.setView(loc, num);
    }
}

function initNavigation() {
    document.getElementById('navigation').onclick = function(e) {
        gotoLoc(e, 'headquarters', 17);
    }
    document.getElementById('navigation2').onclick = function(e) {
	gotoLoc(e, 'lagunasaltas', 13);
    }
    document.getElementById('navigation3').onclick = function(e) {
	gotoLoc(e, 'aviles', 11);
    }
    document.getElementById('navigation4').onclick = function(e) {
        gotoLoc(e, 'cochrane', 15);
    }
    document.getElementById('navigation5').onclick = function(e) {
        gotoLoc(e, 'fullpark', 9);
    }
}

function initMap() {
    //initialize map:
    // TODO: change this to Maps for Good's access token
    L.mapbox.accessToken = 'pk.eyJ1IjoicmFjaGVsaHltYW4iLCJhIjoiY2luZ3RrOW9uMGpzc3Uya2o5azA0NjRjOCJ9.u946YHD4Vka5nfUuPswNYw'
    map = L.mapbox.map('map', 'http://a.tiles.mapbox.com/v3/mapsforgood.68ee8c52.json',  {
	detectRetina:true,
	maxZoom:21,
	minZoom:10, zoomControl: false 
    }).setView([37.698423, -123.005011], 16);
    
    //add map controls
    new L.Control.Zoom({ position: 'topleft' }).addTo(map);
    L.control.scale().addTo(map);
    map.gridControl.options.follow = true;
    map.on('zoomend', showHideMarkers);
    
    //add three empty layers to hold each kind of marker:
    panoramicLayer = L.mapbox.featureLayer().addTo(map);
    audioLayer = L.mapbox.featureLayer().addTo(map);
    photoLayer = L.mapbox.featureLayer().addTo(map);
    
    //query google doc for panoramic entries and add panoramic layer:
//    querySpreadsheet({
 //       spreadsheetKey: spreadsheetKey,
 //       sql: "SELECT * WHERE A = 'panoramic'",
 //       callback: "createPanoramicLayer"
 //   });
    
    //query google doc for photo entries and add photo layer:
    querySpreadsheet({
        spreadsheetKey: spreadsheetKeypts,
        callback: "createPhotoLayer"
    });
    
//    //query google doc for audio entries and add audio layer:
 //   querySpreadsheet({
 //       spreadsheetKey: spreadsheetKey,
 //       sql: "SELECT * WHERE A = 'audio'",
  //      callback: "createAudioLayer"
 //   });
}

function createPanoramicLayer(response) {
    var geoJson = response2GeoJson(response);
    
    //add new layer to the map:
    panoramicLayer.on('layeradd', function(e) {
        var marker = e.layer, feature = marker.feature;
        marker.setIcon(L.icon({
            "iconUrl": e.layer.feature.properties.icon_url,
            "iconSize": [35, 25], 
            "iconAnchor": [25, 25],
            "popupAnchor": [0, -25]
        }));
    });
    panoramicLayer.on('click',function(e) {
        $.colorbox({
            iframe: true,
            href: e.layer.feature.properties.image,
            width: "90%",
            height: "90%"
        });
    });
    panoramicLayer.setGeoJSON(geoJson);
    showHideMarkers();
}

function createAudioLayer(response) {
    var geoJson = response2GeoJson(response);
    
    //add new layer to the map:
    audioLayer.on('layeradd', function(e) {
        var marker = e.layer, feature = marker.feature;
        marker.setIcon(L.icon({
            "iconUrl": e.layer.feature.properties.icon_url,
            "iconSize": [25, 38], 
            "iconAnchor": [25, 25],
            "popupAnchor": [0, -25]
        }));
    });
    audioLayer.on('click',function(e) {
        $.colorbox({
            iframe: true,
            href: e.layer.feature.properties.image,
            width: "90%",
            height: "90%"
        });
    });
    audioLayer.setGeoJSON(geoJson);
    showHideMarkers();
}

function createPhotoLayer(response) {
    var geoJson = response2GeoJson(response);

    var points_collection = L.geoJson(geoJson, {
        pointToLayer: function(feature,latlng) {
            var marker = L.marker(latlng);
    //     marker.setIcon(L.icon({
    //         iconUrl: 'http://mapsforgood.org/demos/patagonia/images/PNP_POI.png',
    //         "iconSize": [11.25, 11.25], // size of the icon
    //             "iconAnchor": [10, 10], // point of the icon which will correspond to marker's location
    //             "popupAnchor": [0, -10]  // point from which the popup should open relative to the iconAnchor
    //     }));
            var content = '<r1>' + feature.properties.title + '<\/r1>' +
                '<img class="popup" src=' + feature.properties.image + '>'  + '<br><r3>' + feature.properties.credit + '<\/r3>' + 
                '<br><r2>' + feature.properties.blurb + '<\/r2>' +  '<br> <i><a href= ' +
                feature.properties.info + ' target="_blank"> Click here for more. </i>';
             marker.bindPopup(content);
             return marker;
            }
    });
    var clusters = L.markerClusterGroup();
    //add collection of points to cluster layer
    clusters.addLayer(points_collection);
    map.addLayer(clusters);

showHideMarkers();
}

function showHideMarkers() {
    //set photoLayer zoom:
    if (map.getZoom() > 10) {
        photoLayer.setFilter(function() { return true; });
    } else {
        photoLayer.setFilter(function() { return false; });
    }
    
    //set audio + panoramic layer zooms:
    if (map.getZoom() > 10) {
        audioLayer.setFilter(function() { return true; });
        panoramicLayer.setFilter(function() { return true; });
    } else {
        audioLayer.setFilter(function() { return false; });
        panoramicLayer.setFilter(function() { return false; });
    }
}
