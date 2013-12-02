'use strict';

/* global toastr: false */
/* global constants: false */
/* global google: false */

// ----
// Global Constants
var NONPROFIT = 'NONPROFIT',
    VOLUNTEER = 'VOLUNTEER';

toastr.options.closeButton = true;
toastr.options.hideEasing = 'linear';

var app = angular.module('atadosApp');

app.controller('AppController', ['$scope', '$rootScope', '$modal', '$state', 'Site', 'Auth', 'Restangular',
  function($scope, $rootScope, $modal, $state, Site, Auth, Restangular) {

  $scope.site = Site;
  $scope.modalInstance = null;
  $scope.year = (new Date()).getFullYear();

  //$scope.storage = constants.s3;
  $scope.storage = constants.local; // If DEBUG TODO(mpomarole)

  Restangular.all('skills').getList().then( function(response) {
    $scope.skills = response;
    $scope.skills.splice(0, 0, {name: 'Todas Habilidades', id: ''});
  }, function () {
    toastr.error('Não consegui pegar as habilidades do servidor.');
  });
  Restangular.all('causes').getList().then( function(response) {
    $scope.causes = response;
    $scope.causes.splice(0, 0, {name: 'Todas Causas', id: ''});
  }, function () {
    toastr.error('Não consegui pegar as causas do servidor.');
  });
  Restangular.all('cities').getList().then( function(response) {
    $scope.cities = response;
    $scope.cities.splice(0, 0, {name: 'Todas Cidades', id: ''});
  }, function () {
    toastr.error('Não consegui pegar as cidades do servidor.');
  });

  Auth.getCurrentUser(function (user) {
    $scope.loggedUser = user;
  }, function () {
  });

  $rootScope.$on('userLoggedIn', function(event, user) {
    if (user) {
      $scope.loggedUser = user;
      if ($scope.loggedUser.role === NONPROFIT) {
        $state.transitionTo('root.nonprofitadmin');
      } else if ($scope.loggedUser.role === VOLUNTEER) {}
      else {
        toastr.error('Usuário desconhecido acabou de logar.');
        // TODO(mpomarole): proper handle this case and disconect the user. Send email to administrador.
      }
      if ($scope.modalInstance.close()) {
        $scope.modalInstance.close();
      }
      toastr.success('Oi! Bom te ver por aqui :)', $scope.loggedUser.slug);
      $state.transitionTo('root.explore');
    }
  });

  $scope.openVolunteerModal = function() {
    $scope.modalInstance = $modal.open({
      templateUrl: '/views/volunteerModal.html'
    });
  };
  $scope.openNonprofitModal = function () {
    $scope.modalInstance = $modal.open({
      templateUrl: '/views/nonprofitModal.html'
    });
  };

  $rootScope.closeNonprofitLoginModal = function () {
    $scope.modalInstance.close();
  };

  $scope.logout = function () {
    toastr.success('Tchau até a próxima :)', $scope.loggedUser.slug);
    Auth.logout();
    $scope.loggedUser = null;
  };
}]);

app.controller('HomeController', ['$scope', function($scope) {
  $scope.site.title = 'Atados - Juntando Gente Boa';
}]);

app.controller('LoginController', ['$scope', '$rootScope', 'Auth', 'Facebook',
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

app.controller('VolunteerModalController', ['$scope', 'Facebook', 'Auth', '$rootScope', function($scope, Facebook, Auth, $rootScope) {
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
}]);

app.controller('VolunteerSignupController',
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

app.controller('NonprofitSignupController',
    ['$scope', '$filter', '$state', 'Auth', 'Restangular', function($scope, $filter, $state, Auth, Restangular) {

  $scope.nonprofit = {};

  Restangular.all('suburbs').getList().then( function(response) {
    $scope.suburbs = response;
  }, function () {
    toastr.error('Não consegui pegar as Zonas do servidor.');
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
    ['$scope', '$filter', '$state', '$stateParams', '$http', 'Auth', 'Photos', 'Restangular',
    function($scope, $filter, $state, $stateParams, $http,  Auth, Photos, Restangular) {

  $scope.site.title = 'Voluntário - ' + $stateParams.slug;

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
app.controller('ProjectController', [function () {
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

  Restangular.all('suburbs').getList().then( function(response) {
    $scope.suburbs = response;
  }, function () {
    toastr.error('Não consegui pegar as Zonas do servidor.');
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

app.controller('LandingCtrl', ['$scope', function ($scope) {
  $scope.landing = true;
}]);

app.controller('AboutCtrl', [ function () {
  toastr.info('This is the about page');
}]);

app.controller('ExplorerCtrl', ['$scope', function ($scope) {
  $scope.site.title = 'Atados - Explore';
  $scope.landing = false;

  angular.extend($scope, {
    map: {
      center: {
        latitude: -23.553287,
        longitude: -46.638535
      },
      markers: [],
      zoom: 10,
      dragging: false
    }
  });

  var onMarkerClicked = function(marker){
    marker.showWindow = true;
    console.debug('Marker: lat: ' + marker.latitude +', lon: ' + marker.longitude + ' clicked!!');
  };

  $scope.onMarkerClicked = onMarkerClicked;

  $scope.map.markers.forEach(function(marker){
    marker.closeClick = function(){
      marker.showWindow = false;
      $scope.$apply();
    };
    marker.onClicked = function(){
      onMarkerClicked(marker);
    };
  });
}]);

app.controller('SearchCtrl', ['$scope', 'Restangular', '$http', function ($scope, Restangular, $http) {
  $scope.active = 'atos';
  $scope.showProjects = true;

  $scope.projects = [];
  $scope.nonprofits = [];

  $scope.searchQuery = '';
  $scope.cause = '';
  $scope.skill = '';
  $scope.city= '';

  $scope.next_url = '';

  var fixProject = function (response) {
    response.forEach(sanitizeProject);
    if (response._resultmeta) {
      $scope.next_url = response._resultmeta.next;
    } else {
      $scope.next_url = '';
    }
  };

  var fixNonprofit = function (response) {
    response.forEach(sanitizeNonprofit);
    if (response._resultmeta) {
      $scope.next_url = response._resultmeta.next;
    } else {
      $scope.next_url = '';
    }
  };

  var getAddressStr = function (a) {
    return a.addressline + ', ' + a.addressnumber + ' - ' + a.city.name + ' ' + a.city.state.code;
  };

  function getLatLong(address){
    var geo = new google.maps.Geocoder();
    geo.geocode({'address': getAddressStr(address), 'region': 'br'},
    function(results, status){
      if (status === google.maps.GeocoderStatus.OK) {
        address.coords =  {
          latitude: results[0].geometry.location.lat(),
          longitude: results[0].geometry.location.lng(),
          showWindow: true,
          title: '',
          icon: 'heart16.png'
        };
        $scope.map.markers.push(address.coords);
        $scope.mapReady = true;
      } else {
        toastr.error('Google Maps não retornou resultado.');
      }
    });
  }

  var sanitizeProject = function (p) {
    p.address = {addressline: 'Rua João Moura', addressnumber: '366', city: {name: 'São Paulo', state: {code: 'SP'}}};
    getLatLong(p.address);
    window.address = p.address;
    p.volunteers = Math.floor((Math.random()*1000)+1);
    var returnName = function (c) {
      return c.name;
    };
    p.causesStr = p.causes.map(returnName).join('/');
    if (p.job) {
      p.address = p.job.address;
    } else if (p.work) {
      p.address = p.work.address;
    } else if (p.donation) {
      p.address = p.donation.address;
    }
    $scope.projects.push(p);
  };
  var sanitizeNonprofit = function (n) {
    $scope.nonprofits.push(n);
  };

  var searchProjects = function () {
    var urlHeaders = {
      page_size: constants.page_size,
      query: $scope.searchQuery,
      cause: $scope.cause.id,
      skill: $scope.skill.id,
      city: $scope.city.id
    };
    Restangular.all('projects').getList(urlHeaders).then( function(response) {
      fixProject(response);
    }, function () {
      toastr.error('Não consegui pegar os atos do servidor.');
    });
  };

  var searchNonprofits = function () {
    var urlHeaders = {
      page_size: constants.page_size,
      query: $scope.searchQuery,
      cause: $scope.cause.id,
      city: $scope.city.id
    };
    Restangular.all('nonprofits').getList(urlHeaders).then( function (response) {
      fixNonprofit(response);
    });
  };

  $scope.$watch('showProjects', function (showProjects) {
    if (showProjects) {
      $scope.active = 'atos';
      if ($scope.projects.length === 0) {
        searchProjects();
      }
    } else {
      $scope.active = 'ONGs';
      if ($scope.nonprofits.length === 0) {
        searchNonprofits();
      }
    }
  });

  var filter = function () {
    if ($scope.showProjects) {
      $scope.projects = [];
      searchProjects();
    } else {
      $scope.nonprofits = [];
      searchNonprofits();
    }
  };

  $scope.$watch('searchQuery', function () {
    if (!$scope.landing) {
      filter();
    }
  });
  $scope.$watch('cause', function () {
    if ($scope.cause) {
      filter();
    }
  });
  $scope.$watch('skill', function () {
    if ($scope.skill) {
      filter();
    }
  });
  $scope.$watch('city', function () {
    if ($scope.city) {
      filter();
    }
  });

  $scope.getMore = function () {
    if ($scope.landing) {
    }
    else if ($scope.next_url) {
      $http.get($scope.next_url).success( function (response) {
        response.results._restultmeta = {next: response.next };
        fixProject(response.results);
      }).error(function () {
        toastr.error('Erro ao buscar mais atos do servidor');
      });
    } else {
      toastr.error('Não conseguimos achar mais atos. Tente mudar os filtros.');
    }
  };
}]);
