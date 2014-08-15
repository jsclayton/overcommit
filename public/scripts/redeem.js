$(document).ready(function () {
  $('form#redeem').submit(function (e) {
    e.preventDefault();
    var $form = $(this),
        token = $form.find('input#token').val(),
        _csrf = $form.find('input#_csrf').val(),
        url = $form.attr('action');

    var req = $.post(url, { token: token, _csrf: _csrf });
    req.error(function (res) {
      $form.find('.form-group').addClass('has-error has-feedback');
      $form.find('span.form-control-feedback').removeClass('hidden');
    });
    req.done(function (data, status, res) {
      if (data.token) {
        window.location.href = '/' + data.token;
      }
    });
  });
});
