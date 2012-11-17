// docs = new App.Items([], {catalog: 'foo'});
// dview = new App.ItemsView({collection: docs, el: 'body', itemTemplateHTML: "<%= foo %>"});
// docs.fetch();


cats = new App.Catalogs();
cview = new App.CatalogsView({el: 'body', collection: cats})
cats.fetch();
