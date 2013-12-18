/* exported constants */
var constants = {
  'devApi': 'http://localhost:8000/v1/',
  'devStorage': 'http://localhost:8000/static/images/',
  'prodApi': 'http://beta.atados.com.br/v1/',
  'prodStorage': 'https://s3-sa-east-1.amazonaws.com/atadosapp/images/',
  'clientId': 'da4bc76b44b73cda7e4d',
  'clientSecret': '3414d4cc0fb94521f0361ee5aba1b7eb73b5a468',
  'facebookClientId': '307143646092581',
  'locale': 'pt_BR',
  'accessTokenCookie': 'access_token',
  'csrfCookie': 'csrftoken',
  'sessionIdCookie': 'sessionid',
  'grantType': 'password',
  'page_size': 8,
  'static_page_size': 50
};

constants.api = constants.prodApi;
constants.storage = constants.prodStorage;
