'use strict';

/* global toastr: false */
/* global google: false */
/* global constants: false */

var app = angular.module('atadosApp');

app.controller('NonprofitCtrl', function($scope, $state, $stateParams, $http, Auth, Restangular) {

  $scope.markers = [];
  $scope.activeProjects = true;
  $scope.nonprofit = {
    name: '',
    details: ''
  };
  $scope.landing = false;

  Restangular.one('nonprofit', $stateParams.slug).get().then(function(response) {
    $scope.nonprofit = response;
    if (!$scope.nonprofit.published) {
      $state.transitionTo('root.home');
      toastr.error('ONG ainda não foi aprovada. Se isso é um erro entre em contato por favor.');
    }

    if ($scope.nonprofit.projects) {
      $scope.nonprofit.projects.forEach(function (p) {
        p.causes.forEach( function (c) {
          c.image = constants.storage + 'cause_' + c.id + '.png';
        });
        p.skills.forEach(function (s) {
          s.image = constants.storage + 'skill_' + s.id + '.png';
          s.class = 'skill_' + s.id;
        });
        p.nonprofit.slug = p.nonprofit.user.slug;
        p.nonprofit.image_url = 'http://atadosapp.s3.amazonaws.com/' + p.nonprofit.image;
      });
    }
    $scope.site.title = 'ONG - ' + $scope.nonprofit.name;

    $scope.image = $scope.nonprofit.image_url;
    $scope.coverImage = $scope.nonprofit.cover_url;

    $scope.causes().forEach(function(c) {
      $scope.nonprofit.causes.forEach(function(nc) {
        if (c.id === nc) {
          var i = $scope.nonprofit.causes.indexOf(nc);
          $scope.nonprofit.causes[i] = c;
        }
      });
    });

    if ($scope.nonprofit.user.address) {
      $scope.nonprofit.address = $scope.nonprofit.user.address;
      $scope.markers.push($scope.nonprofit.address);
      $scope.center = new google.maps.LatLng($scope.nonprofit.address.latitude, $scope.nonprofit.address.longitude);
      $scope.zoom = 15;
    }
  }, function() {
    $state.transitionTo('root.home');
    toastr.error('Ong não encontrada.');
  });

  $scope.getProjects  = function () {
    if ($scope.nonprofit.projects) {
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
        } else {
          $scope.alreadyVolunteer = false;
        }
      }).error(function () {
        toastr.error('Não conseguimos te adicionar a lista de voluntários da ONG :(');
      });
  };

  $scope.alreadyVolunteer = false;

  $scope.$watch('loggedUser + $scope.nonprofit', function () {
    if ($scope.getLoggedUser() && $scope.getLoggedUser().role === constants.VOLUNTEER && $scope.nonprofit) {
      $http.get(constants.api + 'is_volunteer_to_nonprofit/?nonprofit=' + $scope.nonprofit.id.toString())
        .success(function (response) {
          if (response[0] === 'YES') {
            $scope.alreadyVolunteer = true;
          } else {
            $scope.alreadyVolunteer = false;
          }
        });
    }
  });
});
