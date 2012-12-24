App.Models.Item = Minot.Model.extend({
  initialize: function() {
    var listId = this.get('listId');
    if (!listId) {
      throw "error: model: list must be defined";
    }
    this.urlRoot = '/api/lists/' + listId + '/items';
  },

  // convert array of model values into object, keyed by fieldId
  valuesToJSON: function() {
    var obj = {};
    _.each(this.get('values'), function(v) {
      obj[v.fieldId] = v.value;
    });
    console.log('valuesToJSON:', obj);
    return obj;
  },

  valueObj: function(fieldId) {
    var obj = _.find(this.get('values'), function(v) {
      return v.fieldId == fieldId;
    });
    return obj;
  },

  // return the value given by fieldId
  getValue: function(fieldId) {
    console.log('value', fieldId);
    console.log('values', this.get('values'));
    var obj = this.valueObj(fieldId);
    console.log(obj);
    return obj && obj.value;
  },
  // set value by fieldId
  setValue: function(fieldId, value){
    var obj = this.valueObj(fieldId);
    if (obj)
      obj.value = value;
    else {
      // no value exists in the array, push a new one
      var values = this.get('values');
      values.push({fieldId: fieldId, value: value});
    }
  }
});

App.Collections.Items = Backbone.Collection.extend({
  model: App.Models.Item,
  parse: function(response) {
    return response.items;
  },
  initialize: function(models, options) {
    this.listId = options.listId;
    this.url = '/api/lists/' + this.listId + '/items';
    return this;
  },
  comparator: function(item) {
    return item.id;
  }
});

App.Views.Item = Backbone.View.extend({
  tagName: 'tr',
  className: 'item',
  template: Handlebars.compile("default template"),
  events: {
    "click": "click"
  },
  click: function(e) {
    App.dispatcher.trigger('item:view', this.model);
  },
  render: function() {
    this.$el.html(this.template(this.model.valuesToJSON()));
    return this;
  },
  initialize: function(options) {
    this.template = options.template;
    this.model.on('change', this.render, this);
    this.model.on('destroy', this.close, this);
  },
});

App.Views.Items = Backbone.View.extend({
  initialize: function(options) {
    this.itemTemplate = Handlebars.compile(options.itemTemplateHTML);
    this.collection.on('reset', this.render, this);
    this.collection.on('add', this.addItem, this);
  },
  render: function() {
    this.collection.forEach(function(model) {
      this.addItem(model);
    }, this);
    return this;
  },
  addItem: function(model) {
    var itemView = new App.Views.Item({model: model, template: this.itemTemplate});
    itemView.render();
    this.$el.prepend(itemView.el);
  },
});
