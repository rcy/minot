App.Views.ListPage = Backbone.View.extend({
  template: Handlebars.compile($("#listpage-template").html()),
  initialize: function(itemsCollection) {
    this.model.bind('change', this.render, this);
    App.dispatcher.bind('item:view', this.viewItem, this);
  },
  events: {
    "click .create": "create",
    "click .destroy-list": "destroyList",
    "click .add-column": "addColumn",
    "click .destroy-column": "destroyColumn",
    "click .rename-column": "renameColumn",
    "click .column-name": "renameColumn",
    "click .list-name": "renameList"
  },
  viewItem: function(model) {
    var modal = new App.Views.ModalViewItem({listModel: this.model, model: model});
    modal.render();
  },
  create: function() {
    var modal = new App.Views.ModalItemCreate({model: this.model});
    modal.render();
  },
  destroyList: function() {
    if (confirm('Are you sure you want to delete "'+this.model.get('name')+'" forever?'))
      this.model.destroy({wait: false,
                          success: function(model, response, options) {
                            window.location="/";
                          },
                          error: function(model, response, options) {
                            alert(response);
                          }
                         });
  },
  addColumn: function() {
    var fields = _.clone(this.model.get('fields'));
    fields.push({name:'untitled', type:'string'});
    this.model.save({fields: fields}, {wait:true});
  },
  destroyColumn: function(e) {
    e.preventDefault();
    if (confirm('Are you sure you want to permanently delete this column?')) {
      var delId = $(e.currentTarget).data('id');
      var fields = _.reject(this.model.get('fields'), function(f) { return f._id === delId; });
      this.model.save({fields: fields});
    }
  },
  renameColumn: function(e) {
    console.log('renameColumn');
    e.preventDefault();
    setTimeout(function() {
      var $colEl = $(e.currentTarget).parents('th').find('.column-name');
      $colEl.editable('option', 'type', 'text');
      $colEl.editable('show');
    }, 0);
  },
  renameList: function(e) {
    e.preventDefault();
    $(e.currentTarget).editable('option', 'type', 'text');
    $(e.currentTarget).editable('show');
  },
  render: function() {
    var model = this.model;
    this.$el.html(this.template(this.model.toJSON()));
    this.$el.find('.editable.column-name').editable({ 
      toggle:'manual',
      emptytext: '',
      url: function(params) {
        var fieldID = params.name, newName = params.value;
        console.log('setting field:',fieldID,'to', newName, 'in model', model.id);
        model.setFieldAttr(fieldID, 'name', newName);
        model.save();
      }
    });
    this.$el.find('.editable.list-name').editable({
      toggle:'manual',
      emptytext: 'No Title',
      url: function(params) {
        model.save({name: params.value});
      }
    });
    this.itemsView = new App.Views.Items({
      el: this.$el.find(".items"), 
      collection: App.data.items, 
      itemTemplateHTML: this.model.itemTemplateHTML()
    }).render();
    return this;
  }
});

App.Views.ModalViewItem = App.Views.ModalBase.extend({
  template: Handlebars.compile($("#itemViewModal-template").html()),

  initialize: function(options) {
    this.listModel = options.listModel;
  },

  render: function() {
    var obj = [];

    _.each(this.listModel.get('fields'),
           function(field) {
             obj.push({id: field._id, name: field.name, type: field.type, value: this.model.getValue(field._id)});
           }, this);
    console.log('obj',obj);
    var titleField = obj.shift(); // titles the model, not in regular list of fields in body
    var $popup = $(this.template({listName: this.listModel.get('name'), titleField: titleField, fields: obj}));

    this.setElement($popup);
    this.$el.modal();
    var model = this.model;
    this.$el.find('.editable').editable({ 
      toggle:'manual',
      url: function(params) {
        console.log('params:', params);
        console.log('setting:', params.name, 'to', params.value, 'for', model.id);
        model.setValue(params.name, params.value);
        model.save(null, {wait:false, 
                          error:function(model, xhr, options) {
                            console.log('save error', model, xhr, options);
                          },
                          success:function(model, xhr, options) {
                            //console.log('save success', model, xhr, options);
                            model.trigger('change');
                          }
                         });
      }
    });
    return this;
  },

  events: {
    "click .destroy": "destroy",
    "click .editable": "editField"
  },

  editField: function(e) {
    console.log('editField',e);
    e.preventDefault();

    $(e.currentTarget).editable('option', 'type', 'text');
    $(e.currentTarget).editable('show');
  },

  destroy: function() {
    if (confirm('are you sure you want to delete "' + this.model.get(this.listModel.mainField()) + '"?')) {
      this.model.destroy();
      this.$el.modal('hide');
    }
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
    console.log(model);
    var $popup = this.$el;

    App.data.items.create(model, {
      wait: false, 
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
    var obj = {listId: this.list.id, values: []};
    for (i in arr) {
      var value = { fieldId:arr[i].name, value:arr[i].value };
      obj.values.push(value);
    }
    return obj;
  },
  render: function() {
    var form = this.template(this.list.toJSON());
    this.setElement(form);
    return this;
  }
});
