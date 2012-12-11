App.Models.List = Backbone.Model.extend({
  urlRoot: '/api/lists',
  itemTemplateHTML: function() {
    console.log('computing itemTemplateHTML')
    var html = this.get('itemTemplateHTML');
    if (html) {
      return html;
    } else {
      var fields = this.get('fields');
      return _.map(fields, function(f) {
        return '<td>{{' + f.name + '}}</td>';
      }).join('');
    }
  }
});

App.Collections.Lists = Backbone.Collection.extend({
  model: App.Models.List,
  url: '/api/lists',
  parse: function(response) {
    return response.lists;
  },
  comparator: function(list) {
    return list.get('name');
  }
});

App.Views.List = Backbone.View.extend({
  tagName: 'li',
  className: 'list',
  template: Handlebars.compile('<a href="#"><i class="icon-list-alt"></i> {{name}}</a>'),

  events: {
    "click a": "click"
  },

  initialize: function(options) {
  },

  click: function() {
    var list = this.model;
    App.visitList(list);
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },
});

App.Views.Lists = Backbone.View.extend({
  initialize: function(options) {
    this.collection.on('reset', this.render, this);
  },

  render: function() {
    // var $el = this.$el;
    // $el.html(this.template());
    this.collection.forEach(function(model) {
      var listView = new App.Views.List({model: model});
      listView.render();
      this.$el.append(listView.el);
    }, this);
    return this;
  },
});
