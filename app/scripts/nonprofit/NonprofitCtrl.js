'use strict';

/* global toastr: false */
/* global google: false */
/* global constants: false */

var app = angular.module('atadosApp');

app.controller('NonprofitCtrl', function($scope, $http, nonprofit) {

  $scope.nonprofit = nonprofit;
  $scope.landing = false;
  $scope.site.title = 'ONG - ' + $scope.nonprofit.name;
  $scope.activeProjects = true;
  $scope.markers = [];

  $scope.causes().forEach(function(c) {
    $scope.nonprofit.causes.forEach(function(nc) {
      if (c.id === nc) {
        var i = $scope.nonprofit.causes.indexOf(nc);
        $scope.nonprofit.causes[i] = c;
      }
    });
  });

  if (nonprofit.user.address) {
    $scope.nonprofit.address = $scope.nonprofit.user.address;
    $scope.markers.push(nonprofit.address);
    $scope.center = new google.maps.LatLng(nonprofit.address.latitude, $scope.nonprofit.address.longitude);
    $scope.zoom = 15;
  }

  $scope.getProjects  = function () {
    if (nonprofit.projects) {
      if ($scope.activeProjects) {
        return $scope.nonprofit.projects.filter(function (p) { return !(p.closed || p.deleted); });
      } else {
        return $scope.nonprofit.projects.filter(function (p) { return p.closed || p.deleted; });
      }
    }
  };

  $scope.showAddVolunteerToNonprofitButton = function () {
    return $scope.loggedUser && $scope.loggedUser.role === constants.VOLUNTEER;
  };

  $scope.addVolunteerToNonprofit = function () {
    $http.post(constants.api + 'set_volunteer_to_nonprofit/', {nonprofit: $scope.nonprofit.id})
      .success(function (response) {
        if (response[0] === 'Added') {
          $scope.alreadyVolunteer = true;
          $scope.nonprofit.volunteers.push($scope.loggedUser);
          toastr.success('Parabéns você foi adicionada(o) a lista de voluntários da ONG!', $scope.loggedUser.slug);
        } else {
          toastr.success('Você foi removida(o) da lista de voluntários da ONG. Ela vai sentir sua falta.', $scope.loggedUser.slug);
          var index = $scope.nonprofit.volunteers.indexOf($scope.loggedUser);
          if (index > -1) {
            $scope.nonprofit.volunteers.splice(index, 1);
          }
          $scope.alreadyVolunteer = false;
        }
      }).error(function () {
        toastr.error('Não conseguimos te adicionar a lista de voluntários da ONG :(');
      });
  };

  $scope.alreadyVolunteer = false;

  if ($scope.loggedUser && $scope.loggedUser.role === constants.VOLUNTEER) {
    $http.get(constants.api + 'is_volunteer_to_nonprofit/?nonprofit=' + $scope.nonprofit.id.toString() + '&id=' + new Date().getTime())
      .success(function (response) {
        if (response[0] === 'YES') {
          $scope.alreadyVolunteer = true;
        } else {
          $scope.alreadyVolunteer = false;
        }
      });
  }
});
