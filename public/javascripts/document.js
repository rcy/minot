App = {};

App.Document = Backbone.Model.extend();

App.Documents = Backbone.Collection.extend({
  model: App.Document,
  parse: function(response) {
    return response.documents;
  },
  initialize: function(models, options) {
    this.table = options.table;
    this.url = '/api/tables/'+this.table+'/documents';
    return this;
  }
});

App.DocumentView = Backbone.View.extend({
  tagName: 'li',
  className: 'document',
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

App.DocumentsView = Backbone.View.extend({
  template: _.template("<ul></ul>"),
  render: function() {
    var $el = this.$el;
    $el.html(this.template());
    this.collection.forEach(function(model) {
      var itemView = new App.DocumentView({model: model, template: this.itemTemplate});
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

docs = new App.Documents([], {table: 'todo'});
dview = new App.DocumentsView({collection: docs, el: 'body', itemTemplateHTML: "<%= summary %>"});
docs.fetch();
