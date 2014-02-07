'use strict';

/* global toastr: false */
/* global google: false */
/* global constants: false */

var app = angular.module('atadosApp');

app.controller('ProjectCtrl', function($scope, $rootScope, $state, $stateParams, $http, Auth, $modal, Volunteer, project) {

  $scope.landing = false;
  $scope.markers = [];
  $scope.project = project;
  $scope.nonprofit = $scope.project.nonprofit;
  $scope.site.title = 'Ato - ' + $scope.project.name;
  $scope.markers.push(project.address);
  $scope.options = {
    map: {
      center: new google.maps.LatLng($scope.project.address.latitude, $scope.project.address.longitude),
      zoom: 15,
    },
  };

  if (!project.published && $scope.loggedUser && project.nonprofit.id !== $scope.loggedUser.id) {
    $state.transitionTo('root.home');
    toastr.error('Ato ainda não foi aprovado. Se isso é um erro entre em contato por favor.');
  }
  if ($scope.loggedUser && $scope.loggedUser.role === constants.VOLUNTEER) {
    $http.get(constants.api + 'has_volunteer_applied/?project=' + project.id.toString())
      .success(function (response) {
        if (response[0] === 'YES') {
          $scope.alreadyApplied = true;
        } else {
          $scope.alreadyApplied = false;
        }
      });
  }


  $scope.$watch('center', function(value) {
    if (value && value.d === 46) {
      $scope.center = new google.maps.LatLng($scope.project.address.latitude, $scope.project.address.longitude);
    }
  });
    
  function openApplyModal () {
    var template = '/partials/volunteerContractModal.html';
    var controller = 'ProjectModalCtrl';

    if ($scope.alreadyApplied) {
      template = '/partials/volunteerUnapplyModal.html';
      controller = function ($scope, $modalInstance) {
        $scope.ok = function () {
          $modalInstance.close();
        };

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
          $scope.showApplyModal = false;
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
        },
        name: function () {
          return $scope.loggedUser.user.name;
        }
      },
      controller: controller
    });

    modalInstance.result.then(function (response) {
      if (response) {
        var volunteerPhone = response.phone;
        var volunteerName = response.name;
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
            $scope.loggedUser.user.name = volunteerName;
            Volunteer.save($scope.loggedUser, function(response) {
              console.log(response);
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
    });
  }

  $rootScope.$on('userLoggedIn', function(/*event, user*/) {
    if ($state.is('root.project') && $scope.showApplyModal && !$scope.alreadyApplied) {
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
});
