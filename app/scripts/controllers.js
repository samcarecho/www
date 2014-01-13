'use strict';

/* global toastr: false */
/* global google: false */
/* global constants: false */

// ----
// Global Constants
var NONPROFIT = 'NONPROFIT',
    VOLUNTEER = 'VOLUNTEER';

toastr.options.closeButton = true;
toastr.options.hideEasing = 'linear';

var app = angular.module('atadosApp');

app.controller('RootCtrl', function ($scope, $rootScope, $state, Auth) {
  $scope.getLoggedUser = Auth.getUser;

  $scope.$watch('getLoggedUser()', function (value) {
    $scope.loggedUser = value;
    if ($rootScope.modalInstance) {
      $rootScope.modalInstance.close();
    }
    if ($scope.loggedUser && $scope.loggedUser.role === NONPROFIT) {
      $scope.loggedUser.address = $scope.loggedUser.user.address;
      $scope.loggedUser.causes.forEach(function (c) {
        c.image = constants.storage + 'cause_' + c.id + '.png';
      });
      $scope.loggedUser.projects.forEach(function (p) {
        p.causes.forEach(function (c) {
          c.image = constants.storage + 'cause_' + c.id + '.png';
        });
      });
      $state.transitionTo('root.nonprofitadmin');
    }
  });

  $rootScope.$on('userLoggedIn', function(event, user) {
    if (user) {
      if ($rootScope.modalInstance) {
        $rootScope.modalInstance.close();
      }
      $scope.loggedUser = user;
      if ($scope.loggedUser.role === NONPROFIT) {
        $state.transitionTo('root.nonprofitadmin');
      } else if ($scope.loggedUser.role === VOLUNTEER) {}
      else {
        toastr.error('Usuário desconhecido acabou de logar.');
        // TODO(mpomarole): proper handle this case and disconect the user. Send email to administrador.
      }
      toastr.success('Oi! Bom te ver por aqui :)', $scope.loggedUser.slug);
      $state.transitionTo('root.explore');
    }
  });

  $scope.logout = function () {
    toastr.success('Tchau até a próxima :)', $scope.loggedUser.slug);
    Auth.logout();
    $scope.loggedUser = null;
  };
});

app.controller('AppCtrl', function($scope, $rootScope, $modal, $state, $location, $anchorScroll, Site, Auth, Search) {
  
  $scope.site = Site;
  $scope.search = Search;
  $rootScope.modalInstance = null;
  $scope.storage = constants.storage;
  $scope.causes = Site.causes;
  $scope.skills = Site.skills;
  $scope.cities = Site.cities;
  $scope.states = Site.states;
  $scope.numbers = Site.numbers;

  $scope.citySearch = function (city) {
    $scope.cities().forEach(function (c) {
      if (c.name === city) {
        $scope.search.city = c;
        $location.hash('top');
        $anchorScroll();
        return;
      }
    });
  };

  $scope.siteSearch = function () {
    $state.transitionTo('root.explore');
  };

  $scope.openVolunteerModal = function() {
    $rootScope.modalInstance = $modal.open({
      templateUrl: '/views/volunteerModal.html'
    });
  };
  $scope.openNonprofitModal = function () {
    $rootScope.modalInstance = $modal.open({
      templateUrl: '/views/nonprofitModal.html'
    });
  };
  $scope.openTermsModal = function() {
    $rootScope.modalInstance = $modal.open({
      templateUrl: '/views/termsModal.html',
      windowClass: 'width: 1000px;'
    });
  };

  $rootScope.closeNonprofitLoginModal = function () {
    $rootScope.modalInstance.close();
  };
  $scope.mapUrl = constants.storage + 'map.png';
});

app.controller('HomeCtrl', ['$scope', function($scope) {
  $scope.site.title = 'Atados - Juntando Gente Boa';
}]);

app.controller('LoginCtrl', ['$scope', '$rootScope', 'Auth', 'Facebook',
  function($scope, $rootScope, Auth) {

  $scope.showForgotPassword = false;
  $scope.remember = true;
  $scope.wrongCredentials = false;

  $scope.$watch('forgotEmail', function (value) {
    if (value) {
      Auth.isEmailUsed(value, function () {
        $scope.resetPasswordForm.forgotEmail.alreadyUsed = false;
        $scope.resetPasswordForm.forgotEmail.$invalid = true;
      }, function () {
        $scope.resetPasswordForm.forgotEmail.alreadyUsed = true;
        $scope.resetPasswordForm.forgotEmail.$invalid = false;
      });
    } else {
      $scope.resetPasswordForm.forgotEmail.$invalid = true;
    }
  });

  $scope.login = function() {
    if ( !($scope.password && $scope.email)) {
      return;
    }

    Auth.login({
      username: $scope.email,
      password: $scope.password,
      remember: $scope.remember
    }, function () {
      Auth.getCurrentUser(
        function (user) {
          $rootScope.$emit('userLoggedIn', user);
        }, function (error) {
          toastr.error(error);
        });
    }, function () {
      $scope.wrongCredentials = true;
    });
  };

  $scope.forgotPassword = function () {
    $scope.showForgotPassword = !$scope.showForgotPassword;
  };

  $scope.resetPassword = function () {
    Auth.resetPassword($scope.forgotEmail,  function () {
      toastr.info('Agora veja seu email para receber sua nova senha. Depois você pode mudar para uma senha da sua preferência.');
    }, function () {
      toastr.error('Sua senha não pode ser mandada. Por favor mande um email para o administrador marjori@atados.com.br');
    });
  };
}]);

app.controller('VolunteerModalCtrl', function($scope, $rootScope, Facebook, Auth) {
  $scope.loginActive = true;

  $scope.$watch('loginActive', function (value) {
    if (value) {
      $scope.facebookState = 'Entrar ';
    } else {
      $scope.facebookState = 'Criar conta ';
    }
  });

  $scope.$watch(function() {
    return Facebook.isReady();
  }, function() {
    $scope.facebookReady = true;
  });

  function sendFacebookCredentials(authResponse) {
    Auth.facebookAuth(authResponse,
      function (user) {
        $rootScope.$emit('userLoggedIn', user);
      }, function () {
        toastr.error('Houve um error no servidor tentando logar com sua conta no Facebook.');
      });
  }

  $scope.facebookAuth = function () {
    Facebook.getLoginStatus(function (response) {
      if (response.status !== 'connected') {
        Facebook.login(function(loginResponse) {
          if (loginResponse.status === 'connected') {
            sendFacebookCredentials(loginResponse.authResponse);
          } else if (response.status === 'not_authorized') {
            // Here now user needs to authorize the app to be used with Facebook
          }
        }, {scope: 'email'});
        // });
      } else {
        if (response.authResponse) {
          sendFacebookCredentials(response.authResponse);
        } else {
          toastr.error('Could not get facebook credentials');
        }
      }
    });
  };
});

app.controller('VolunteerSignupCtrl',
    ['$scope', '$rootScope', 'Auth', function($scope, $rootScope, Auth) {

  $scope.$watch('slug', function (value) {
    if (value) {
      if (value.indexOf(' ') >= 0) {
        $scope.signupForm.slug.$invalid = true;
        $scope.signupForm.slug.hasSpace = true;
      } else {
        $scope.signupForm.slug.hasSpace = false;
        $scope.signupForm.slug.$invalid = false;
        Auth.isSlugUsed(value, function () {
          $scope.signupForm.slug.alreadyUsed = false;
          $scope.signupForm.slug.$invalid = false;
        }, function () {
          $scope.signupForm.slug.alreadyUsed = true;
          $scope.signupForm.slug.$invalid = true;
        });
      }
    } else {
      $scope.signupForm.slug.alreadyUsed = false;
      $scope.signupForm.slug.hasSpace = false;
      $scope.signupForm.slug.$invalid = false;
    }
  });

  $scope.$watch('email', function (value) {
    if (value) {
      Auth.isEmailUsed(value, function () {
        $scope.signupForm.email.alreadyUsed = false;
        $scope.signupForm.email.$invalid = false;
      }, function () {
        $scope.signupForm.email.alreadyUsed = true;
        $scope.signupForm.email.$invalid = true;
      });
    }
  });

  $scope.$watch('password + passwordConfirm', function() {
    $scope.passwordDoesNotMatch = $scope.password !== $scope.passwordConfirm;
  });

  $scope.signup = function () {
    if ($scope.signupForm.$valid) {
      Auth.volunteerSignup({
          slug: $scope.slug,
          email: $scope.email,
          password: $scope.password
        },
        function () {
          Auth.login({
            username: $scope.email,
            password: $scope.password,
            remember: $scope.remember
          }, function () {
            Auth.getCurrentUser(
              function (user) {
                toastr.success('Oi!', user.slug);
                $rootScope.$emit('userLoggedIn', user);
              }, function (error) {
                toastr.error(error);
              });
          }, function () {
            $scope.error = 'Usuário ou senha estão errados :(';
          });
        },
        function (error) {
          toastr.error(error.detail);
        });
    }
  };
}]);

app.controller('NonprofitSignupCtrl', function($scope, $filter, $state, Auth, Photos, Restangular) {

  $scope.nonprofit = {
    address: {
      neighborhood:null,
      zipcode:null,
      addressline:null,
      addressnumber:null,
    },
    phone:null,
    description:null,
    name:null,
    slug:null,
    details:null,
    user:{
      first_name:null,
      slug:null,
      last_name:null,
      email:null,
      password:null
    },
    facebook_page:null,
    google_page:null,
    twitter_handle:null,
    website:null,
    causes:[]
  };

  // Checking that email is valid and not already used.
  $scope.$watch('nonprofit.user.email', function (value) {
    Auth.isEmailUsed(value, function () {
      $scope.signupForm.email.alreadyUsed = false;
      $scope.signupForm.email.$invalid = false;
    }, function () {
      $scope.signupForm.email.alreadyUsed = true;
      $scope.signupForm.email.$invalid = true;
    });
  });

  $scope.$watch('nonprofit.user.slug', function (value) {
    // Checking that slug not already used.
    if (value) {
      if (value.indexOf(' ') >= 0) {
        $scope.signupForm.slug.$invalid = true;
        $scope.signupForm.slug.hasSpace = true;
      } else {
        $scope.signupForm.slug.$invalid = false;
        $scope.signupForm.slug.hasSpace = false;
        Auth.isSlugUsed(value, function () {
          $scope.signupForm.slug.alreadyUsed = false;
          $scope.signupForm.slug.$invalid = false;
        }, function () {
          $scope.signupForm.slug.alreadyUsed = true;
          $scope.signupForm.slug.$invalid = true;
        });
      }
    } else {
      $scope.signupForm.slug.alreadyUsed = false;
      $scope.signupForm.slug.hasSpace = false;
      $scope.signupForm.slug.$invalid = false;
    }
  });

  $scope.cityLoaded = false;
  $scope.$watch('nonprofit.address.state', function (value) {
    $scope.cityLoaded = false;
    $scope.stateCities = [];
    if (value && !value.citiesLoaded) {
      Restangular.all('cities').getList({page_size: 3000, state: value.id}).then(function (response) {
        response.forEach(function(c) {
          $scope.stateCities.push(c);
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

  $scope.$watch('password + passwordConfirm', function() {
    $scope.signupForm.password.doesNotMatch = $scope.password !== $scope.passwordConfirm;
    $scope.signupForm.password.$invalid = $scope.signupForm.password.doesNotMatch;
  });

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

  $scope.uploadFile = function(files) {
    if (files) {
      var fd = new FormData();
      fd.append('file', files[0]);
      Photos.setVolunteerPhoto(fd, function(response) {
        $scope.image = response.file;
      }, function() {
        toastr.error('Error no servidor. Não consigo atualizar sua foto :(');
      });
    }
  };

  $scope.signup = function () {
    $scope.nonprofit.user.password = $scope.password;
    $scope.facebook_page = 'http://facebook.com/' + $scope.facebook_page;
    Auth.nonprofitSignup($scope.nonprofit, function () {
      toastr.success('Bem vinda ONG ao atados!');
      $state.transitionTo('root.nonprofitadmin');
    },
    function (error) {
      toastr.error(error);
    });
  };
});

app.controller('VolunteerEditCtrl', function($scope, $filter, Auth, Photos, $http, Restangular) {

  $scope.$watch('loggedUser', function (user) {
    if (user) {
      $scope.volunteer = user;
      $scope.volunteer.address = user.address ? user.address : {};
      if ($scope.volunteer.address.city) {
        $scope.volunteer.address.state = $scope.states()[$scope.volunteer.address.city.state.id - 1];
      }
    }
  });

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

    volunteerCopy.address.city = volunteerCopy.address.city.id;
    volunteerCopy.user.address = volunteerCopy.address;
    window.copy = volunteerCopy;

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
      $scope.volunteerForm.email.alreadyUsed = false;
    }
    else if (value !== $scope.loggedUser.user.email) {
      Auth.isEmailUsed(value, function () {
        $scope.volunteerForm.email.alreadyUsed = false;
        $scope.volunteerForm.email.$invalid = false;
      }, function () {
        $scope.volunteerForm.email.alreadyUsed = true;
        $scope.volunteerForm.email.$invalid = true;
      });
    }
  });

  $scope.uploadFile = function(files) {
    if (files) {
      var fd = new FormData();
      fd.append('file', files[0]);
      Photos.setVolunteerPhoto(fd, function(response) {
        $scope.image = response.file;
      }, function() {
        toastr.error('Error no servidor. Não consigo atualizer sua foto :(');
      });
    }
  };
  $scope.$watch('password + passwordConfirm', function() {
    $scope.volunteerForm.password.doesNotMatch = $scope.password !== $scope.passwordConfirm;
    $scope.volunteerForm.password.$invalid = $scope.volunteerForm.password.doesNotMatch;
  });
});

app.controller('VolunteerCtrl', function($scope, $state, $stateParams, Restangular) {

  if (!$stateParams.slug) {
    $state.transitionTo('root.home');
    toastr.error('Voluntário não encontrado');
  } else {

    $scope.site.title = 'Voluntário - ' + $stateParams.slug;

    var sanitizeProject = function (p) {
      p.causes.forEach(function (c) {
        c.image = constants.storage + 'cause_' + c.id + '.png';
        c.class = 'cause_' + c.id;
      });
      p.skills.forEach(function (s) {
        s.image = constants.storage + 'skill_' + s.id + '.png';
        s.class = 'skill_' + s.id;
      });
      p.nonprofit.image_url = 'http://atadosapp.s3.amazonaws.com/' + p.nonprofit.image;
      p.nonprofit.slug = p.nonprofit.user.slug;
    };
    var sanitizeNonprofit = function (n) {
      var causes = [];
      n.causes.forEach(function (c) {
        c = $scope.causes()[c];
        causes.push(c);
        c.image = constants.storage + 'cause_' + c.id + '.png';
        c.class = 'cause_' + c.id;
      });
      n.causes = causes;
      n.address = n.user.address;
    };

    var sanitizeVolunteer = function (v) {
      $scope.image = v.image_url;
      var causes = [];
      v.causes.forEach(function(c) {
        c = $scope.causes()[c];
        c.checked = true;
        causes.push(c);
      });
      v.causes = causes;
      var skills = [];
      v.skills.forEach(function(s) {
        s = $scope.skills()[s];
        skills.push(s);
      });
      v.skills = skills;
      v.projects.forEach(function(p) {
        sanitizeProject(p);
      });
      v.nonprofits.forEach(function(n) {
        sanitizeNonprofit(n);
      });
    };

    Restangular.one('volunteers', $stateParams.slug).get().then(function(response) {
      $scope.volunteer = response;
      sanitizeVolunteer($scope.volunteer);
    }, function() {
      $state.transitionTo('root.home');
      toastr.error('Voluntário não encontrado');
    });
  }

});

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
    return $scope.loggedUser && $scope.loggedUser.role === VOLUNTEER;
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
    if ($scope.getLoggedUser() && $scope.getLoggedUser().role === VOLUNTEER && $scope.nonprofit) {
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

app.controller('NonprofitAdminCtrl', function($scope, $state, $timeout, Restangular, Photos, $http) {

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
        v.apply.forEach(function (a) {
          if (a.project === p.slug) {
            v.status = a.status.name;
            setStatusStyle(v);
            return;
          }
        });
      });
    });
  }

  $scope.markers = [];
  $timeout(function () {
    if (!$scope.loggedUser || $scope.loggedUser.role === 'VOLUNTEER') {
      $state.transitionTo('root.home');
      toastr.error('Apenas ONGs tem acesso ao Painel de Controle');
    } else {
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
  }, 2000);

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
    var template = '/views/volunteerContractModal.html';
    if ($scope.alreadyApplied) {
      template = '/views/volunteerUnapplyModal.html';
    }

    var modalInstance = $modal.open({
      templateUrl: template,
      controller: function ($scope, $modalInstance) {
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

app.controller('ProjectNewCtrl', function($scope, $filter, $state, Auth, Restangular) {

  $scope.minDate = new Date();
  $scope.ismeridian = true;
  $scope.toggleMode = function() {
    $scope.ismeridian = ! $scope.ismeridian;
  };

  $scope.typeOfProject = 'job';
  $state.transitionTo('root.newproject.job');

  $scope.changeType = function (type) {
    $scope.typeOfProject = type;

  };
      
  $scope.project = {
    name: '',
    nonprofit: $scope.loggedUser,
    slug: '',
    responsible: '',
    causes: ''
  };

  $scope.job = {
    address: {},
    skills: [],
    roles: [],
    start_date: new Date(),
    end_date: new Date()
  };

  $scope.work = {
    address: {},
    availabilities: [],
    roles: [],
    skills: [],
    weekly_hours: 0,
    can_be_done_remotely: false
  };

  $scope.newRole = {
    name: '',
    prerequisites: '',
    vacancies: 0
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

app.controller('LandingCtrl', function ($scope) {
  $scope.site.title = 'Atados - Juntando Gente Boa';
  $scope.landing = true;
});

app.controller('AboutCtrl', function ($scope) {
  $scope.site.title = 'Atados - Sobre';
});

app.controller('ExplorerCtrl', function ($scope) {
  $scope.site.title = 'Atados - Explore';
  $scope.landing = false;
});

app.controller('SearchCtrl', function ($scope, Restangular, $http, $location, $anchorScroll, Search) {

  var saoPauloCenter = new google.maps.LatLng(-23.5505199, -46.6333094);
  var curitibaCenter = new google.maps.LatLng(-25.4808762, -49.3044253);
  var brasiliaCenter = new google.maps.LatLng(-15.79211, -47.897751);
  var defaultZoom = 11;
  $scope.search =  Search;

  $scope.$watch('search.city', function (city) {
    $scope.zoom = defaultZoom;
    if (city.name === 'Sao Paulo') {
      $scope.center = saoPauloCenter;
    } else if (city.name === 'Curitiba') {
      $scope.center = curitibaCenter;
    } else if (city.name === 'Brasilia') {
      $scope.center = brasiliaCenter;
    } else if (city.id === 0) {
      $scope.center = null;
      $scope.zoom  = 1;
    }
  });

  $scope.$watch('search.cause', function (value, old) {
    if (value !== old) {
      $scope.search.filter(Search.query, Search.cause.id, Search.skill.id, Search.city.id);
    }
  });
  $scope.$watch('search.skill', function (value, old) {
    if (value !== old) {
      $scope.search.filter(Search.query, Search.cause.id, Search.skill.id, Search.city.id);
    }
  });
  $scope.$watch('search.city', function (value, old) {
    if (value !== old) {
      $scope.search.filter(Search.query, Search.cause.id, Search.skill.id, Search.city.id);
    }
  });
  $scope.$watch('search.query', function (value, old) {
    if (value !== old) {
      $scope.search.filter(Search.query, Search.cause.id, Search.skill.id, Search.city.id);
    }
  });

  $scope.getMore = function () {
    if ($scope.landing) {
      var vars = {
        showProjects: $scope.search.showProjects,
        city: $scope.search.city,
        cause: $scope.search.cause,
        skill: $scope.search.skill
      };
      $scope.$emit('landingToExplorer', vars);
    }
    if ($scope.search.showProjects) {
      if ($scope.search.nextUrlProject()) {
        $http.get($scope.search.nextUrlProject()).success( function (response) {
          response.results.forEach(function (project) {
            if (project.image_url) {
              var aws_credential = project.image_url.split('?');
              project.nonprofit.image_url = 'http://atadosapp.s3.amazonaws.com/' + project.nonprofit.image + '?' + aws_credential;
            }
            project.causes.forEach(function (c) {
              c.image = constants.storage + 'cause_' + c.id + '.png';
              c.class = 'cause_' + c.id;
            });
            $scope.search.projects().push(project);
          });
          $scope.search.setNextUrlProject(response.next);
        }).error(function () {
          toastr.error('Erro ao buscar mais atos do servidor');
        });
      } else {
        toastr.error('Não conseguimos achar mais atos. Tente mudar os filtros.');
      }
    } else {
      if ($scope.search.nextUrlNonprofit()) {
        $http.get($scope.search.nextUrlNonprofit()).success( function (response) {
          response.results.forEach(function (nonprofit) {
            nonprofit.address = nonprofit.user.address;
            nonprofit.causes.forEach(function (c) {
              c.image = constants.storage + 'cause_' + c.id + '.png';
              c.class = 'cause_' + c.id;
            });
            $scope.search.nonprofits().push(nonprofit);
          });
          $scope.search.setNextUrlNonprofit(response.next);
        }).error(function () {
          toastr.error('Erro ao buscar mais ONGs do servidor');
        });
      } else {
        toastr.error('Não conseguimos achar mais ONGs. Tente mudar os filtros.');
      }
    }
  };

  //TODO If logged user, see what city he has set on his profile and change the default
  $scope.center = saoPauloCenter;
  $scope.zoom = defaultZoom;

  $scope.$watch('center', function (value, old) {
    // Hack to recenter the map back to the default city.
    if (value && value.nb === 46 && value.ob === -120) {
      if ($scope.search.showProjects) {
        $scope.markers = $scope.search.projects();
      } else {
        $scope.markers = $scope.search.nonprofits();
      }
      $scope.center = old;
      $scope.mapOptions.map.center = old;
      $scope.zoom = defaultZoom;
      $scope.mapOptions.map.zoom = defaultZoom;
    }
  });

  $scope.mapOptions = {
    map : {
      center : saoPauloCenter,
      zoom : defaultZoom,
      mapType : google.maps.MapTypeId.ROADMAP
    },
    marker : {
      clickable : true,
      draggable : false
    },
    selected: {
      icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/yellow-dot.png',
    },
    notselected: {
      icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png',
    },
  };

  $scope.markers = [];

  $scope.$watch('search.projects()', function () {
    if ($scope.search.showProjects) {
      $scope.markers = $scope.search.projects();
    }
  });

  $scope.$watch('search.nonprofits()', function () {
    if (!$scope.search.showProjects) {
      $scope.markers = $scope.search.nonprofits();
    }
  });

  $scope.$watch('search.showProjects', function () {
    if ($scope.search.showProjects) {
      $scope.markers = $scope.search.projects();
    } else {
      $scope.markers = $scope.search.nonprofits();
    }
  });

  $scope.getMarkerOpts = function (object) {
    return angular.extend(
      { title: object.name },
      object.selected ? $scope.mapOptions.selected :
                        $scope.mapOptions.notselected
    );
  };

  $scope.bringToFront = function (object, marker) {
    window.marker = marker;
  };

  $scope.previousObjects = [];
  $scope.selectMarker = function (object, marker) {

    if ($scope.previousObjects.length !== 0) {
      $scope.previousObjects.forEach(function (o) {
        o.selected = false;
        angular.element(document.querySelector('#card-' + o.slug))
          .removeClass('hover');
      });
      $scope.previousObjects = [];
    }
    
    if (object.address && object.address.latitude && object.address.longitude) {
      $scope.center  = new google.maps.LatLng(object.address.latitude, object.address.longitude);
    }

    window.marker = marker;
    if (marker) {
      $scope.markers.forEach(function(m) {
        if (m.address.latitude === object.address.latitude && m.address.longitude === object.address.longitude) {
          $scope.previousObjects.push(m);
          m.selected = true;
          var cardId = 'card-' + m.slug;
          angular.element(document.querySelector('#' + cardId))
            .addClass('hover');
        }
      });
    } else {
      $scope.previousObjects.push(object);
      object.selected = true;
      var cardId = 'card-' + object.slug;
      angular.element(document.querySelector('#' + cardId))
        .addClass('hover');
    }
    
    $scope.markerEvents = [{
      event: 'openinfowindow',
      ids: [object.slug]
    },{
      event: 'hover',
      ids: [object.slug]
    }];

    $scope.$broadcast('gmMarkersUpdate', 'markers');
  };
});
