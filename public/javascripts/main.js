var Minot = {
  Model: {},
  Views: {},
  Collections: {}
}

Minot.Model = Backbone.Model.extend({
  idAttribute: '_id'
});

Backbone.View.prototype.close = function() {
  // thanks http://lostechies.com/derickbailey/2011/09/15/zombies-run-managing-page-transitions-in-backbone-apps/
  this.remove();
  this.unbind();
  
  if (this.onClose){
    this.onClose();
  }
}

$(document).ajaxError(function(e, xhr, options) {
  alert('ajaxError');
});

window.App = {
  Views: {},
  Models: {},
  Collections: {},

  data: {
  },

  dispatcher: _.clone(Backbone.Events),

  showPage: function(view) {
    if (this.data.page){
      this.data.page.close();
    }
    this.data.page = view;
    this.data.page.render();
    $("#main").html(this.data.page.el);
  },

  start: function(opts) {
    this.data.lists = new App.Collections.Lists();
    this.data.lists.fetch();

    this.user = new App.Models.User(opts.user)
    new App.Views.UserNavView({model: this.user, el: "#registration"}).render()

    this.showPage(new App.Views.CatalogPage({collection: this.data.lists}))
  },

  visitList: function(list) {
    this.data.list = list;
    this.data.items = new App.Collections.Items([], {listId: list.id});
    this.data.items.fetch();

    this.showPage(new App.Views.ListPage({model: list}));
  },
}


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
