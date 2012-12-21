$('#inputName').focus();

function populateForm(input, errors) {
  // work bottom to top to leave focus at first error
  $.each(["password", "email", "name"], function(i, v) {
    var $cg = $('.control-group.' + v);
    
    $cg.find('input').attr('value', input[v]);

    if (errors[v]) {
      $cg.addClass('error')
         .find('.error-message').append(errors[v]);

      $cg.find('input').focus();
    }
  });
}
