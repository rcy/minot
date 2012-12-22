App.Models.User = Minot.Model.extend({});

// display logged in user in nav bar
App.Views.UserNavView = Backbone.View.extend({
  template: Handlebars.compile($("#user-nav").html()),
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },
  events: {
//    "click .sign-in": "signIn", // uncomment to use login popup
    "click .sign-out": "signOut",
  },
  signIn: function(e) {
    e.preventDefault();
    var modal = new App.Views.ModalSignIn();
    modal.render();
  },
  signOut: function(e) {
    window.location = '/logout';
  }
});

App.Views.ModalSignIn = App.Views.ModalBase.extend({
  template: Handlebars.compile($("#sign-in-modal-template").html()),

  render: function() {
    var $popup = $(this.template());
    this.setElement($popup);
    this.$el.modal();
  },
  submit: function(e) {
    e.preventDefault();
    var formData = this.$el.find('form').serialize();
    $.ajax({ type: 'POST',
             data: formData,
             url: '/login',
             success: function() {
               alert('ok, welcome');
             },
             error: function() {
               alert('something went wrong');
               return false;
             }
           });
  }
});
