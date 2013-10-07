'use strict';

var app = angular.module('atadosApp', ['ngResource', 'ui.router', 'pascalprecht.translate', 'ui.bootstrap']);

app.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('root', {
      url: '',
      templateUrl: 'views/root.html',
      controller: 'MainController'
    })
    .state('root.landing', {
      url: '',
      templateUrl: 'views/landing.html'
    })
    .state('root.signup', {
      url: '/signup',
      templateUrl: 'views/signup-start.html'
    })
    .state('root.signup.nonprofit', {
      url: '/nonprofit',
      templateUrl: 'views/signup-nonprofit.html'
    })
    .state('root.signup.volunteer', {
      url: '/signup/volunteer',
      templateUrl: 'views/signup-volunteer.html'
    });
});

app.config(['$translateProvider', function($translateProvider) {
  $translateProvider.useStaticFilesLoader({
    prefix: '/languages/',
    suffix: '.json'
  });

  $translateProvider.preferredLanguage('pt_BR');
}]);
