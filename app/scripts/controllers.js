'use strict';

/* global toastr: false */
/* global google: false */

// ----
// Global Constants
var NONPROFIT = 'NONPROFIT',
    VOLUNTEER = 'VOLUNTEER';

toastr.options.closeButton = true;
toastr.options.hideEasing = 'linear';

var app = angular.module('atadosApp');

app.controller('AppController', ['$scope', '$rootScope', '$modal', '$state', 'Site', 'Auth',
  function($scope, $rootScope, $modal, $state, Site, Auth) {

  $scope.site = Site;

  Auth.getCurrentUser(function (user) {
    $scope.loggedUser = user;
  }, function () {
  });

  var modalInstance = null;

  $rootScope.$on('userLoggedIn', function(event, user) {
    if (user) {
      $scope.loggedUser = user;
      if ($scope.loggedUser.role === NONPROFIT) {
        $state.transitionTo('root.nonprofitadmin');
      } else if ($scope.loggedUser.role === VOLUNTEER) {}
      else {
        toastr.error('Unknown user that just logged in');
      }
      modalInstance.close();
    }
  });

  $scope.openVolunteerLoginModal = function() {
    modalInstance = $modal.open({
      templateUrl: '/views/volunteerLogin.html'
    });
  };
  $scope.openVolunteerSignupModal = function() {
    modalInstance = $modal.open({
      templateUrl: '/views/volunteerSignup.html'
    });
  };
  $scope.openNonprofitLoginModal = function () {
    modalInstance = $modal.open({
      templateUrl: '/views/nonprofitLogin.html'
    });
  };

  $rootScope.closeNonprofitLoginModal = function () {
    modalInstance.close();
  };

  $scope.logout = function () {
    toastr.info('Tchau!', $scope.loggedUser.slug);
    Auth.logout();
    $scope.loggedUser = null;
  };
}]);

app.controller('LoginController', ['$scope', '$rootScope', 'Auth', 'Facebook',
  function($scope, $rootScope, Auth, Facebook) {

  $scope.showForgotPassword = false;
  $scope.remember = true;

  $scope.$watch('email', function (value) {
    if (value) {
      Auth.isEmailUsed(value, function () {
        $scope.resetPasswordForm.email.alreadyUsed = false;
        $scope.resetPasswordForm.email.$invalid = true;
      }, function () {
        $scope.resetPasswordForm.email.alreadyUsed = true;
        $scope.resetPasswordForm.email.$invalid = false;
      });
    } else {
      $scope.resetPasswordForm.email.$invalid = true;
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
          toastr.success('Oi!', user.slug);
          $rootScope.$emit('userLoggedIn', user);
        }, function (error) {
          toastr.error(error);
        });
    }, function () {
      $scope.error = 'Usuário ou senha estão errados :(';
    });
  };

  $scope.forgotPassword = function () {
    $scope.showForgotPassword = !$scope.showForgotPassword;
  };

  $scope.resetPassword = function () {
    Auth.resetPassword($scope.email,  function () {
      toastr.info('Agora veja seu email para receber sua nova senha. Depois você pode mudar para uma senha da sua preferência.');
    }, function () {
      toastr.error('Sua senha não pode ser mandada. Por favor mande um email para o administrador marjori@atados.com.br');
    });
  };

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

  $scope.facebookLogin = function () {
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
}]);

app.controller('VolunteerSignupController',
    ['$scope', '$rootScope', 'Auth', 'Facebook', function($scope, $rootScope, Auth, Facebook) {

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
        toastr.error('Não consigos criar sua conta com Facebook. Há um erro no servidor.');
      });
  }

  $scope.facebookSignup = function () {
    Facebook.getLoginStatus(function (response) {
      if (response.status !== 'connected') {
        Facebook.login(function(loginResponse) {
          if (loginResponse.status === 'connected') {
            sendFacebookCredentials(loginResponse.authResponse);
          } else if (response.status === 'not_authorized') {
            toastr.error('Autorize app');
            // Here now user needs to authorize the app to be used with Facebook
          }
        }, {scope: 'email'});
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

app.controller('NonprofitSignupController',
    ['$scope', '$filter', '$state', 'Auth', 'Restangular', function($scope, $filter, $state, Auth, Restangular) {

  $scope.nonprofit = {};

  Restangular.all('causes').getList().then( function(response) {
    $scope.causes = response;
  }, function () {
    toastr.error('Não consegui pegar as causas do servidor.');
  });
  Restangular.all('suburbs').getList().then( function(response) {
    $scope.suburbs = response;
  }, function () {
    toastr.error('Não consegui pegar as Zonas do servidor.');
  });
  Restangular.all('cities').getList().then( function(response) {
    $scope.cities = response;
  }, function () {
    toastr.error('Não consegui pegar as cidades do servidor.');
  });
  Restangular.all('states').getList().then( function(response) {
    $scope.states = response;
  }, function () {
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
        Auth.isNonprofitSlugUsed(value, function () {
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

  // Checking that slug not already used.
  $scope.$watch('nonprofit.user.slug', function (value) {
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

  $scope.$watch('password + passwordConfirm', function() {
    $scope.signupForm.password.doesNotMatch = $scope.password !== $scope.passwordConfirm;
    $scope.signupForm.password.$invalid = $scope.signupForm.password.doesNotMatch;
  });

  $scope.signup = function () {
    if ($scope.signupForm.$valid) {
      $scope.nonprofit.user.password = $scope.password;
      $scope.nonprofit.causes = $filter('filter')($scope.causes, {checked: true});
      Auth.nonprofitSignup($scope.nonprofit, function () {
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
    ['$scope', '$filter', '$state', '$stateParams', '$http', 'Auth', 'Photos', 'Restangular', 'volunteer',
    function($scope, $filter, $state, $stateParams, $http,  Auth, Photos, Restangular, volunteer) {

  $scope.site.title = 'Voluntário - ' + $stateParams.slug;

  Restangular.all('causes').getList().then( function(causes) {
    $scope.cause = causes;
  }, function () {
    toastr.error('Não consegui pegar as causas do servidor.');
  });
  Restangular.all('skills').getList().then( function(skills) {
    $scope.skills = skills;
  }, function () {
    toastr.error('Não consegui pegar as causas do servidor.');
  });
  Restangular.one('volunteers', $stateParams.slug).get().then(function(response) {
    $scope.volunteer = response;
    $scope.volunteer.id = $scope.volunteer.slug;
    $scope.image = $scope.volunteer.image_url;
  }, function() {
    $state.transitionTo('root.home');
    toastr.error('Voluntário não encontrado');
  });

  // $scope.volunteer = volunteer; from resolve TODO
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

    $scope.volunteer.put().then( function () {
      toastr.success('Perfil salvo!', $scope.volunteer.slug);
    }, function () {
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
      $scope.profileForm.email.alreadyUsed = false;
    }
    else if (value !== $scope.loggedUser.user.email) {
      Auth.isEmailUsed(value, function () {
        $scope.profileForm.email.alreadyUsed = false;
        $scope.profileForm.email.$invalid = false;
      }, function () {
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
      }, function() {
        toastr.error('Error no servidor. Não consigo atualizer sua foto :(');
      });
    }
  };
}]);

app.controller('NonprofitController',
    ['$scope', '$state', '$stateParams', '$http', 'Auth', 'Restangular', function($scope, $state, $stateParams, $http,  Auth, Restangular) {

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
        toastr.error('Google Maps não retornou resultado.');
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

    getLatLong($scope.nonprofit.user.address);

  }, function() {
    $state.transitionTo('root.home');
    toastr.error('Ong não encontrada.');
  });
}]);

app.controller('NonprofitAdminController', ['$scope', '$state', function($scope, $state) {
  // var nonprofit = $scope.loggedUser;

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
app.controller('ProjectController', ['$scope', function($scope) {
  $scope.project = {};
}]);

app.controller('ProjectNewController', ['$scope', '$filter', '$state', 'Auth', 'Restangular',
    function($scope, $filter, $state, Auth, Restangular) {

  /*$scope.getCssClasses = function (ngModelController) {
    return {
      has-error: $scope.projectNewForm.email.$invalid && projectNewForm.email.$error,
      has-success: $scope.projectNewForm.email.$error || $scope.projectNewForm.
    };

  };*/

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

  $scope.donation = {
    delivery: $scope.delivery,
    collection_by_nonprofit: false
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

  Restangular.all('causes').getList().then( function(response) {
    $scope.causes = response;
  }, function () {
    toastr.error('Não consegui pegar as causas do servidor.');
  });
  Restangular.all('skills').getList().then( function(response) {
    $scope.skills = response;
  }, function () {
    toastr.error('Não consegui pegar as habiliadades do servidor.');
  });
  Restangular.all('suburbs').getList().then( function(response) {
    $scope.suburbs = response;
  }, function () {
    toastr.error('Não consegui pegar as Zonas do servidor.');
  });
  Restangular.all('cities').getList().then( function(response) {
    $scope.cities = response;
  }, function () {
    toastr.error('Não consegui pegar as cidades do servidor.');
  });
  Restangular.all('states').getList().then( function(response) {
    $scope.states = response;
  }, function () {
    toastr.error('Não consegui pegar os estados do servidor.');
  });

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
      window.rolesReturned = rolesReturned;
      //rolesReturned.forEach( function (role) {
        //console.log(role);
        //$scope.job.roles.push(role.id);
      //});
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

  var createDonation = function () {
    $scope.project.donation = $scope.donation;
  };

  $scope.createProject = function () {

    $scope.project.causes = $filter('filter')($scope.causes, {checked: true});
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
      case 'donation':
        createDonation();
        break;
    }
  };
}]);
