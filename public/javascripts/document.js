App = {};

App.Item = Backbone.Model.extend();

App.Items = Backbone.Collection.extend({
  model: App.Item,
  parse: function(response) {
    return response.items;
  },
  initialize: function(models, options) {
    this.catalog = options.catalog;
    this.url = '/api/catalogs/'+this.catalog+'/items';
    return this;
  }
});

App.ItemView = Backbone.View.extend({
  tagName: 'li',
  className: 'item',
  template: _.template("default template"),
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },
  initialize: function(options) {
    this.template = options.template;
    this.model.on('change', this.render, this);
  }
});

App.ItemsView = Backbone.View.extend({
  template: _.template("<ul></ul>"),
  render: function() {
    var $el = this.$el;
    $el.html(this.template());
    this.collection.forEach(function(model) {
      var itemView = new App.ItemView({model: model, template: this.itemTemplate});
      itemView.render();
      this.$el.append(itemView.el);
    }, this);
    return this;
  },
  initialize: function(options) {
    this.itemTemplate = _.template(options.itemTemplateHTML);
    this.collection.on('reset', this.render, this);
  }
});

docs = new App.Items([], {catalog: 'todo'});
dview = new App.ItemsView({collection: docs, el: 'body', itemTemplateHTML: "<%= summary %>"});
docs.fetch();
