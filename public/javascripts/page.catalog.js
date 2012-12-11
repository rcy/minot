App.Views.CatalogPage = Backbone.View.extend({
  template: Handlebars.compile($("#catalogpage-template").html()),
  initialize: function(itemsCollection) {
  },
  events: {
    "click button.create": "create"
  },
  create: function() {
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
    this.modal.close();
    this.listsView.close();
  }
});

App.Views.ModalListCreate = Backbone.View.extend({
  template: Handlebars.compile($("#createListModal-template").html()),
  initialize: function(options) {
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
    var model = new App.Models.List();
    var arr = this.$el.find('form').serializeArray();
    var obj = {};
    for (i in arr) {
      obj[arr[i].name] = arr[i].value;
    }
    // add a default field to start
    obj['fields'] = [{name: 'item', type: 'string'}];

    var $popup = this.$el;
    model.save(obj, {
      wait: true, 
      success: function() { 
        $popup.on('hidden', function() {
          App.visitList(model);
        });
        $popup.modal('hide');
      },
      error: function(obj) { 
        alert('save error!'+obj);
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
