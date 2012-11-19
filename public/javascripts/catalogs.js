App.Catalog = Backbone.Model.extend();
App.Catalogs = Backbone.Collection.extend({
  model: App.Catalog,
  url: '/api/catalogs',
  parse: function(response) {
    return response.catalogs;
  }
});

App.CatalogView = Backbone.View.extend({
  tagName: 'li',
  className: 'catalog',
  template: _.template('<a href="#"><%= name %></a>'),

  events: {
    "click a": "click"
  },

  initialize: function(options) {
    this.model.on('change', this.render, this);
  },

  click: function() {
    var cat = this.model;
    console.log('click', cat);
    App.visitCatalog(cat);
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
});

App.CatalogsView = Backbone.View.extend({
  template: _.template('<div><a href="#">create new</a><ul class="catalogs"></ul></div>'),

  render: function() {
    var $el = this.$el;
    $el.html(this.template());
    this.collection.forEach(function(model) {
      var catalogView = new App.CatalogView({model: model});
      catalogView.render();
      this.$el.find('.catalogs').append(catalogView.el);
    }, this);
    return this;
  },

  initialize: function(options) {
    this.collection.on('reset', this.render, this);
  }
});
