window.App = {
  data: {
  },

  start: function() {
    this.data.lists = new App.Lists();
    cview = new App.ListsView({el: 'body', collection: this.data.lists})
    this.data.lists.fetch();
  },

  visitList: function(list) {
    this.data.list = list;
    this.data.items = new App.Items([], {list: list.get('name')});
    this.data.items.fetch();
    this.data.page = new App.ListPage({el: 'body', model: list});
  }
}
