'use strict';

var app = angular.module('atadosApp');

app.controller('LandingCtrl', function ($scope) {
  $scope.site.title = 'Atados - Juntando Gente Boa';
  $scope.landing = true;
});
