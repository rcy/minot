minot = require('./minot');

minot.connect({dbName: 'test', callback: fetch});

function fetch() {
  minot.listItems('todo', function(result) {
    console.log('todos', result);
  });
  minot.lists(function(result) {
    console.log('*** lists ***');
    for (var i in result) {
      console.log(result[i]);
    }
  });
}

function start() {
  console.log('start');

  minot.listCreate({name: "todo",
                    catalog: "default",
                    fields: [ 
                      {
                        name: 'summary',
                        type: 'string'
                      },
                      {
                        name: 'description',
                        type: 'string'
                      }
                    ],
                    callback: function(result) {
                      console.log('created list "todo"', result);
                      addItems();
                    }
                   });
}

function addItems() {
  minot.itemAdd("todo", {summary: "finish code", description: "keep working"}, itemAddedCB);
  minot.itemAdd("todo", {summary: "eat dinner", description: "yum"}, itemAddedCB);
  minot.itemAdd("todo", {summary: "sleep", description: "rest is important"}, itemAddedCB);
}

function itemAddedCB(result) {
  console.log('item added: ', result);
}

/*
  create a catalog (hasmany lists)
  create a list (hasmany items)
  item (hasmany fields)
  a list contains items and (optionally) templates
*/