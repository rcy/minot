App.Models.Item = Backbone.Model.extend({
  initialize: function() {
    var listId = this.get('listId');
    if (!listId) {
      throw "error: model: list must be defined";
    }
    this.urlRoot = '/api/lists/' + listId + '/items';
  }
});

App.Collections.Items = Backbone.Collection.extend({
  model: App.Models.Item,
  parse: function(response) {
    return response.items;
  },
  initialize: function(models, options) {
    this.listId = options.listId;
    this.url = '/api/lists/' + this.listId + '/items';
    return this;
  }
});

App.Views.Item = Backbone.View.extend({
  tagName: 'tr',
  className: 'item',
  template: Handlebars.compile("default template"),
  events: {
    "click": "click"
  },
  click: function(e) {
    App.dispatcher.trigger('item:view', this.model);
  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },
  initialize: function(options) {
    this.template = options.template;
    this.model.on('change', this.render, this);
    this.model.on('destroy', this.close, this);
  },
});

App.Views.Items = Backbone.View.extend({
  initialize: function(options) {
    this.itemTemplate = Handlebars.compile(options.itemTemplateHTML);
    this.collection.on('reset', this.render, this);
    this.collection.on('add', this.addItem, this);
  },
  render: function() {
    this.collection.forEach(function(model) {
      this.addItem(model);
    }, this);
    return this;
  },
  addItem: function(model) {
    var itemView = new App.Views.Item({model: model, template: this.itemTemplate});
    itemView.render();
    this.$el.prepend(itemView.el);
  },
});
