/* exported constants */
/* global google: false */
var constants = {
  'devUrl': 'http://www.atadoslocal.com.br:9000/',
  'prodUrl': 'http://beta.atados.com.br/',
  'devApi': 'http://www.atadoslocal.com.br:8000/v1/',
  'devStorage': 'http://www.atadoslocal.com.br:8000/static/images/',
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
  'active_cities': 4,
  'static_page_size': 300,
  'weekdays': [
    {1: 'Segunda'},
    {2: 'Terça'},
    {3: 'Quarta'},
    {4: 'Quinta'},
    {5: 'Sexta'},
    {6: 'Sabado'},
    {7: 'Domingo'}
  ],
  'periods': [
    {0: 'Manha'},
    {1: 'Tarde'},
    {2: 'Noite'}
  ],
  'markers': [],
  'map': null,
  'saoPauloCenter': new google.maps.LatLng(-23.5505199, -46.6333094),
  'curitibaCenter': new google.maps.LatLng(-25.4808762, -49.3044253),
  'brasiliaCenter': new google.maps.LatLng(-15.79211, -47.897751),
  'defaultZoom': 11
};

constants.api = constants.devApi;
constants.storage = constants.devStorage;
constants.url = constants.devUrl;
constants.selected = constants.url + 'images/heart.png';
constants.notselected = constants.url + 'images/blue.png';
