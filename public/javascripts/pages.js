App.ListPage = Backbone.View.extend({
  template: _.template('<h1><%= name %></h1><hr><div id="items"></div>'),
  initialize: function(itemsCollection) {
    console.log('init App.ListPage');
    this.render();
    this.itemsView = new App.ItemsView({
      el: "#items", 
      collection: App.data.items, 
      itemTemplateHTML: this.model.itemTemplateHTML()
    });
  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
});
