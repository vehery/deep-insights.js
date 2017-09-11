var cdb = require('cartodb.js');

module.exports = {
  createDefaultVis: function () {
    return cdb.createVis(document.createElement('div'), {
      bounds: [[24.206889622398023, -84.0234375], [76.9206135182968, 169.1015625]],
      datasource: {
        maps_api_template: 'asd',
        user_name: 'pepe'
      },
      layers: [{type: 'cartodb', source: {id: 'a0'}}, {type: 'torque'}]
    });
  }
};
