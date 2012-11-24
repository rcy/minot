window.App = {
  data: {
  },

  start: function() {
    this.data.lists = new App.Lists();
    cview = new App.ListsView({el: 'body', collection: this.data.lists})
    this.data.lists.fetch();
  },

  visitList: function(list) {
    this.data.items = new App.Items([], {list: list.get('name')});
    dview = new App.ItemsView({collection: this.data.items, el: 'body', itemTemplateHTML: list.itemTemplateHTML() });
    this.data.items.fetch();
  }
}
