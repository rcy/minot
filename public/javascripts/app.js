window.App = {
  Views: {},
  Models: {},
  Collections: {},

  data: {
  },

  start: function() {
    this.data.lists = new App.Collections.Lists();
    cview = new App.Views.Lists({el: '#main', collection: this.data.lists})
    this.data.lists.fetch();
  },

  visitList: function(list) {
    this.data.list = list;
    this.data.items = new App.Collections.Items([], {list: list.get('name')});
    this.data.items.fetch();
    this.data.page = new App.Views.ListPage({el: '#main', model: list});
  }
}
