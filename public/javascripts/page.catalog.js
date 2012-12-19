App.Views.CatalogPage = Backbone.View.extend({
  template: Handlebars.compile($("#catalogpage-template").html()),
  initialize: function(itemsCollection) {
  },
  events: {
    "click button.create": "create"
  },
  create: function() {
    var obj = {
      name: 'new untitled list',
      fields: [{name: 'summary', type: 'string'}]
    };
    var model = new App.Models.List(obj);
    model.save(null, {
      wait: true, 
      success: function() { 
        App.visitList(model);
      }
    });
  },
  render: function() {
    this.$el.html(this.template());
    this.listsView = new App.Views.Lists({
      el: this.$el.find('.items'),
      collection: App.data.lists
    });
    return this;
  },
  onClose: function() {
    this.listsView.close();
  }
});
