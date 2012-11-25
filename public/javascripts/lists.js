App.Models.List = Backbone.Model.extend({
  itemTemplateHTML: function() {
    var html = this.get('itemTemplateHTML');
    if (html) {
      return html;
    } else {
      var fields = this.get('fields');
      // return "<%= " + fields[0].name + " %>";
      
      return _.map(fields, function(f) {
        return "<td><%= " + f.name + " %></td>";
      }).join('');
    }
  }
});

App.Collections.Lists = Backbone.Collection.extend({
  model: App.Models.List,
  url: '/api/lists',
  parse: function(response) {
    return response.lists;
  }
});

App.Views.List = Backbone.View.extend({
  tagName: 'li',
  className: 'list',
  template: _.template('<a href="#"><%= name %></a>'),

  events: {
    "click a": "click"
  },

  initialize: function(options) {
    this.model.on('change', this.render, this);
  },

  click: function() {
    var list = this.model;
    console.log('click', list);
    App.visitList(list);
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
});

App.Views.Lists = Backbone.View.extend({
  template: _.template('<div><a href="#">create new</a><table class="lists"></table></div>'),

  render: function() {
    var $el = this.$el;
    $el.html(this.template());
    this.collection.forEach(function(model) {
      var listView = new App.Views.List({model: model});
      listView.render();
      this.$el.find('.lists').append(listView.el);
    }, this);
    return this;
  },

  initialize: function(options) {
    this.collection.on('reset', this.render, this);
  }
});
