'use strict';

var app = angular.module('atadosApp', ['ngCookies', 'ngResource', 'ui.router', 'pascalprecht.translate', 'ui.bootstrap']);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
    function ($stateProvider, $urlRouterProvider, $locationProvider) {

  var access = routingConfig.accessLevels;

  $stateProvider
    .state('root', {
      url: '/',
      templateUrl: 'views/root.html',
      controller: 'AppController'
    })
    .state('root.landing', {
      url: '/',
      templateUrl: 'views/landing.html'
    })
    .state('root.signup', {
      url: 'signup',
      templateUrl: 'views/signup-start.html'
    })
    .state('root.signup.nonprofit', {
      url: 'nonprofit',
      templateUrl: 'views/signup-nonprofit.html'
    })
    .state('root.signup.volunteer', {
      url: 'volunteer',
      templateUrl: 'views/signup-volunteer.html'
    })
    .state('root.404', {
      url: '404',
      templateUrl: 'views/404.html'
    });

  $urlRouterProvider.otherwise('404');

  $locationProvider.html5Mode(true).hashPrefix('!');
}]);

app.config(['$httpProvider', function ($httpProvider) {
  var interceptor = ['$location', '$q', function($location, $q) {
    function success(response) {
      return response;
    }

    function error(response) {
      // This is when the user is not logged in
      if (response.status === 401) {
        $location.path('/404');
        return $q.reject(respose);
      }
      else {
        return $q.reject(response);
      }
    }

    return function(promise) {
      return promise.then(success, error);
    }
  }];

  $httpProvider.responseInterceptors.push(interceptor);
}]);

app.config(['$translateProvider', function($translateProvider) {
  $translateProvider.useStaticFilesLoader({
    prefix: '/languages/',
    suffix: '.json'
  });

  $translateProvider.preferredLanguage('pt_BR');
}]);


app.run(['$rootScope', '$location', 'Auth', function ($rootScope, $location, Auth) {
  $rootScope.$on("$routeChangeStart", function (event, next, current) {
    $rootScope.error = null;
    if (!Auth.authorize(next.access)) {
      if (Auth.isLooggedIn()) {
        $location.path('/');
      } else {
        $location.path('/login');
      }
    }
  });
}]);

