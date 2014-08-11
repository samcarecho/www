'use strict';

var app = angular.module('atadosApp');

app.controller('LandingCtrl', function ($scope) {

  $scope.site.title = 'Atados - Juntando Gente Boa';
  $scope.landing = true;

  $scope.$on('$destroy', function () {
    $scope.landing = false;
  });

  $scope.selectMarker = function (marker, object) {
    angular.element(document.querySelector('#card-' + object.slug))
      .addClass('hover');
  };

  $scope.removeMarker = function (marker, object) {
    angular.element(document.querySelector('#card-' + object.slug))
      .removeClass('hover');
  };
});
