var express = require('express'),
    router = express.Router(),
    mandrill = require('mandrill-api/mandrill'),
    mandrill_client = new mandrill.Mandrill(process.env.MANDRILL_API_KEY);

router.get('/', function (req, res) {
  res.render('feedback', { csrf: req.csrfToken() });
});

router.post('/', function (req, res) {
  var token = (req.session.token || req.session.t_last || 'NONE ENTERED').toUpperCase(),
      message = req.body.message,
      replyTo = req.body.email;
  var email = {
    to: [ { email: process.env.EMAIL_TO_ADDRESS } ],
    from_email: process.env.EMAIL_FROM_ADDRESS,
    from_name: process.env.EMAIL_FROM_NAME,
    headers: { 'Reply-To': replyTo },
    subject: process.env.EMAIL_SUBJECT,
    merge: true,
    global_merge_vars: [
      { name: 'token', content: token },
      { name: 'message', content: message }
    ]
  };
  mandrill_client.messages.sendTemplate({
    message: email,
    template_name: process.env.EMAIL_TEMPLATE_FEEDBACK,
    template_content: {}
  }, function (result) {
    res.render('feedback-thanks');
  });
});

router.get('/thanks', function (req, res) {
  res.render('feedback-thanks');
});

module.exports = router;
