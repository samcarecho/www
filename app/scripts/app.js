'use strict';

var app = angular.module('atadosApp', ['ui.router', 'pascalprecht.translate']);

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
    .state('root.login', {
      url: '/login',
      templateUrl: 'views/login.html'
    });
});

app.config(['$translateProvider', function($translateProvider) {
  $translateProvider.useStaticFilesLoader({
    prefix: '/languages/',
    suffix: '.json'
  });

  $translateProvider.preferredLanguage('pt_BR');
}]);
