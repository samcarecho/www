'use strict';

/* global toastr: false */
/* global constants: false */

var app = angular.module('atadosApp');

app.controller('ProjectNewCtrl', function($scope, $filter, $state, Auth, Restangular) {

  $scope.project = {
    name: '',
    nonprofit: $scope.loggedUser,
    slug: '',
    address: {
      neighborhood: '',
      zipcode: '',
      addressline: '',
      addressnumber: ''
    },
    description: '',
    details: '',
    responsible: '',
    phone: '',
    email: '',
    facebook_event: '',
    legacy_id: null,
    causes: [],
    skills: [],
    roles: [],
  };

  $scope.job = {
    start_date: new Date(),
    end_date: new Date()
  };

  $scope.work = {
    availabilities: [],
    weekly_hours: 0,
    can_be_done_remotely: false
  };

  $scope.newRole = {
    name: '',
    prerequisites: '',
    vacancies: 0
  };

  if (!$scope.loggedUser || $scope.loggedUser.role !== constants.NONPROFIT) {
    $state.transitionTo('root.home');
    toastr.error('Precisa estar logado como ONG para fazer cadastro de um novo ato');
  }

  $scope.minDate = new Date();
  $scope.ismeridian = true;
  $scope.toggleMode = function() {
    $scope.ismeridian = ! $scope.ismeridian;
  };

  
  $scope.removeRole = function (role, type) {
    if (type === 'job') {
      $scope.job.roles.splice($scope.job.roles.indexOf(role), 1);
    } else if (type === 'work') {
      $scope.work.roles.splice($scope.work.roles.indexOf(role), 1);
    }
  };

  $scope.addRole = function (type) {
    if (!type) {
      return;
    }

    if (type === 'job') {
      $scope.job.roles.push($scope.newRole);
      $scope.newRole = {};
    } else if(type ==='work') {
      $scope.work.roles.push($scope.newRole);
    } else {
      toastr.error('Problema inesperado, me desculpe!');
    }
  };

  // Checking that slug does not have spaces and it is not already used.
  $scope.$watch('project.slug', function (value) {
    if (value) {
      if (value.indexOf(' ') >= 0) {
        $scope.newProjectForm.slug.$invalid = true;
        $scope.newProjectForm.slug.hasSpace = true;
      } else {
        $scope.newProjectForm.slug.$invalid = false;
        $scope.newProjectForm.slug.hasSpace = false;
        Auth.isProjectSlugUsed(value, function () {
          $scope.newProjectForm.slug.alreadyUsed = false;
          $scope.newProjectForm.slug.$invalid = false;
        }, function () {
          $scope.newProjectForm.slug.alreadyUsed = true;
          $scope.newProjectForm.slug.$invalid = true;
        });
      }
    } else {
      $scope.newProjectForm.slug.alreadyUsed = false;
      $scope.newProjectForm.slug.hasSpace = false;
      $scope.newProjectForm.slug.$invalid = false;
    }
  });

  var createJob = function () {

    if ($scope.project.skills) {
      $scope.project.skills = $filter('filter')($scope.skills, {checked: true});
      var index = 0;
      $scope.project.skills.forEach( function (skill) {
        $scope.project.skills[index++] = skill.url;
      });
    }

    var roles = Restangular.all('roles');
    roles.post($scope.job.roles).then(function (rolesReturned) {
      $scope.job.roles = [];
      rolesReturned.forEach( function (role) {
        $scope.job.roles.push(role.id);
      });
      $scope.project.job = $scope.job;
      var projects = Restangular.all('projects');
      projects.post($scope.project).then( function () {
        toastr.success('Ato criado!', $scope.project.name);
      }, function () {
        toastr.error('Problema em criar ato :(');
      });
    });
  };

  var createWork = function () {
    $scope.project.work = $scope.work;
  };

  $scope.createProject = function () {

    $scope.project.causes = $filter('filter')($scope.causes(), {checked: true});
    var index = 0;
    $scope.project.causes.forEach( function (cause) {
      $scope.project.causes[index++] = cause.url;
    });

    $scope.project.nonprofit = $scope.loggedUser.url;

    switch($scope.typeOfProject) {
      case 'job':
        createJob();
        break;
      case 'work':
        createWork();
        break;
    }
  };
});
