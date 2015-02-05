
// other ESRI Basemaps to explore...
// World_Street_Map, World_Topo_Map, World_Imagery, NatGeo_World_Map, World_Light_Gray_Base
var oceans = new ol.layer.Tile({
    source: new ol.source.XYZ({        
        url: 'http://server.arcgisonline.com/arcgis/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}'
    })
});
var watercolor = new ol.layer.Tile({
    source: new ol.source.XYZ({
        // ESRI Basemaps to explore...
        // World_Street_Map, World_Topo_Map, World_Imagery, NatGeo_World_Map, World_Light_Gray_Base
        url: 'http://tile.stamen.com/watercolor/{z}/{x}/{y}.png'        
    })
});
var natgeo = new ol.layer.Tile({
    source: new ol.source.XYZ({
        // ESRI Basemaps to explore...
        // World_Street_Map, World_Topo_Map, World_Imagery, NatGeo_World_Map, World_Light_Gray_Base
        url: 'http://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}'
    })
});
var basemaps = {'oceans': oceans, 'watercolor': watercolor, 'natgeo': natgeo};
var basemap = oceans;

var map = new ol.Map({
    target: 'map',
    layers: [
        basemap
    ],
    renderer: exampleNS.getRendererFromQueryString(),
    target: document.getElementById('map'),
    controls: ol.control.defaults({
        attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
            collapsible: false
        })
    }),
    view: new ol.View({
        center: [-8139259.370296092, 4705772.670696784],
        zoom: 6,
        minZoom: 5,
        maxZoom: 14
    })
});

app = {};
app.map = map;
map.layers = {};
map.activeLayers = {};
map.basemaps = basemaps;
map.currentBasemap = basemap;

var canyonStyle = {};
var canyons = new ol.layer.Vector({
    source: new ol.source.GeoJSON({
        projection: 'EPSG:3857',
        url: 'data/geojson/canyons.json'
    }),
    style: function(feature, resolution) {
        var text = resolution < 5000 ? feature.get('NAME') : '';
        if (!canyonStyle[text]) {
            canyonStyle[text] = [new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, .6)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#319FD3',
                    width: 1
                })
            })];
        }
        return canyonStyle[text];
    }
});
map.layers['canyons'] = canyons;

var getCoralColors = function(text) {
    var colors = {},
        strokeColor = {R: '48', G: '128', B: '171'},
        fillColor = {R: '255', G: '255', B: '255'};
    // coloring Corals                
    if (text === 'Anthoathecatae') {
        strokeColor = {R: '221', G: '221', B: '00'};
        fillColor = {R: '255', G: '255', B: '16'};
    } else if (text === 'Antipatharia') {
        strokeColor = {R: '00', G: '221', B: '00'};
        fillColor = {R: '00', G: '255', B: '00'};
    } else if (text === 'Alcyonacea') {
        strokeColor = {R: '199', G: '00', B: '00'};
        fillColor = {R: '231', G: '24', B: '24'};
    } else if (text === 'Gorgonacea') {
        strokeColor = {R: '221', G: '93', B: '00'};
        fillColor = {R: '255', G: '125', B: '00'};
    } else if (text === 'Scleractinia') {
        strokeColor = {R: '133', G: '53', B: '9'};
        fillColor = {R: '165', G: '85', B: '65'};
    } else if (text === 'Pennatulacea') {
        strokeColor = {R: '163', G: '146', B: '177'};
        fillColor = {R: '195', G: '178', B: '214'};
    }
    colors['strokeColor'] = strokeColor;
    colors['fillColor'] = fillColor;
    return colors;
};

var coralStyle = {};
var corals = new ol.layer.Vector({
    source: new ol.source.GeoJSON({
        projection: 'EPSG:3857',
        url: 'data/geojson/corals.json'
    }),
    style: function(feature, resolution) {
        var text = resolution < 5000 ? feature.get('ORDER_') : '';
        var coralColors = getCoralColors(text),
            strokeColor = coralColors['strokeColor'],
            fillColor = coralColors['fillColor'];
        if (!coralStyle[text]) {
            coralStyle[text] = [new ol.style.Style({
                image: new ol.style.Circle({
                    stroke: new ol.style.Stroke({
                        color: 'rgba('+strokeColor['R']+', '+strokeColor['G']+', '+strokeColor['B']+', .6)',
                        width: 1.25
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba('+fillColor['R']+', '+fillColor['G']+', '+fillColor['B']+', .6)'
                    }),
                    radius: 5
                })                
            })];
        }
        return coralStyle[text];
    }
});
map.layers['corals'] = corals;

var seabed = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: 'https://s3.amazonaws.com/marco-public-2d/Conservation/SeabedForm/{z}/{x}/{y}.png'
    })
})
map.layers['seabed'] = seabed;

// Attempt #1
// var dangerZones = new ol.layer.Tile({
//     source: new ol.source.XYZ({
//         url: 'http://coast.noaa.gov/arcgis/rest/services/MarineCadastre/NavigationAndMarineTransportation/MapServer/8/tile/{z}/{y}/{x}'
//     })
// });
// map.layers['dangerZones'] = dangerZones;

// Attempt # 2
var dangerZones = new ol.layer.Tile({
    source: new ol.source.ArcGIS93Rest({ 
        url: "http://coast.noaa.gov/arcgis/rest/services/MarineCadastre/NavigationAndMarineTransportation/MapServer",
        params:{
            LAYERS:"8",
            FORMAT:"image/png",
        }
     })
});
map.layers['dangerZones'] = dangerZones;

// feature highlighting strategy
var highlightStyleCache = {};
var featureOverlay = new ol.FeatureOverlay({
    map: map,
    style: function(feature, resolution) {
        if (feature.get('NAME')) {
            var text = feature.get('NAME');
            if (!highlightStyleCache[text]) {
                highlightStyleCache[text] = [new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#38d',
                        width: 1
                    }),
                    fill: new ol.style.Fill({
                        // color: 'rgba(0,0,255,0.1)'
                        color: 'white'
                    })
                })];
            }
            return highlightStyleCache[text];
        } else if (feature.get('ORDER_')) {
            var text = feature.get('ORDER_');
            if (!highlightStyleCache[text]) {
                var coralColors = getCoralColors(text),
                    strokeColor = coralColors['strokeColor'],
                    fillColor = coralColors['fillColor'];                
                highlightStyleCache[text] = [new ol.style.Style({
                    image: new ol.style.Circle({
                        stroke: new ol.style.Stroke({
                            color: 'rgba('+strokeColor['R']+', '+strokeColor['G']+', '+strokeColor['B']+', 1)',
                            width: 1
                        }),
                        fill: new ol.style.Fill({
                            // color: 'rgba(255,255,255,1)'
                            color: 'rgba('+fillColor['R']+', '+fillColor['G']+', '+fillColor['B']+', 1)'
                        }),
                        radius: 5
                    })
                })];
            }
            return highlightStyleCache[text];
        }        
    }
});

var highlights = [];
var displayFeatureInfo = function(pixel) {
    var info = document.getElementById('info');
    var features = [];
    map.forEachFeatureAtPixel(pixel, function(feature, layer) {
        // had to do the following to prevent features from being added twice...
        if (features.indexOf(feature) === -1) {
            features.push(feature);
        }        
    });

    var output = '';

    // unhighlight any features no longer under the mouse
    var x = highlights.length;
    while (x--) {
        if (features.indexOf(highlights[x]) === -1) {
            featureOverlay.removeFeature(highlights[x]);
            highlights.splice(x, 1);
        }
    }
    
    if (features.length) {
        for (feature of features) {                    
            // highlight any features not yet highlighted
            if (highlights.indexOf(feature) === -1) {
                featureOverlay.addFeature(feature);
                highlights.push(feature);
            }

            // create info overlay context
            if (feature) {
                var text = feature.get('NAME');
                if (!text) {
                    text = feature.get('ORDER_');
                }
                output += text + '<br>';                
            }
        }
        info.innerHTML = output;
        info.style.display = 'block';
    } else {
        info.innerHTML = '';
        info.style.display = 'none';
    }
};

$(map.getViewport()).on('mousemove', function(evt) {
    var pixel = map.getEventPixel(evt.originalEvent);
    displayFeatureInfo(pixel);
});

// map.on('click', function(evt) {
//   displayFeatureInfo(evt.pixel);
// });

map.toggleLayer = function(layerName) {
    if (map.activeLayers[layerName]) {
        // then de-activate layer
        map.removeLayer(map.activeLayers[layerName]);
        delete map.activeLayers[layerName];    
        $('#' + layerName).find('span').removeClass('glyphicon-check');
        $('#' + layerName).find('span').addClass('glyphicon-unchecked');
    } else if (map.layers[layerName]) {
        // then activate layer
        map.addLayer(map.layers[layerName]);
        map.activeLayers[layerName] = map.layers[layerName];
        $('#' + layerName).find('span').removeClass('glyphicon-unchecked');
        $('#' + layerName).find('span').addClass('glyphicon-check');
    }
};

map.switchBasemaps = function(basemapName) {
    if (map.basemaps[basemapName] && map.currentBasemap !== basemapName) {
        map.removeLayer(map.basemaps[map.currentBasemap]);
        map.getLayers().insertAt(1, map.basemaps[basemapName]);
        // map.layers[0] = map.basemaps[basemapName];
        map.currentBasemap = basemapName;
    }
};

