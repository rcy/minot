minot = require('./minot');

minot.connect({dbName: 'rcytestdb', callback: start});

function start() {
  minot.catalogs(function(cats) {
    console.log('categories', cats);
  })

  minot.catalogCreate({name: "musicians i don't like", 
                       success: function(result) {
                         console.log('success', result);
                       },
                       failure: function(result) {
                         console.log('error', result);
                       }
                      });
}
