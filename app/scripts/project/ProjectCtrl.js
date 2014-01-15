'use strict';

/* global toastr: false */
/* global google: false */
/* global constants: false */

var VOLUNTEER = 'VOLUNTEER';

var app = angular.module('atadosApp');

app.controller('ProjectCtrl', function($scope, $state, $stateParams, $http, Auth, Restangular, $modal) {

  $scope.markers = [];
  $scope.landing = false;

  Restangular.one('project', $stateParams.slug).get().then(function(response) {
    $scope.project = response;
    window.project = $scope.project;
    $scope.site.title = 'Ato - ' + $scope.project.name;
    $scope.image = $scope.project.image_url;

    $scope.project.causes.forEach( function (c) {
      c.image = constants.storage + 'cause_' + c.id + '.png';
    });
    $scope.project.skills.forEach(function (s) {
      s.image = constants.storage + 'skill_' + s.id + '.png';
    });

    if ($scope.project.work) {
      var availabilities = [];
      for (var period = 0; period < 3; period++) {
        var periods = [];
        availabilities.push(periods);
        for (var weekday = 0; weekday < 7; weekday++) {
          periods.push({checked: false});
        }
      }
      $scope.project.work.availabilities.forEach(function(a) {
        availabilities[a.period][a.weekday].checked = true;
      });
      $scope.project.work.availabilities = availabilities;
    }

    $scope.causes().forEach(function(c) {
      $scope.project.causes.forEach(function(nc) {
        if (c.id === nc) {
          var i = $scope.project.causes.indexOf(nc);
          $scope.nonprofit.causes[i] = c;
        }
      });
    });

    if ($scope.project.address) {
      $scope.markers.push($scope.project.address);
      $scope.center = new google.maps.LatLng($scope.project.address.latitude, $scope.project.address.longitude);
      $scope.zoom = 15;
    }
  }, function() {
    $state.transitionTo('root.home');
    toastr.error('Ato não encontrado.');
  });

  $scope.showApplyToProjectButton = function () {
    return $scope.loggedUser && $scope.loggedUser.role === VOLUNTEER;
  };

  $scope.alreadyApplied = false;
  $scope.applyVolunteerToProject = function () {
    if (!$scope.loggedUser) {

    }
    var template = '/views/volunteerContractModal.html';
    if ($scope.alreadyApplied) {
      template = '/views/volunteerUnapplyModal.html';
    }

    var modalInstance = $modal.open({
      templateUrl: template,
      resolve: {
        nonprofit: function () {
          return $scope.project.nonprofit;
        }
      },
      controller: function ($scope, $modalInstance, nonprofit) {
        $scope.nonprofit = nonprofit;

        $scope.ok = function () {
          $modalInstance.close();
        };

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
      }
    });
    modalInstance.result.then(function () {
      $http.post(constants.api + 'apply_volunteer_to_project/', {project: $scope.project.id})
      .success(function (response) {
        if (response[0] === 'Applied') {
          $scope.project.volunteers.push($scope.loggedUser);
          $scope.alreadyApplied = true;
        } else {
          $scope.project.volunteers.splice($scope.project.volunteers.indexOf($scope.loggedUser),1);
          $scope.alreadyApplied = false;
        }
      }).error(function () {
        toastr.error('Não conseguimos te atar. Por favor mande um email para resolvermos o problema: contato@atados.com.br');
      });
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });
  };

  $scope.$watch('loggedUser + $scope.project', function () {
    if ($scope.loggedUser && $scope.loggedUser.role === VOLUNTEER && $scope.project) {
      $http.get(constants.api + 'has_volunteer_applied/?project=' + $scope.project.id.toString())
        .success(function (response) {
          if (response[0] === 'YES') {
            $scope.alreadyApplied = true;
          } else {
            $scope.alreadyApplied = false;
          }
        });
    }
  });
});


