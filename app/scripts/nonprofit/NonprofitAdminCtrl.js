'use strict';

/* global toastr: false */
/* global constants: false */

var app = angular.module('atadosApp');

app.controller('NonprofitAdminCtrl', function($scope, $http, $state, $stateParams, $timeout, Restangular, Photos, Cleanup) {

  $scope.editing = false;

  $scope.addCause = function(cause) {
    cause.checked = !cause.checked;
    if (cause.checked) {
      $scope.nonprofit.causes.push(cause);
    } else {
      var index = $scope.nonprofit.causes.indexOf(cause);
      if (index > -1) {
        $scope.nonprofit.causes.splice(index, 1);
      }
    }
  };

  $scope.uploadProfileFile = function(files) {
    if (files) {
      var fd = new FormData();
      fd.append('file', files[0]);
      Photos.setNonprofitProfilePhoto(fd, function(response) {
        $scope.nonprofit.image_url = response.file;
        toastr.success('Logo da ONG salva com sucesso.');
      }, function() {
        toastr.error('Error no servidor. Não consigo atualizar sua foto :(');
      });
    }
  };
  $scope.uploadCoverFile = function(files) {
    if (files) {
      var fd = new FormData();
      fd.append('file', files[0]);
      Photos.setNonprofitCoverPhoto(fd, function(response) {
        $scope.nonprofit.cover_url = response.file;
        toastr.success('Foto cover da ONG salva com sucesso.');
      }, function() {
        toastr.error('Error no servidor. Não consigo atualizar sua foto :(');
      });
    }
  };

  function setStatusStyle(volunteer) {
    if (volunteer.status === 'Voluntário') {
      volunteer.statusStyle = {color: 'green'};
    } else if (volunteer.status === 'Desistente') {
      volunteer.statusStyle = {color: 'red'};
    } else if (volunteer.status === 'Candidato') {
      volunteer.statusStyle = {color: '#0081B2'};
    } else if (volunteer.status === 'Ex-Voluntário') {
      volunteer.statusStyle = {color: 'black'};
    }
  }

  function setProjectStatusStyle(project) {
    if (!project.published) {
      project.statusStyle = {'background-color': '#f2ae43'}; // label-warning color
    } else if (project.closed) {
      project.statusStyle = {'background-color': '#db524b'}; // label-danger color
    } else if (!project.closed) {
      project.statusStyle = {'background-color': '#58b957'}; // label-success color
    }
  }

  $scope.$watch('loggedUser', function (user) {
    if (!user || (user && user.role === constants.VOLUNTEER && !user.user.is_staff)) {
      // $state.transitionTo('root.home');
      // toastr.error('Apenas ONGs tem acesso ao Painel de Controle');
      return;
    } else if (user.role === constants.VOLUNTEER && user.user.is_staff) {
      $http.get(constants.api + 'nonprofit/'+ $stateParams.slug + '/')
        .success(function(response) {
          $scope.nonprofit = response;
          Cleanup.currentUser($scope.nonprofit);
          Cleanup.nonprofitForAdmin($scope.nonprofit);
          $scope.activeProject = $scope.nonprofit.projects[0];
        }).error(function() {
          $state.transitionto('root.home');
          toastr.error('ONG não encontrada.');
        });

    } else if (user.role === constants.NONPROFIT) {
      $scope.nonprofit = $scope.loggedUser;
      Cleanup.nonprofitForAdmin($scope.nonprofit);
      $scope.activeProject = $scope.nonprofit.projects[0];
    }
  });

  $scope.changeActiveProject = function (newProject) {
    $scope.activeProject = newProject;
  };

  $scope.changeVolunteerStatus = function (volunteer, newStatus) {
    volunteer.status = newStatus;
    setStatusStyle(volunteer);
    $http.post(constants.api + 'change_volunteer_status/', {volunteer: volunteer.email, project: $scope.activeProject.slug, volunteerStatus: volunteer.status});
  };

  $scope.editProject = function (project) {
    $state.transitionTo('root.editproject', {slug: project.slug});
  };

  $scope.cloneProject = function (project) {
    $http.post(constants.api + 'project/' + project.slug + '/clone/').success(function (response) {
      Cleanup.adminProject(project, $scope.nonprofit);
      $scope.nonprofit.projects.push(response);
    });
  };

  $scope.closeOrOpenProject = function (project) {
    project.closed = ! project.closed;
    setProjectStatusStyle(project);
    Restangular.one('project', project.slug).get().then(function (response) {
      response.closed = project.closed;
      delete response.nonprofit.image;
      delete response.nonprofit.cover;
      delete response.work;
      delete response.job;
      delete response.causes;
      delete response.skills;
      delete response.volunteers;
      response.put();
    });
  };

  $scope.exportList = function (project) {
    $http.get(constants.api + 'project/' + project.slug + '/export/').success(function (response) {
      var dataUrl = 'data:text/csv;utf-9,' + encodeURI(response.volunteers);
      var link = document.createElement('a');
      angular.element(link)
        .attr('href', dataUrl)
        .attr('download', 'Voluntários ' + project.name); // Pretty much only works in chrome
      link.click();
    });
  };

  $scope.doneEditingNonprofit = function(nonprofit) {

    if ($scope.editing) {
      var nonprofitCopy = {};
      angular.copy(nonprofit, nonprofitCopy);

      if (nonprofitCopy.website.substring(0,4) !== 'http') {
        nonprofitCopy.website = 'http://'  + nonprofitCopy.website;
      }
      if (nonprofitCopy.facebook_page_short) {
        nonprofitCopy.facebook_page = 'http://www.facebook.com/' + nonprofitCopy.facebook_page_short;
      } else {
        nonprofitCopy.facebook_page = null;
      }
      if (nonprofitCopy.google_page_short) {
        nonprofitCopy.google_page = 'http://plus.google.com/' + nonprofitCopy.google_page_short;
      } else {
        nonprofitCopy.google_page = null;
      }
      if (nonprofitCopy.twitter_handle_short) {
        nonprofitCopy.twitter_handle = 'http://twitter.com/' + nonprofitCopy.twitter_handle_short;
      } else {
        nonprofitCopy.twitter_handle = null;
      }

      nonprofitCopy.user.address.city = nonprofitCopy.address.city.id;
      var causes = [];
      nonprofitCopy.causes.forEach(function(nc) {
        causes.push(nc.id);
      });
      nonprofitCopy.causes = causes;

      delete nonprofitCopy.address;
      delete nonprofitCopy.projects;
      delete nonprofitCopy.image_url;
      delete nonprofitCopy.cover_url;
      delete nonprofitCopy.volunteers;
      delete nonprofitCopy.user.address.city_state;
      delete nonprofitCopy.user.address.state;
      
      $http.put(constants.api + 'nonprofit/' + nonprofit.slug + '/.json', nonprofitCopy)
        .success(function() {
          $scope.editing = false;
          toastr.success('Perfil da ONG salva!');
        }).error(function() {
          $scope.editing = false;
          toastr.error('Problema ao salvar o perfil da ONG, por favor tente de novo');
        });
    }
  };

  $scope.volunteerStatusOptions = [
    'Voluntário',
    'Candidato',
    'Desistente',
    'Ex-Voluntário'
  ];
});
