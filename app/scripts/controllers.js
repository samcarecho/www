'use strict';

/* global toastr: false */
/* global google: false */

// ----
// Global Constants
var NONPROFIT = 'NONPROFIT';

// Toastr configurations. TODO(mpomarole): move this to its own service
toastr.options.closeButton = true;
toastr.options.hideEasing = 'linear';

var app = angular.module('atadosApp');

app.controller('AppController', ['$scope', '$rootScope', '$translate', '$modal', '$state', 'Site', 'Auth',
  function($scope, $rootScope, $translate, $modal, $state, Site, Auth) {

  $scope.changeLanguage = function (langKey) {
    $translate.uses(langKey);
  };

  $scope.site = Site;

  Auth.getCurrentUser(function (user) {
    $scope.loggedUser = user;
  }, function (error) {
    console.error(error);
  });

  var modalInstance = null;

  $rootScope.$on('userLoggedIn', function(event, user) {
    if (user) {
      $scope.loggedUser = user;
      if ($scope.loggedUser.role === NONPROFIT) {
        $state.transitionTo('root.nonprofitadmin');
      }
      modalInstance.close();
    }
  });

  $scope.openVolunteerPortalModal = function() {
    modalInstance = $modal.open({
      templateUrl: '/views/volunteerPortalModal.html'
    });
  };
  
  $scope.openNonprofitPortalModal = function () {
    modalInstance = $modal.open({
      templateUrl: '/views/nonprofitPortalModal.html'
    });
  };

  $scope.closeNonprofitPortalModal = function () {
    modalInstance.close();
  };

  $scope.logout = function () {
    toastr.info('Tchau!', $scope.loggedUser.username);
    Auth.logout();
    $scope.loggedUser = null;
  };
}]);

app.controller('LoginController', ['$scope', '$rootScope', 'Auth', 'Facebook', '$log',
  function($scope, $rootScope, Auth, Facebook, $log) {

  $scope.showForgotPassword = false;
  $scope.username = '';
  $scope.password = '';
  $scope.remember = true;

  $scope.resetEmail = '';
  $scope.invalidEmail = true;

  $scope.$watch('resetEmail', function (value) {
    Auth.isEmailUsed(value, function (response) {
        $log.debug(response);
        $scope.emailError = 'Email não existe.';
        $scope.invalidEmail = true;
      }, function (error) {
        $log.debug(error);
        $scope.emailError = null;
        $scope.invalidEmail = false;
      });
  });

  $scope.login = function() {
    if ( !($scope.password && $scope.username)) {
      return;
    }

    Auth.login({
      username: $scope.username,
      password: $scope.password,
      remember: $scope.remember
    }, function (response) {
      $log.debug(response);
      Auth.getCurrentUser(
        function (user) {
          toastr.success('Oi!', user.username);
          $rootScope.$emit('userLoggedIn', user);
        }, function (error) {
          toastr.error(error);
        });
    }, function (error) {
      $log.debug(error);
      $scope.error = 'Usuário ou senha estão errados :(';
    });
  };

  $scope.forgotPassword = function () {
    $scope.showForgotPassword = !$scope.showForgotPassword;
  };

  $scope.resetPassword = function () {
    Auth.resetPassword($scope.resetEmail,  function (response) {
      $log.debug(response);
      toastr.info('Agora veja seu email para receber sua nova senha. Depois você pode mudar para uma senha da sua preferência.');
    }, function (error) {
      $log.error(error);
      toastr.error('Sua senha não pode ser mandada. Por favor mande um email para o administrador marjori@atados.com.br');
    });
  };

  $scope.$watch(function() {
    return Facebook.isReady();
  }, function() {
    $scope.facebookReady = true;
  });

  function sendFacebookCredentials(authResponse) {
    Auth.facebookLogin(authResponse,
      function (user) {
        $rootScope.$emit('userLoggedIn', user);
      }, function (error) {
        toastr.error(error);
      });
  }

  $scope.facebookLogin = function () {
    Facebook.getLoginStatus(function (response) {
      if (response.status !== 'connected') {
        Facebook.login(function(loginResponse) {
          if (loginResponse.status === 'connected') {
            sendFacebookCredentials(loginResponse.authResponse);
          } else if (response.status === 'not_authorized') {
            // Here now use needs to authorize the app to be used with Facebook
          }
        });
      } else {
        if (response.authResponse) {
          sendFacebookCredentials(response.authResponse);
        } else {
          toastr.error('Could not get facebook credentials');
        }
      }
    });
  };
}]);

app.controller('VolunteerSignupController', ['$scope', '$rootScope', 'Auth', '$log', function($scope, $rootScope, Auth, $log) {
  function checkInvalid() {
    $scope.invalidForm =  $scope.signupForm.$invalid ||
      $scope.usernameError || $scope.emailError || $scope.passwordDoesNotMatch;
  }

  $scope.$watch('username + password + passwordConfirm + email', function() {
    checkInvalid();
  });

  $scope.$watch('username', function (value) {
    if (value) {
      Auth.isUsernameUsed(value, function (response) {
        $log.debug(response);
        $scope.usernameError = null;
        checkInvalid();
      }, function (error) {
        $log.error(error);
        $scope.usernameError = 'Usuário já existe.';
      });
    }
  });
  $scope.$watch('email', function (value) {
    if (value) {
      Auth.isEmailUsed(value, function (response) {
        $log.debug(response);
        $scope.emailError = null;
        checkInvalid();
      }, function (error) {
        $log.error(error);
        $scope.emailError = 'Email já existe.';
      });
    }
  });

  $scope.$watch('password + passwordConfirm', function() {
    $scope.passwordDoesNotMatch = $scope.password !== $scope.passwordConfirm;
    checkInvalid();
  });

  $scope.signup = function () {
    if ($scope.signupForm.$valid) {
      Auth.volunteerSignup({
          username: $scope.username,
          email: $scope.email,
          password: $scope.password
        },
        function (response) {
          $log.debug(response);
          Auth.login({
            username: $scope.username,
            password: $scope.password,
            remember: $scope.remember
          }, function (response) {
            $log.debug(response);
            Auth.getCurrentUser(
              function (user) {
                toastr.success('Oi!', user.username);
                $rootScope.$emit('userLoggedIn', user);
              }, function (error) {
                toastr.error(error);
              });
          }, function (error) {
            $log.error(error);
            $scope.error = 'Usuário ou senha estão errados :(';
          });
        },
        function (error) {
          toastr.error(error.detail);
        });
    }
  };

  $scope.facebookSignup = function (provider) {
    toastr.info('Trying signup through ' + provider);
  };
}]);

app.controller('NonprofitSignupController',
    ['$scope', '$filter', '$state', 'Auth', 'Restangular', '$log', function($scope, $filter, $state, Auth, Restangular, $log) {

  $scope.nonprofit = {};

  Restangular.all('causes').getList().then( function(response) {
    $scope.causes = response;
  }, function (error) {
    $log.error(error);
    toastr.error('Não consegui pegar as causas do servidor.');
  });
  Restangular.all('suburbs').getList().then( function(response) {
    $scope.suburbs = response;
  }, function (error) {
    $log.error(error);
    toastr.error('Não consegui pegar as Zonas do servidor.');
  });
  Restangular.all('cities').getList().then( function(response) {
    $scope.cities = response;
  }, function (error) {
    $log.error(error);
    toastr.error('Não consegui pegar as cidades do servidor.');
  });
  Restangular.all('states').getList().then( function(response) {
    $scope.states = response;
  }, function (error) {
    $log.error(error);
    toastr.error('Não consegui pegar os estados do servidor.');
  });

  // Checking that slug does not have spaces and it is not already used.
  $scope.$watch('nonprofit.slug', function (value) {
    if (value) {
      if (value.indexOf(' ') >= 0) {
        $scope.signupForm.slug.$invalid = true;
        $scope.signupForm.slug.hasSpace = true;
      } else {
        $scope.signupForm.slug.$invalid = false;
        $scope.signupForm.slug.hasSpace = false;
        Auth.isSlugUsed(value, function (response) {
          $log.debug(response);
          $scope.signupForm.slug.alreadyUsed = false;
          $scope.signupForm.slug.$invalid = false;
        }, function (error) {
          $log.error(error);
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

  // Checking that email is valid and not already used.
  $scope.$watch('nonprofit.user.email', function (value) {
    Auth.isEmailUsed(value, function (usedMessage) {
      $log.debug(usedMessage);
      $scope.signupForm.email.alreadyUsed = false;
      $scope.signupForm.email.$invalid = false;
    }, function (notUsed) {
      $log.debug(notUsed);
      $scope.signupForm.email.alreadyUsed = true;
      $scope.signupForm.email.$invalid = true;
    });
  });

  // Checking that username not already used.
  $scope.$watch('nonprofit.user.username', function (value) {
    if (value) {
      if (value.indexOf(' ') >= 0) {
        $scope.signupForm.username.$invalid = true;
        $scope.signupForm.username.hasSpace = true;
      } else {
        $scope.signupForm.username.hasSpace = false;
        $scope.signupForm.username.$invalid = false;
        Auth.isUsernameUsed(value, function (usedMessage) {
          $log.debug(usedMessage);
          $scope.signupForm.username.alreadyUsed = false;
          $scope.signupForm.username.$invalid = false;
        }, function (notUsed) {
          $log.debug(notUsed);
          $scope.signupForm.username.alreadyUsed = true;
          $scope.signupForm.username.$invalid = true;
        });
      }
    } else {
      $scope.signupForm.username.alreadyUsed = false;
      $scope.signupForm.username.hasSpace = false;
      $scope.signupForm.username.$invalid = false;
    }
  });

  $scope.$watch('password + passwordConfirm', function() {
    $scope.signupForm.password.doesNotMatch = $scope.password !== $scope.passwordConfirm;
    $scope.signupForm.password.$invalid = $scope.signupForm.password.doesNotMatch;
  });

  $scope.signup = function () {
    if ($scope.signupForm.$valid) {
      $scope.nonprofit.user.password = $scope.password;
      $scope.nonprofit.causes = $filter('filter')($scope.causes, {checked: true});
      Auth.nonprofitSignup($scope.nonprofit, function (response) {
          $log.debug(response);
          toastr.success('Bem vinda ONG ao atados!');
          $state.transitionTo('root.nonprofitadmin');
        },
        function (error) {
          toastr.error(error);
        });
    }
  };
}]);

app.controller('VolunteerController',
    ['$scope', '$filter', '$state', '$stateParams', '$http', 'Auth', 'Photos', 'Restangular', '$log',
    function($scope, $filter, $state, $stateParams, $http,  Auth, Photos, Restangular, $log) {

  $scope.site.title = 'Voluntário - ' + $stateParams.username;

  Restangular.all('causes').getList().then( function(causes) {
    $scope.causes = causes;
  }, function (error) {
    $log.error(error);
    toastr.error('Não consegui pegar as causas do servidor.');
  });
  Restangular.all('skills').getList().then( function(skills) {
    $scope.skills = skills;
  }, function (error) {
    $log.error(error);
    toastr.error('Não consegui pegar as causas do servidor.');
  });
  Restangular.one('volunteers', $stateParams.username).get().then(function(response) {
    $scope.volunteer = response;
    $scope.volunteer.id = $scope.volunteer.username;
    $scope.image = $scope.volunteer.image_url;
  }, function(response) {
    $log.info(response);
    $state.transitionTo('root.home');
    toastr.error('Voluntário não encontrado');
  });

  $scope.saveVolunteer = function () {
    $scope.volunteer.causes = $filter('filter')($scope.causes, {checked: true});
    var index = 0;
    $scope.volunteer.causes.forEach( function (cause) {
      $scope.volunteer.causes[index++] = cause.url;
    });
    $scope.volunteer.skills = $filter('filter')($scope.skills, {checked: true});
    index = 0;
    $scope.volunteer.skills.forEach( function (skill) {
      $scope.volunteer.skills[index++] = skill.url;
    });

    $scope.volunteer.put().then( function (response) {
      $log.info(response);
      toastr.success('Perfil salvo!', $scope.volunteer.username);
    }, function (error) {
      $log.error(error);
      toastr.error('Problema em salvar seu perfil :(');
    });
    if ($scope.password && $scope.password === $scope.passwordConfirm) {
      Auth.changePassword({email: $scope.volunteer.user.email, password: $scope.password}, function (response) {
        $log.info(response);
        toastr.success('Senha nova salva', $scope.volunteer.username);
      }, function (error) {
        $log.error(error);
        toastr.error('Não conseguimos atualizar sua senha :(');
      });
    }
  };

  $scope.$watch('causes + volunteer.causes', function () {
    if ($scope.causes && $scope.volunteer) {
      $scope.volunteer.causes.forEach(function (volunteerCause) {
        for (var index = 0; index < $scope.causes.length; ++index) {
          var cause = $scope.causes[index];
          if (cause.url === volunteerCause) {
            cause.checked = true;
            break;
          }
        }
      });
    }
  });

  $scope.$watch('skills + volunteer.skills', function () {
    if ($scope.skills && $scope.volunteer) {
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
      $scope.profileForm.email.alreadyUsed = false;
    }
    else if (value !== $scope.loggedUser.user.email) {
      Auth.isEmailUsed(value, function (response) {
        $log.info(response);
        $scope.profileForm.email.alreadyUsed = false;
        $scope.profileForm.email.$invalid = false;
      }, function (error) {
        $log.error(error);
        $scope.profileForm.email.alreadyUsed = true;
        $scope.profileForm.email.$invalid = true;
      });
    }
  });

  $scope.$watch('password + passwordConfirm', function() {
    $scope.profileForm.password.doesNotMatch = $scope.password !== $scope.passwordConfirm;
    $scope.profileForm.password.$invalid = $scope.profileForm.password.doesNotMatch;
  });

  $scope.uploadFile = function(files) {
    if (files) {
      var fd = new FormData();
      fd.append('file', files[0]);
      Photos.setVolunteerPhoto(fd, function(response) {
        $scope.image = response.file;
      }, function(error) {
        $log.error(error);
        toastr.error('Error no servidor. Não consigo atualizer sua foto :(');
      });
    }
  };
}]);

app.controller('NonprofitController',
    ['$scope', '$state', '$stateParams', '$http', 'Auth', 'Restangular', '$log', function($scope, $state, $stateParams, $http,  Auth, Restangular, $log) {

  angular.extend($scope, {
    center: {
      latitude: -23.553287,
      longitude: -46.638535,
    },
    markers: [],
    zoom: 14,
  });

  function getLatLong(address){
    var geo = new google.maps.Geocoder();
    geo.geocode({'address': address.addressline, 'region': 'br'},
    function(results, status){
      if (status === google.maps.GeocoderStatus.OK) {
        var location = {
          latitude: results[0].geometry.location.lat(),
          longitude: results[0].geometry.location.lng()
        };
        $scope.center = location;
        $scope.markers.push(location);
        $scope.mapReady = true;
      } else {
        $log.error('Google Maps não retornou resultado. '  + results);
      }
    });
  }

  Restangular.one('nonprofits', $stateParams.slug).get().then(function(response) {
    $scope.nonprofit = response;
    $scope.site.title = 'ONG ' + $scope.nonprofit.slug;
    $scope.nonprofit.id = $scope.nonprofit.slug;
    if ($scope.nonprofit.image_url) {
      $scope.image = $scope.nonprofit.image_url;
    } else {
      $scope.image = 'http://www.tokyocomp.com.br/imagens/estrutura/sem_foto.gif';
    }

    if ($scope.nonprofit.cover_url) {
      $scope.coverImage = $scope.nonprofit.cover_url;
    } else {
      $scope.coverImage = 'http://www.jonloomer.com/wp-content/uploads/2012/04/cover_profile_new_layers3.jpg';
    }

    getLatLong($scope.nonprofit.address);

  }, function(response) {
    $log.info(response);
    $state.transitionTo('root.home');
    toastr.error('Ong não encontrada.');
  });
}]);

app.controller('NonprofitAdminController', ['$scope', '$state', '$log', function($scope, $state, $log) {
  var nonprofit = $scope.loggedUser;
  $log.info(nonprofit);

  if (!$scope.loggedUser || $scope.loggedUser.role === 'VOLUNTEER') {
    $state.transitionTo('root.home');
    toastr.error('Apenas ONGs tem acesso ao Painel de Controle');
  }

}]);

// TODO(mpomarole) : Implement project box for landing page and through the site to lead volunteer to 
// find new projects to join
app.controller('ProjectBoxController', ['$scope', function($scope) {
  $scope.project = {
    name: 'Movimento Boa Praça',
    shortDescription: 'This is a short description...',
    city: 'São Paulo',
    state: 'State',
  };
}]);

// TODO
app.controller('ProjectPageController', ['$scope', function($scope) {
  $scope.project = null;
}]);
