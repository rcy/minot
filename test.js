r = require('rethinkdb')
r.connect({host:'localhost', port: 28015}, function(conn) {
//  r.db('test').tableCreate('bar').runp()
  // r.table('tv_shows').insert({ name: 'Star Trek TNG' }).runp()

//  r.db('test').table('tv_shows').count().runp()

  // conn.run(r.table('tv_shows'), function(show) {
  //   console.log(show)
  // })
  // conn.close()

  x = r.db('test').tableList();
  x.run().collect(function(a) { 
    console.log('x', a);
    return true;
  });

}, function() {
  throw 'connection failed';
});
