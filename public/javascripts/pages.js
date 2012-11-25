App.ListPage = Backbone.View.extend({
  template: _.template($("#listpage").html()),
  initialize: function(itemsCollection) {
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
