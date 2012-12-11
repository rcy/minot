App.Views.ListPage = Backbone.View.extend({
  template: Handlebars.compile($("#listpage-template").html()),
  initialize: function(itemsCollection) {
    console.log('initialize listpage');
    this.model.bind('change', this.render, this);
    App.dispatcher.bind('item:view', this.viewItem, this);
  },
  events: {
    "click button.create": "create",
    "click .destroy": "destroy",
    "click .add-column": "addColumn"
  },
  viewItem: function(model) {
    console.log('got event, item:view', model);
    var modal = new App.Views.ModalViewItem({listModel: this.model, model: model});
    modal.render();
  },
  create: function() {
    var modal = new App.Views.ModalItemCreate({model: this.model});
    modal.render();
  },
  destroy: function() {
    if (confirm('Are you sure you want to delete "'+this.model.get('name')+'" forever?'))
      this.model.destroy({wait: true,
                          success: function(model, response) {
                          }
                         });
  },
  addColumn: function() {
    var modal = new App.Views.ModalColumnEdit({model: this.model});
    modal.render();
  },
  render: function() {
    console.log('page.list.js: App.Views.ListPage: render()');
    this.$el.html(this.template(this.model.toJSON()));
    this.itemsView = new App.Views.Items({
      el: this.$el.find(".items"), 
      collection: App.data.items, 
      itemTemplateHTML: this.model.itemTemplateHTML()
    }).render();
    return this;
  }
});

App.Views.ModalBase = Backbone.View.extend({
  events: {
    "shown": "modalReady",
    "submit form": "submit"
  },
  modalReady: function(e) {
    $(e.currentTarget).find('input:first').focus();
  },
  submit: function(e) {
    e.preventDefault();
    alert('submit');
  }
});

App.Views.ModalViewItem = App.Views.ModalBase.extend({
  template: Handlebars.compile($("#itemViewModal-template").html()),

  initialize: function(options) {
    this.listModel = options.listModel;
  },

  render: function() {
    console.log('itemModel:', this.model);
    console.log('listModel:', this.listModel);
    // var $popup = $(this.template(this.listModel.toJSON()));

    var obj = [];

    _.each(this.listModel.get('fields'),
           function(field) {
             obj.push({name: field.name, type: field.type, value: this.model.get(field.name)});
           }, this);

    var keyValue = obj.shift().value;
    var $popup = $(this.template({listName: this.listModel.get('name'), keyValue: keyValue, fields: obj}));

    this.setElement($popup);
    this.$el.modal();
    return this;
  },
});

App.Views.ModalColumnEdit = App.Views.ModalBase.extend({
  template: Handlebars.compile($("#editColumnModal-template").html()),
  render: function() {
    var $popup = $(this.template(this.model.toJSON()));
    this.setElement($popup);
    this.$el.modal();
    return this;
  },
  submit: function(e) {
    e.preventDefault();

    var arr = this.$el.find('form').serializeArray();
    var obj = {type:'string'};
    for (i in arr) {
      obj[arr[i].name] = arr[i].value;
    }
    
    var fields = _.clone(this.model.get('fields'));
    fields.push(obj);
    this.model.save({fields: fields});
    this.$el.modal('hide'); 
  }
});

App.Views.ModalItemCreate = Backbone.View.extend({
  template: Handlebars.compile($("#createItemModal-template").html()),
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
  template: Handlebars.compile($("#createItemForm-template").html()),
  initialize: function(options) {
    this.list = options.list;
    this.render();
  },
  serialize: function() {
    var arr = this.$el.serializeArray();
    var obj = {listId: this.list.id};
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
