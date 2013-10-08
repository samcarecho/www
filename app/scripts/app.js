'use strict';

var app = angular.module('atadosApp', ['ngCookies', 'ngResource', 'ui.router', 'pascalprecht.translate', 'ui.bootstrap']);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

  var access = routingConfig.accessLevels;

  $stateProvider
    .state('root', {
      url: '/',
      templateUrl: 'views/root.html',
      controller: 'MainController'
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

  $locationProvider.html5Mode(true);
  $locationProvider.hashPrefix = '!';
}]);

app.config(['$translateProvider', function($translateProvider) {
  $translateProvider.useStaticFilesLoader({
    prefix: '/languages/',
    suffix: '.json'
  });

  $translateProvider.preferredLanguage('pt_BR');
}]);
