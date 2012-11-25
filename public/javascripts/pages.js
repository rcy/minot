App.Views.ListPage = Backbone.View.extend({
  template: _.template($("#listpage-template").html()),
  initialize: function(itemsCollection) {
    this.render();
    this.itemsView = new App.Views.Items({
      el: "#items", 
      collection: App.data.items, 
      itemTemplateHTML: this.model.itemTemplateHTML()
    });
  },
  events: {
    "click button.create": "create"
  },
  create: function() {
    console.log('create', this.model);
    new App.Views.ModalItemCreate({model: this.model});
  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
});

App.Views.ModalItemCreate = Backbone.View.extend({
  template: _.template($("#createItemModal-template").html()),
  initialize: function(options) {
    this.render();
  },
  render: function() {
    var form = new App.Views.ItemCreateForm({list: this.model});
    var $popup = $(this.template(this.model.toJSON()));
    $popup.find('.modal-body').html(form.el);
    $popup.modal();
  }
});

App.Views.ItemCreateForm = Backbone.View.extend({
  template: _.template($("#createItemForm-template").html()),
  initialize: function(options) {
    this.list = options.list;
    this.render();
  },
  render: function() {
    this.$el.html(this.template(this.list.toJSON()));
    return this;
  }
});
