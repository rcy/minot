window.App = {
  data: {
  },

  start: function() {
    cats = new App.Catalogs();
    cview = new App.CatalogsView({el: 'body', collection: cats})
    cats.fetch();
  },

  visitCatalog: function(cat) {
    docs = new App.Items([], {catalog: cat.get('name')});
    console.log(cat);
    dview = new App.ItemsView({collection: docs, el: 'body', itemTemplateHTML: "<%= summary %>"});
    catsettingview = new App.CatalogSettingsView({model: cat});
    docs.fetch();
  }
}
