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

app.controller('AppCtrl', function($scope, $rootScope, $modal, $state, $location, $anchorScroll, Site, Auth, Search) {
  
  $scope.site = Site;
  $scope.search = Search;
  $scope.modalInstance = null;
  $scope.storage = constants.storage;
  $scope.causes = Site.causes;
  $scope.skills = Site.skills;
  $scope.cities = Site.cities;
  $scope.states = Site.states;

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
  $scope.openTermsModal = function() {
    $scope.modalInstance = $modal.open({
      templateUrl: '/views/termsModal.html',
      windowClass: 'width: 1000px;'
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

app.controller('VolunteerModalCtrl', ['$scope', 'Facebook', 'Auth', '$rootScope', function($scope, Facebook, Auth, $rootScope) {
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

app.controller('NonprofitSignupCtrl', function($scope, $filter, $state, Auth, Photos) {

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

  $scope.$watch('password + passwordConfirm', function() {
    $scope.signupForm.password.doesNotMatch = $scope.password !== $scope.passwordConfirm;
    $scope.signupForm.password.$invalid = $scope.signupForm.password.doesNotMatch;
  });

  $scope.$watch('nonprofit.causes', function (value) {
    console.log(value);
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
    console.log($scope.nonprofit);
    Auth.nonprofitSignup($scope.nonprofit, function () {
      toastr.success('Bem vinda ONG ao atados!');
      $state.transitionTo('root.nonprofitadmin');
    },
    function (error) {
      toastr.error(error);
    });
  };
});

app.controller('VolunteerCtrl', function($scope, $filter, $state, $stateParams, $http,  Auth, Photos, Restangular) {

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
    $scope.volunteer.causes = $filter('filter')($scope.causes(), {checked: true});
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
});

app.controller('NonprofitCtrl', function($scope, $state, $stateParams, $http, $sce, Auth, Restangular) {

  $scope.markers = [];
  $scope.activeProjects = true;

  Restangular.one('nonprofits', $stateParams.slug).get().then(function(response) {
    $scope.nonprofit = response;
    $scope.site.title = 'ONG - ' + $scope.nonprofit.name;
    if ($scope.nonprofit.image_url) {
      $scope.image = $scope.nonprofit.image_url;
    } else {
      $scope.image = 'http://www.tokyocomp.com.br/imagens/estrutura/sem_foto.gif'; // TODO 
    }

    if ($scope.nonprofit.cover_url) {
      $scope.coverImage = $scope.nonprofit.cover_url;
    } else {
      $scope.coverImage = 'http://www.jonloomer.com/wp-content/uploads/2012/04/cover_profile_new_layers3.jpg'; // TODO
    }
    $scope.nonprofit.causes.forEach(function (c) {
      c.class = 'cause_' + c.id;
    });

    $scope.nonprofit.address = $scope.nonprofit.user.address;
    // Addings 1 to the index becuase we add the "Todas ..." when pulling from database
    $scope.nonprofit.address.city = $scope.cities()[$scope.nonprofit.user.address.city + 1];
    // Removing 1 because index at state table starts at 1
    $scope.nonprofit.address.state = $scope.states()[$scope.nonprofit.user.address.city.state - 1];
    window.nonprofit = $scope.nonprofit;

    $scope.markers.push($scope.nonprofit.address);
    $scope.center = new google.maps.LatLng($scope.nonprofit.address.latitude, $scope.nonprofit.address.longitude);
    $scope.zoom = 15;
  }, function() {
    $state.transitionTo('root.home');
    toastr.error('Ong não encontrada.');
  });
});

app.controller('NonprofitAdminCtrl', function($scope, $state) {
  // var nonprofit = $scope.loggedUser;

  if (!$scope.loggedUser || $scope.loggedUser.role === 'VOLUNTEER') {
    $state.transitionTo('root.home');
    toastr.error('Apenas ONGs tem acesso ao Painel de Controle');
  }
});

app.controller('ProjectCtrl', function () {
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

app.controller('LandingCtrl', function ($scope, Numbers) {
  $scope.site.title = 'Atados - Juntando Gente Boa';
  $scope.landing = true;
  Numbers.getNumbers(function (response) {
    $scope.numbers = response;
  }, function (error) {
    toastr.error(error);
  });
});

app.controller('AboutCtrl', function ($scope) {
  $scope.site.title = 'Atados - Sobre';
});

app.controller('ExplorerCtrl', function ($scope) {
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
});

app.controller('SearchCtrl', function ($scope, Restangular, $http, $location, $anchorScroll, Search) {

  $scope.search =  Search;

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
        showProjects: $scope.showProjects,
        city: $scope.search.city,
        cause: $scope.search.cause,
        skill: $scope.search.skill
      };
      $scope.$emit('landingToExplorer', vars);
    }
    else if ($scope.search.nextUrl) {
      $http.get($scope.search.nextUrl).success( function (response) {
        response.results._restultmeta = {next: response.next };
        //fixProject(response.results);
      }).error(function () {
        toastr.error('Erro ao buscar mais atos do servidor');
      });
    } else {
      toastr.error('Não conseguimos achar mais atos. Tente mudar os filtros.');
    }
  };
});
