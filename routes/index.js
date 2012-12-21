
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Minot', user: req.user || null });
};
