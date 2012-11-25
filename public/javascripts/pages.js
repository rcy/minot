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
    var modal = new App.Views.ModalItemCreate({model: this.model});
    modal.render();
  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
});

App.Views.ModalItemCreate = Backbone.View.extend({
  template: _.template($("#createItemModal-template").html()),
  initialize: function(options) {
  },
  events: {
    "click button.submit": "submit",
    "shown": "modalReady"
  },
  modalReady: function(e) {
    $(e.currentTarget).find('input:first').focus();
  },
  submit: function() {
    var item = this.form.getModel(this.model);
    console.log('serialize:', item);
    item.save();
  },
  render: function() {
    var $popup = $(this.template(this.model.toJSON()));
    this.setElement($popup);
    this.form = new App.Views.ItemCreateForm({list: this.model});
    this.$el.find('.modal-body').html(this.form.el);
    this.$el.modal();
    return this;
  }
});

App.Views.ItemCreateForm = Backbone.View.extend({
  template: _.template($("#createItemForm-template").html()),
  initialize: function(options) {
    this.list = options.list;
    this.render();
  },
  getModel: function(list) {
    var arr = this.$el.serializeArray();
    var model = new App.Models.Item();
    for (i in arr) {
      model.set(arr[i].name, arr[i].value);
    }
    model.set('list', list.get('name'));
    return model;
  },
  render: function() {
    var form = this.template(this.list.toJSON());
    this.setElement(form);
    return this;
  }
});
