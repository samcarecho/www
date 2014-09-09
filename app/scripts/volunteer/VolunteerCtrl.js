'use strict';

var app = angular.module('atadosApp');

app.controller('VolunteerCtrl', function($scope, volunteer) {

  $scope.volunteer = volunteer;
  $scope.landing = false;
  $scope.site.title = 'Voluntário - ' + volunteer.slug;
  $scope.site.description = volunteer.name;
  $scope.site.og.url = 'https://www.atados.com.br/voluntario/' + volunteer.slug;
  $scope.site.og.image = volunteer.image_url;


  $scope.selectMarker = function (marker, object) {
    angular.element(document.querySelector('#card-' + object.slug))
      .addClass('hover');
  };

  $scope.removeMarker = function (marker, object) {
    angular.element(document.querySelector('#card-' + object.slug))
      .removeClass('hover');
  };

});
