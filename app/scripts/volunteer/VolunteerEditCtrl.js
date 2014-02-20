'use strict';

/* global toastr: false */
/* global constants: false */

var app = angular.module('atadosApp');

app.controller('VolunteerEditCtrl', function($scope, $filter, Auth, Photos, $http, Restangular, $state) {

  $scope.$watch('loggedUser', function (user) {
    if (!user) {
      toastr.error('Voluntário não logado para editar.');
      $state.transitionTo('root.home');
    }
  });

  if ($scope.loggedUser && $scope.loggedUser.role === constants.VOLUNTEER) {
    $scope.volunteer = $scope.loggedUser;
    window.volunteer = $scope.volunteer;
  } else {
    $state.transitionTo('root.home');
    toastr.error('Voluntário não logado para editar.');
  }

  $scope.addCause = function(cause) {
    cause.checked = !cause.checked;
    if (cause.checked) {
      $scope.volunteer.causes.push(cause);
    } else {
      var index = $scope.volunteer.causes.indexOf(cause);
      if (index > -1) {
        $scope.volunteer.causes.splice(index, 1);
      }
    }
  };

  $scope.addSkill = function(skill) {
    skill.checked = !skill.checked;
    if (skill.checked) {
      $scope.volunteer.skills.push(skill);
    } else {
      var index = $scope.volunteer.skills.indexOf(skill);
      if (index > -1) {
        $scope.volunteer.skills.splice(index, 1);
      }
    }
  };

  $scope.cityLoaded = false;
  $scope.$watch('volunteer.address.state', function (value) {
    $scope.cityLoaded = false;
    $scope.stateCities = [];
    if (value && !value.citiesLoaded) {
      Restangular.all('cities').getList({page_size: 3000, state: value.id}).then(function (response) {
        response.forEach(function(c) {
          $scope.stateCities.push(c);
          if ($scope.volunteer.address.city && (c.id === $scope.volunteer.address.city.id)) {
            $scope.volunteer.address.city = c;
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
        if (c.state.id === $scope.volunteer.address.state.id) {
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
      Photos.setVolunteerPhoto(fd, function(response) {
        $scope.volunteer.image_url = response.file;
        toastr.success('Foto do voluntário salva com sucesso.');
      }, function() {
        toastr.error('Error no servidor. Não consigo atualizar sua foto :(');
      });
    }
  };

  $scope.saveVolunteer = function () {
    var volunteerCopy = {};
    angular.copy($scope.volunteer, volunteerCopy);
    delete volunteerCopy.projects;
    delete volunteerCopy.nonprofits;
    var causes = [];
    volunteerCopy.causes.forEach(function(nc) {
      causes.push(nc.id);
    });
    volunteerCopy.causes = causes;
    var skills = [];
    volunteerCopy.skills.forEach(function(s) {
      skills.push(s.id);
    });
    volunteerCopy.skills = skills;


    if (volunteerCopy.address && volunteerCopy.address.city) {
      volunteerCopy.address.city = volunteerCopy.address.city.id;
      delete volunteerCopy.address.state;
    }
    volunteerCopy.user.address = volunteerCopy.address;

    if ($scope.volunteer.birthDate) {
      if (typeof $scope.volunteer.birthDate.getFullYear !== 'undefined') {
        volunteerCopy.birthDate = $scope.volunteer.birthDate.getFullYear() + '-' + ($scope.volunteer.birthDate.getMonth() + 1) + '-' + $scope.volunteer.birthDate.getDate();
      }
    }

    $http.put(constants.api + 'volunteers/' + volunteerCopy.slug + '/.json', volunteerCopy)
      .success(function() {
      toastr.success('Perfil salvo!', $scope.volunteer.slug);
    }).error(function () {
      toastr.error('Problema em salvar seu perfil :(');
    });
    if ($scope.password && $scope.password === $scope.passwordConfirm) {
      Auth.changePassword({email: $scope.volunteer.user.email, password: $scope.password}, function () {
        toastr.success('Senha nova salva', $scope.volunteer.slug);
      }, function () {
        toastr.error('Não conseguimos atualizar sua senha :(');
      });
    }
  };

  $scope.$watch('causes + volunteer.causes', function () {
    if ($scope.causes() && $scope.volunteer) {
      $scope.volunteer.causes.forEach(function (volunteerCause) {
        for (var index = 0; index < $scope.causes().length; ++index) {
          var cause = $scope.causes()[index];
          if (cause.url === volunteerCause) {
            cause.checked = true;
            break;
          }
        }
      });
    }
  });

  $scope.$watch('skills + volunteer.skills', function () {
    if ($scope.skills && $scope.volunteer && $scope.volunteer.skills) {
      $scope.volunteer.skills.forEach(function (volunteerSkill) {
        for (var index = 0; index < $scope.skills.length; ++index) {
          var skill = $scope.skills[index];
          if (skill.url === volunteerSkill) {
            skill.checked = true;
            break;
          }
        }
      });
    }
  });

  $scope.$watch('volunteer.user.email', function (value) {
    if (!$scope.loggedUser) {
      return;
    }

    if (value && value !== $scope.loggedUser.user.email) {
      $scope.volunteerEditForm.email.alreadyUsed = false;
    }
    else if (value !== $scope.loggedUser.user.email) {
      Auth.isEmailUsed(value, function () {
        $scope.volunteerEditForm.email.alreadyUsed = false;
        $scope.volunteerEditForm.email.$invalid = false;
      }, function () {
        $scope.volunteerEditForm.email.alreadyUsed = true;
        $scope.volunteerEditForm.email.$invalid = true;
      });
    }
  });

  $scope.getFacebookPhoto = function () {
    if ($scope.volunteer.facebook_uid) {
      Photos.getFacebookPhoto(function (response) {
        toastr.success('Foto do facebook salva com sucesso');
        $scope.volunteer.image_url = response;
      }, function (error) {
        console.error(error);
        toastr.error('Error no servidor. Não consigo pegar foto do Facebook.');
      });
    }
  };

  $scope.$watch('password + passwordConfirm', function() {
    $scope.volunteerEditForm.password.doesNotMatch = $scope.password !== $scope.passwordConfirm;
    $scope.volunteerEditForm.password.$invalid = $scope.volunteerEditForm.password.doesNotMatch;
  });
});
