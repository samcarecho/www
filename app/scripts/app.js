'use strict';

// TODO(mpomarole): Move all hardcoded values to constants file;

var app = angular.module('atadosApp',
    ['restangular', 'ui.router', 'pascalprecht.translate', 'ui.bootstrap', 'facebook']);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
    function ($stateProvider, $urlRouterProvider, $locationProvider) {

  $stateProvider
    .state('root', {
      url: '',
      abstract: true,
      templateUrl: '/views/root.html',
      controller: 'AppController'
    })
    .state('root.home', {
      url: '/',
      template: '{{ input }}'
    })
    .state('root.404', {
      url: '/404',
      templateUrl: '/views/404.html'
    })
    .state('root.volunteer', {
      url: '/voluntario/:username',
      templateUrl: '/views/volunteerProfile.html',
      controller: 'VolunteerController',
      resolve: {
        /*propertyData: ['$stateParams', '$q', 'Restangular', function($stateParams, $q, Restangular) {
          var deferred = $q.defer();

          gapi.client.realestate.get($stateParams.propertyId).execute(function(r) {
              deferred.resolve(r);
          });
          return deferred.promise;
        }]*/
      }
    });

  // $urlRouterProvider.when('/test', '/test1');
  // $urlRouterProvider.otherwise('/');

  $locationProvider.html5Mode(true).hashPrefix('!');
}]);

app.config(['$httpProvider', function ($httpProvider) {

  var securityInterceptor = ['$location', '$q', function($location, $q) {

    function success(response) { return response; }

    function error(response) {
      // This is when the user is not logged in
      if (response.status === 401) {
        return $q.reject(response);
      } else if (response.status === 403) {
        $.removeCookie('access_token');
        $.removeCookie('csrftoken');
        $.removeCookie('sessionid');
        return $q.reject(response);
      }
      else {
        return $q.reject(response);
      }
    }

    return function(promise) {
      return promise.then(success, error);
    };
  }];

  $httpProvider.responseInterceptors.push(securityInterceptor);
}]);

app.config(['FacebookProvider', function(FacebookProvider) {
   FacebookProvider.init('307143646092581');
   FacebookProvider.setLocale('pt_BR');
   FacebookProvider.setCookie(false);
}]);

app.config(['$translateProvider', function($translateProvider) {
  $translateProvider.useStaticFilesLoader({
    prefix: '/languages/',
    suffix: '.json'
  });

  $translateProvider.preferredLanguage('pt_BR');
}]);

app.config(['RestangularProvider', function(RestangularProvider) {
  RestangularProvider.setBaseUrl('http://api.atados.com.br:8000/v1');
  RestangularProvider.setDefaultHttpFields({cache: true});
  RestangularProvider.setRequestSuffix('/.json');
}]);
