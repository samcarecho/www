'use strict';

var app = angular.module('atadosApp', ['ui.router']);

app.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('landing', {
      url: '',
      templateurl: 'views/landing.html'
    })
    .state('login', {
      url: '/login',
      templateurl: 'views/login.html'
    });
});

/*
app.config(['$translateProvider', function($translateProvider) {
  $translateProvider.useStaticFilesLoader({
    prefix: '/languages/',
    suffix: '.json'
  });

  $translateProvider.preferredLanguage('pt_BR');
}]);*/
