App.Views.CatalogPage = Backbone.View.extend({
  template: _.template($("#catalogpage-template").html()),
  initialize: function(itemsCollection) {
  },
  events: {
    "click button.create": "create"
  },
  create: function() {
    console.log('create list');
    this.modal.render();
  },
  render: function() {
    this.$el.html(this.template());
    this.listsView = new App.Views.Lists({
      el: this.$el.find('.items'),
      collection: App.data.lists
    });
    this.modal = new App.Views.ModalListCreate();
    return this;
  },
  onClose: function() {
    console.log('close: CatalogPage');
  //   this.remove();
  //   this.unbind();

    this.modal.close();
    this.listsView.close();
  }
});

App.Views.ModalListCreate = Backbone.View.extend({
  template: _.template($("#createListModal-template").html()),
  initialize: function(options) {
    console.log('modal LIST create');
  },
  events: {
    "click button.submit": "submit",
    "submit form": "submit",
    "shown": "modalReady"
  },
  modalReady: function(e) {
    $(e.currentTarget).find('input:first').focus();
  },
  submit: function() {
    var model = new App.Models.List();
    var arr = this.$el.find('form').serializeArray();
    var obj = {};
    for (i in arr) {
      obj[arr[i].name] = arr[i].value;
    }
    // add a default field to start
    obj['fields'] = [{name: 'item', type: 'string'}];

    model.save(obj, {
      wait: true, 
      success: function() { 
        alert('created');
      },
      error: function() { 
        alert('save error!'); 
      }
    });
  },
  render: function() {
    var $popup = $(this.template());
    this.setElement($popup);
    this.$el.modal();
    return this;
  },
});
