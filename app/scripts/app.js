'use strict';

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
        // TODO(mpomarole): resolve current user here loading the profile
        /*propertyData: ['$stateParams', '$q', 'Restangular', function($stateParams, $q, Restangular) {
          var deferred = $q.defer();

          gapi.client.realestate.get($stateParams.propertyId).execute(function(r) {
              deferred.resolve(r);
          });
          return deferred.promise;
        }]*/
      }
    })
    .state('root.nonprofit', {
      url: '/ong/:slug',
      templateUrl: '/views/nonprofitProfile.html',
      controller: 'NonprofitController',
      resolse: {}
    })
    .state('root.nonprofitsignup', {
      url: '/cadastro/ong',
      templateUrl: '/views/signupNonprofit.html',
      controller: 'NonprofitSignupController',
      resolve: {}
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
        $.removeCookie(constants.accessTokenCookie);
        $.removeCookie(constants.csrfCookie);
        $.removeCookie(constants.sessionIdCookie);
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
   FacebookProvider.init(constants.facebookClientId);
   FacebookProvider.setLocale(constants.locale);
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
  RestangularProvider.setBaseUrl(constants.apiServerAddress);
  RestangularProvider.setDefaultHttpFields({cache: true});
  RestangularProvider.setRequestSuffix('/.json');
  // This function is used to map the JSON data to something Restangular expects
  RestangularProvider.setResponseExtractor(function(response, operation, what, url) {
    if (operation === "getList") {
      // Use results as the return type, and save the result metadata
      // in _resultmeta
      var newResponse = response.results;
      newResponse._resultmeta = {
        "count": response.count,
        "next": response.next,
        "previous": response.previous,
       };
      return newResponse;
    }
    return response;
  });
}]);
