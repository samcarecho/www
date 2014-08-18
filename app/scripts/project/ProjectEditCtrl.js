'use strict';

/* global toastr: false */

var app = angular.module('atadosApp');

app.controller('ProjectEditCtrl', function($scope, $state, $stateParams, Project, Photos, NONPROFIT, saoPaulo) {

  if (!$scope.loggedUser || $scope.loggedUser.role !== NONPROFIT) {
    $state.transitionTo('root.home');
    toastr.error('Precisa estar logado como ONG do ato para editar');
  } else {
    var foundProject = false;
    $scope.loggedUser.projects.forEach(function(p) {
      if (p.slug === $stateParams.slug) {
        foundProject = true;
        $scope.project = p;
        prepareProject();
      }
    });
    if (!foundProject) {
      $state.transitionTo('root.home');
      toastr.error('A ONG logada não é dona deste ato e não tem acesso de edição.');
    }
  }

  function prepareProject() {
    if ($scope.project.job) {
      $scope.jobActive = true;
      $scope.project.job.start_date = new Date($scope.project.job.start_date);
      $scope.project.job.end_date = new Date($scope.project.job.end_date);
      $scope.project.work = {
        availabilities: [],
        weekly_hours: 0,
        can_be_done_remotely: false
      };
    } else {
      $scope.jobActive = false;
      $scope.project.job = {
        start_date: new Date(),
        end_date: new Date()
      };
    }

    // Preparing the availability grid
    var availabilities = [];
    for (var period = 0; period < 3; period++) {
      var periods = [];
      availabilities.push(periods);
      for (var weekday = 0; weekday < 7; weekday++) {
        periods.push({checked: false, weekday: weekday, period: period});
      }
    }

    if ($scope.project.work && !$scope.project.work.availabilities) {
      $scope.project.work.availabilities = [];
    }

    availabilities.forEach(function(p) {
      p.forEach(function (a) {
        if ($scope.project.work) {
          $scope.project.work.availabilities.forEach(function(wa) {
            if (wa.weekday === a.weekday && a.period === wa.period) {
              a.checked = true;
            }
          });
        }
      });
    });
    if ($scope.project.work) {
      $scope.project.work.availabilities = availabilities;
    }

    if ($scope.project.image_url) {
      $scope.imageUploaded = true;
    }

    if (!$scope.project.address) {
      $scope.project.address = {
        city: saoPaulo.id
      };
    } else if (!$scope.project.address.city) {
      $scope.project.address.city = saoPaulo.id;
    }
  }

  $scope.$watch('short_facebook_event', function (value) {
    if (value) {
      $scope.project.facebook_event = 'https://www.facebook.com/events/' + value;
    } else {
      $scope.project.facebook_event = null;
    }
  });

  $scope.cityLoaded = false;

  $scope.uploadProjectImage = function(files) {
    if (files) {
      var fd = new FormData();
      fd.append('file', files[0]);
      Photos.setProjectPhoto(fd, $scope.project.id, function(response) {
        $scope.project.image_url = response.file;
        toastr.success('Foto do ato salva com sucesso.');
        $scope.imageUploaded = true;
      }, function() {
        $scope.imageUploaded = false;
        toastr.error('Error no servidor. Não consigo atualizar foto do ato :(');
      });
    }
  };

  $scope.removeRole = function (role) {
    $scope.project.roles.splice($scope.project.roles.indexOf(role), 1);
  };

  $scope.addRole = function (role) {
    if (role.vacancies && role.name && role.details) {
      $scope.project.roles.push($scope.newRole);
      $scope.newRole = {};
    } else {
      toastr.error('Esqueceu alguma informação do cargo?');
    }
  };

  $scope.saveProject = function () {
    if ($scope.jobActive) {
      $scope.project.job.start_date = $scope.project.job.start_date.getTime();
      $scope.project.job.end_date = $scope.project.job.end_date.getTime();
      delete $scope.project.work;
    } else {
      var ava = [];
      $scope.project.work.availabilities.forEach(function (period) {
        period.forEach(function (a) {
          if (a.checked) {
            ava.push(a);
          }
        });
      });
      $scope.project.work.availabilities = ava;

      delete $scope.project.job;
    }

    Project.save($scope.project, function (project) {
      $scope.project = project;
      toastr.success('Ato salvo.');
      $state.transitionTo('root.nonprofitadmin' , {slug: $scope.loggedUser.slug});
    }, function () {
      toastr.error('Não consigo salvar Ato. Entre em contato com o Atados para resolver o problema.');
    });
  };
});
