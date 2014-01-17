'use strict';

/* global toastr: false */
/* global google: false */
/* global constants: false */

var app = angular.module('atadosApp');

app.controller('ProjectCtrl', function($scope, $rootScope, $state, $stateParams, $http, Auth, Restangular, $modal, Volunteer) {

  $scope.markers = [];
  $scope.landing = false;

  Restangular.one('project', $stateParams.slug).get().then(function(response) {
    $scope.project = response;
    $scope.nonprofit = $scope.project.nonprofit;
    window.project = $scope.project;
    window.nonprofit = $scope.nonprofit;
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

  $scope.alreadyApplied = false;
  window.scope = $scope;
  function openApplyModal () {
    var template = '/views/volunteerContractModal.html';
    var controller = 'ProjectModalCtrl';

    if ($scope.alreadyApplied) {
      template = '/views/volunteerUnapplyModal.html';
      controller = function ($scope, $modalInstance) {
        $scope.ok = function () {
          $modalInstance.close();
        };

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
      };
    }

    var modalInstance = $modal.open({
      templateUrl: template,
      resolve: {
        nonprofit: function () {
          return $scope.project.nonprofit;
        },
        phone: function () {
          return $scope.loggedUser.user.phone;
        }
      },
      controller: controller
    });

    modalInstance.result.then(function (response) {
      if (response) {
        var volunteerPhone = response.phone;
        var volunteerMessage = response.message;

        if (!$scope.alreadyApplied) {
          if (volunteerMessage && $scope.loggedUser.user.email && $scope.nonprofit.user.email) {
            $http.post(constants.api + 'send_volunteer_email_to_nonprofit/', {message: volunteerMessage, volunteer: $scope.loggedUser.user.email, nonprofit: $scope.nonprofit.user.email})
            .success(function () {
              toastr.success('Email enviado com sucesso!');
            }).error(function () {
              toastr.error('Não consegui enviar email para a ONG. Por favor mande um email para resolvermos o problema: contato@atados.com.br');
            });
          } else {
            toastr.error('Não consegui enviar email para a ONG. Por favor mande um email para resolvermos o problema: contato@atados.com.br');
          }

          if (volunteerPhone) {
            $scope.loggedUser.user.phone = volunteerPhone;
            Volunteer.save($scope.loggedUser, function() {
            }, function() {
            });
          }
        }
      }

      $http.post(constants.api + 'apply_volunteer_to_project/', {project: $scope.project.id})
      .success(function (response) {
        if (response[0] === 'Applied') {
          $scope.project.volunteers.push($scope.loggedUser);
          $scope.alreadyApplied = true;
          toastr.success('Parabéns! Você é voluntário para ' + $scope.project.name);
        } else {
          $scope.project.volunteers.splice($scope.project.volunteers.indexOf($scope.loggedUser),1);
          $scope.alreadyApplied = false;
          toastr.success('Você não é mais voluntário para ' + $scope.project.name);
        }
      }).error(function () {
        toastr.error('Não conseguimos te atar. Por favor mande um email para resolvermos o problema: contato@atados.com.br');
      });
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });
  }

  $rootScope.$on('userLoggedIn', function(/*event, user*/) {
    if ($scope.showApplyModal && !$scope.alreadyApplied) {
      openApplyModal();
    }
    else {
      $scope.showApplyModal = false;
    }
  });

  $rootScope.$on('userLoggedOut', function(/*event,*/) {
    $scope.alreadyApplied = false;
  });

  $scope.showApplyModal = false;
  $scope.applyVolunteerToProject = function () {
    if (!$scope.loggedUser) {
      $scope.openVolunteerModal();
      $scope.showApplyModal = true;
      toastr.info('Você tem que logar primeiro!');
    } else {
      openApplyModal();
    }
  };

  $scope.$watch('loggedUser + $scope.project', function () {
    if ($scope.loggedUser && $scope.loggedUser.role === constants.VOLUNTEER && $scope.project) {
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
