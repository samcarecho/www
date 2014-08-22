'use strict';

var app = angular.module('atadosApp');

app.controller('VolunteerModalCtrl', function($scope) {

  $scope.loginActive = true;
  $scope.$watch('loginActive', function (value) {
    if (value) {
      $scope.facebookState = 'Entrar ';
    } else {
      $scope.facebookState = 'Criar conta ';
    }
  });

  $scope.switchLoginActive = function () {
    $scope.loginActive = !$scope.loginActive;
  };

});
