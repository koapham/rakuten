const routes = require('next-routes')();

//create routes with custom tokens

routes
     .add('/profile/:address', '/profile')
     .add('/surveys/postSurvey', '/surveys/postSurvey')
     .add('/surveys/:address', '/surveys/show')
     .add('/:value','/index')

module.exports = routes;
