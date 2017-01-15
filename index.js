var fs = require('fs');
var path = require('path');
var mbgl = require('mapbox-gl-native');
var sharp = require('sharp');
var request = require('request');


var map = new mbgl.Map({
  request: function(req, callback) {
    console.log(req.url);
    request({
      url: req.url,
      encoding: null,
      gzip: true,
      qs: {access_token: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpbG10dnA3NzY3OTZ0dmtwejN2ZnUycjYifQ.1W5oTOnWXQ9R1w8u3Oo1yA'}

    }, function (err, res, body) {
      if (err) {
        callback(err);
      } else if (res.statusCode == 200) {
        var response = {};

        if (res.headers.modified) { response.modified = new Date(res.headers.modified); }
        if (res.headers.expires) { response.expires = new Date(res.headers.expires); }
        if (res.headers.etag) { response.etag = res.headers.etag; }

        response.data = body;

        callback(null, response);
      } else {
        callback(new Error(JSON.parse(body).message));
      }
    });
  }
});

var style = {
  "name": "style",
  "version": 8,
  "sources": {
    "streets": {
      "tiles": ["https://b.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/{z}/{x}/{y}.vector.pbf"],
      type: 'vector',
      "tileSize": 512
    }
  },
  "layers": [
    {
      "id": "background",
      "type": "background",
      "interactive": true,
      "paint": {
        "background-color": "rgba(208,240,174,1)"
      },
    },
    {
      "id": "water",
      "type": "fill",
      "source": "streets",
      "source-layer": "water",
      "paint": {
        "fill-color": 'rgba(69,255,122,1)',
      }
    },
  ]
};

map.load(style);

var runs = 0;

var render = function() {
  map.render({zoom: 15, center: [ 15.0347900390625, 59.54824090473033 ]}, function(err, buffer) {
    if (err) throw err;

    var image = sharp(buffer, {
      raw: {
        width: 512,
        height: 512,
        channels: 4
      }
    });

    // Convert raw image buffer to PNG
    image.toFile('image' + runs + '.png', function(err) {
      if (err) throw err;
      if (!runs++)
        render();
    });
  });
};

render();
