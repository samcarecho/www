'use strict';

var app = angular.module('atadosApp',
    ['ngResource', 'ui.router', 'pascalprecht.translate', 'ui.bootstrap']);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
    function ($stateProvider, $urlRouterProvider, $locationProvider) {

  $stateProvider
    .state('root', {
      url: '/',
      templateUrl: 'views/root.html',
      controller: 'AppController'
    })
    .state('root.404', {
      url: '404',
      templateUrl: 'views/404.html'
    })
    .state('admin', {
      url: '/admin',
      template: '<h1>This is a restricited area</h1>',
      resolve: {
        requireAdminUser: function (Auth) {
          toastr.error('We need a admin for this ' + Auth.user);
          var deferred = $q.defer();
          $timeout(function() {
            deferred.resolve('Hello!');
          }, 1000);
          return deferred.promise;
        }
      }
    });

  $urlRouterProvider.otherwise('/404');

  $locationProvider.html5Mode(true).hashPrefix('!');
}]);

app.config(['$httpProvider', function ($httpProvider) {
  var securityInterceptor = ['$location', '$q', function($location, $q) {

    function success(response) {
      return response;
    }

    function error(response) {
      // This is when the user is not logged in
      if (response.status === 401) {
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

app.config(['$translateProvider', function($translateProvider) {
  $translateProvider.useStaticFilesLoader({
    prefix: '/languages/',
    suffix: '.json'
  });

  $translateProvider.preferredLanguage('pt_BR');
}]);
