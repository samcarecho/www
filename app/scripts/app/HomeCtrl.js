'use strict';

var app = angular.module('atadosApp');

app.controller('HomeCtrl', ['$scope', function($scope) {
  $scope.site.title = 'Atados - Juntando Gente Boa';
}]);
