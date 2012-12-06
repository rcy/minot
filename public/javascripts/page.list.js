App.Views.ListPage = Backbone.View.extend({
  template: _.template($("#listpage-template").html()),
  initialize: function(itemsCollection) {
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
    this.itemsView = new App.Views.Items({
      el: this.$el.find(".items"), 
      collection: App.data.items, 
      itemTemplateHTML: this.model.itemTemplateHTML()
    });
    return this;
  }
});

App.Views.ModalItemCreate = Backbone.View.extend({
  template: _.template($("#createItemModal-template").html()),
  initialize: function(options) {
    console.log('modal ITEM create');
  },
  events: {
    "submit form": "submit",
    "shown": "modalReady"
  },
  modalReady: function(e) {
    $(e.currentTarget).find('input:first').focus();
  },
  submit: function(e) {
    e.preventDefault();
    var model = new App.Models.Item(this.form.serialize());
    var $popup = this.$el;

    App.data.items.create(model, {
      wait: true, 
      success: function() { 
        $popup.modal('hide'); 
      },
      error: function() { 
        alert('save error!'); 
      }
    });
  },
  render: function() {
    var $popup = $(this.template(this.model.toJSON()));
    this.setElement($popup);
    this.form = new App.Views.ItemCreateForm({list: this.model});
    this.$el.find('.modal-form-container').html(this.form.el);
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
  serialize: function() {
    var arr = this.$el.serializeArray();
    var obj = {list: this.list.get('name')};
    for (i in arr) {
      obj[arr[i].name] = arr[i].value;
    }
    return obj;
  },
  render: function() {
    var form = this.template(this.list.toJSON());
    this.setElement(form);
    return this;
  }
});
