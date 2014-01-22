'use strict';

/* global toastr: false */
/* global google: false */
/* global constants: false */

var app = angular.module('atadosApp');

app.controller('NonprofitAdminCtrl', function($scope, $state, $stateParams, $timeout, Restangular, Photos, $http) {

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

  $scope.cityLoaded = false;
  $scope.$watch('nonprofit.address.state', function (value) {
    $scope.cityLoaded = false;
    $scope.stateCities = [];
    if (value && !value.citiesLoaded) {
      Restangular.all('cities').getList({page_size: 3000, state: value.id}).then(function (response) {
        response.forEach(function(c) {
          $scope.stateCities.push(c);
          if (c.id === $scope.nonprofit.address.city.id) {
            $scope.nonprofit.address.city = c;
          }
          if (!c.active) {
            $scope.cities().push(c);
          }
        });
        value.citiesLoaded = true;
        $scope.cityLoaded = true;
      });
    } else if(value){
      var cities = $scope.cities();
      cities.forEach(function (c) {
        if (c.state.id === $scope.nonprofit.address.state.id) {
          $scope.stateCities.push(c);
        }
      });
      $scope.cityLoaded = true;
    }
  });

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

  function sanitize(p) {
    p.emailAllString = 'mailto:' + $scope.nonprofit.user.email + '?bcc=';
    setProjectStatusStyle(p);
    Restangular.one('project', p.slug).getList('volunteers', {page_size: 1000}).then(function (response) {
      p.volunteers = response;
      p.volunteers.forEach(function (v) {
        p.emailAllString += v.email + ',';
        Restangular.all('applies').getList({project_slug: p.slug, volunteer_slug: v.slug}).then(function (a) {
          v.status = a[0].status.name;
          setStatusStyle(v);
          return;
        });
      });
    });
  }

  $scope.markers = [];
  $scope.$watch('loggedUser', function (user) {
    if (!user || user.role === 'VOLUNTEER') {
      $state.transitionTo('root.home');
      toastr.error('Apenas ONGs tem acesso ao Painel de Controle');
      return;
    } else {
      console.log(user.slug + ' logged');
      $scope.nonprofit = $scope.loggedUser;
      $scope.nonprofit.address.state = $scope.states()[$scope.nonprofit.address.city.state.id - 1];

      if ($scope.nonprofit.facebook_page) {
        var parser = document.createElement('a');
        parser.href = $scope.nonprofit.facebook_page;
        $scope.nonprofit.facebook_page_short = parser.pathname;
        $scope.nonprofit.facebook_page_short = $scope.nonprofit.facebook_page_short.replace(/\//, '');
      }
      if ($scope.nonprofit.google_page) {
        var parser2 = document.createElement('a');
        parser2.href = $scope.nonprofit.google_page;
        $scope.nonprofit.google_page_short = parser2.pathname;
        $scope.nonprofit.google_page_short = $scope.nonprofit.google_page_short.replace(/\//, '');
      }
      if ($scope.nonprofit.twitter_handle) {
        var parser3 = document.createElement('a');
        parser3.href = $scope.nonprofit.google_page;
        $scope.nonprofit.twitter_handle_short = parser3.pathname;
        $scope.nonprofit.twitter_handle_short = $scope.nonprofit.twitter_handle_short.replace(/\//, '');
      }

      $scope.nonprofit.projects.forEach(sanitize);
      $scope.activeProject = $scope.nonprofit.projects[0];
      if ($scope.nonprofit.user.address) {
        $scope.nonprofit.address = $scope.nonprofit.user.address;
        $scope.markers.push($scope.nonprofit.address);
        $scope.center = new google.maps.LatLng($scope.nonprofit.address.latitude, $scope.nonprofit.address.longitude);
        $scope.zoom = 15;
      }

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
    $state.transitionTo('root.project', {slug: project.slug});
  };

  $scope.cloneProject = function (project) {
    $http.post(constants.api + 'project/' + project.slug + '/clone/').success(function (response) {
      sanitize(project);
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
      if (nonprofit.facebook_page_short) {
        nonprofit.facebook_page = 'http://www.facebook.com/' + nonprofit.facebook_page_short;
      } else {
        nonprofit.facebook_page = null;
      }
      if (nonprofit.google_page_short) {
        nonprofit.google_page = 'http://plus.google.com/' + nonprofit.google_page_short;
      } else {
        nonprofit.google_page = null;
      }
      if (nonprofit.twitter_handle_short) {
        nonprofit.twitter_handle = 'http://twitter.com/' + nonprofit.twitter_handle_short;
      } else {
        nonprofit.twitter_handle = null;
      }
      var nonprofitCopy = {};
      angular.copy(nonprofit, nonprofitCopy);
      delete nonprofitCopy.projects;
      delete nonprofitCopy.image_url;
      delete nonprofitCopy.cover_url;
      delete nonprofitCopy.address.state;
      var causes = [];
      nonprofitCopy.causes.forEach(function(nc) {
        causes.push(nc.id);
      });
      nonprofitCopy.causes = causes;
      nonprofitCopy.user.address.city = nonprofitCopy.address.city.id;
      $http.put(constants.api + 'nonprofit/' + nonprofit.slug + '/.json', nonprofitCopy)
        .success(function() {
          toastr.success('Perfil da ONG salva!');
          $scope.editing = false;
        }).error(function() {
          $scope.editing = false;
          toastr.error('Problema ao salvar o perfil da ONG, por favor tente de novo');
        });
    }
  };

  $scope.volunteerStatusOptions = [
    'Voluntário',
    'Candidato',
    'Desistente'
  ];
});


