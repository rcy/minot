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
  click: function() {
    console.log('click', this.model.get('name'));
  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },
  initialize: function(options) {
    this.model.on('change', this.render, this);
  }
});

App.CatalogsView = Backbone.View.extend({
  template: _.template("<ul></ul>"),
  render: function() {
    var $el = this.$el;
    $el.html(this.template());
    this.collection.forEach(function(model) {
      var catalogView = new App.CatalogView({model: model});
      catalogView.render();
      this.$el.append(catalogView.el);
    }, this);
    return this;
  },
  initialize: function(options) {
    this.collection.on('reset', this.render, this);
  }
});
