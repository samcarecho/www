'use strict';

toastr.options.closeButton = true;
toastr.options.hideEasing = 'linear';

var app = angular.module('atadosApp');

app.controller('AppController', ['$scope', '$rootScope', '$translate', '$modal', 'Site', 'Auth', 'Facebook',
  function($scope, $rootScope, $translate, $modal, Site, Auth, Facebook) {

  $scope.changeLanguage = function (langKey) {
    $translate.uses(langKey);
  };

  $scope.site = Site;

  Auth.getCurrentUser(function (user) { 
    $rootScope.loggedUser = user;
  }, function (error) {
    console.error(error);
  });

  var modalInstance = null;
  $rootScope.$on('userLoggedIn', function(event, user) {
    $rootScope.loggedUser = user;
    modalInstance.close();
  });

  $scope.openVolunteerPortalModal = function() { 
    modalInstance = $modal.open({
      templateUrl: '/views/volunteerPortalModal.html'
    });
  }

  $scope.openNonprofitPortalModal = function () {
    modalInstance = $modal.open({
      templateUrl: '/views/nonprofitPortalModal.html'
    });
  }

  $scope.closeNonprofitPortalModal = function () {
    modalInstance.close();
  }

  $scope.logout = function () {
    toastr.info('Tchau!', $rootScope.loggedUser.username);
    Auth.logout();
    $rootScope.loggedUser = null;
  };
}]);

app.controller('LoginController', ['$scope', '$rootScope', 'Auth', 'Facebook',
  function($scope, $rootScope, Auth, Facebook) {

  $scope.showForgotPassword = false;
  $scope.username = '';
  $scope.password = '';
  $scope.remember = true;
  console.log

  $scope.resetEmail = '';
  $scope.invalidEmail = true;

  $scope.$watch('resetEmail', function (value) {
    Auth.isEmailUsed(value, function (response) {
        $scope.emailError = 'Email não existe.';
        $scope.invalidEmail = true;
      }, function (error) {
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
      Auth.getCurrentUser(
        function (user) { 
          toastr.success('Oi!', user.username);
          $rootScope.$emit('userLoggedIn', user);
        }, function (error) {
          toastr.error(error);
        });
    }, function (error) {
      $scope.error = 'Usuário ou senha estão errados :(';
    });
  };

  $scope.forgotPassword = function () {
    $scope.showForgotPassword = !$scope.showForgotPassword
  };

  $scope.resetPassword = function () {
    Auth.resetPassword($scope.resetEmail,  function (response) {
      toastr.info("Por favor cheque seu email para receber sua nova senha.");
    }, function (error) {
      toastr.error("Sua senha não pode ser mandada. Por favor mande um email para o administrador marjori@atados.com.br");
    });
  };

  $scope.$watch(function() {
    return Facebook.isReady(); 
  }, function(newVal) {
    $scope.facebookReady = true;
  });

  function sendFacebookCredentials(authResponse) {
    Auth.facebookLogin(authResponse,
      function (user) {
        $rootScope.$emit('userLoggedIn', user);
        console.log(user);
      }, function (error) {
        toastr.error(error);
      });
  } 

  $scope.facebookLogin = function () {
    Facebook.getLoginStatus(function (response) {
      if (response.status != 'connected') {
        Facebook.login(function(loginResponse) {
          console.log(response);
          console.log(loginResponse);
          if (loginResponse.status == 'connected') {
            sendFacebookCredentials(loginResponse.authResponse);
          } else if (response.status == 'not_authorized') {
            // Here now use needs to authorize the app to be used with Facebook
          }
        });
      } else {
        console.log(response);
        if (response.authResponse) {
          sendFacebookCredentials(response.authResponse);
        } else {
          toastr.error("Could not get facebook credentials");
        }
      }  
    });
  };
}]);

app.controller('VolunteerSignupController', ['$scope', '$rootScope', 'Auth', function($scope, $rootScope, Auth) {
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
        $scope.usernameError = null;
        checkInvalid();
      }, function (error) {
        $scope.usernameError = 'Usuário já existe.';
      });
    }
  });
  $scope.$watch('email', function (value) {
    if (value) {
      Auth.isEmailUsed(value, function (response) {
        $scope.emailError = null;
        checkInvalid();
      }, function (error) {
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
          Auth.login({
            username: $scope.username,
            password: $scope.password,
            remember: $scope.remember
          }, function (response) {
            Auth.getCurrentUser(
              function (user) { 
                toastr.success('Oi!', user.username);
                $rootScope.$emit('userLoggedIn', user);
              }, function (error) {
                toastr.error(error);
              });
    }, function (error) {
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
    ['$scope', '$rootScope', '$filter', 'Auth', 'Restangular', function($scope, $rootScope, $filter, Auth, Restangular) {

  $scope.nonprofit = {};
  window.scope = $scope;

  Restangular.all('causes').getList().then( function(response) {
    $scope.causes = response;
  }, function (error) {
    toastr.error("Não consegui pegar as causas do servidor.");
  });
  Restangular.all('suburbs').getList().then( function(response) {
    $scope.suburbs = response;
  }, function (error) {
    toastr.error("Não consegui pegar as Zonas do servidor.");
  });
  Restangular.all('cities').getList().then( function(response) {
    $scope.cities = response;
  }, function (error) {
    toastr.error("Não consegui pegar as cidades do servidor.");
  });
  Restangular.all('states').getList().then( function(response) {
    $scope.states = response;
  }, function (error) {
    toastr.error("Não consegui pegar os estados do servidor.");
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
          $scope.signupForm.slug.alreadyUsed = false;
          $scope.signupForm.slug.$invalid = false;
        }, function (error) {
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
    Auth.isEmailUsed(value, function (yesItIsAlreadyUsed) {
      $scope.signupForm.email.alreadyUsed = false;
      $scope.signupForm.email.$invalid = false;
    }, function (notUsed) {
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
        Auth.isUsernameUsed(value, function (response) {
          $scope.signupForm.username.alreadyUsed = false;
          $scope.signupForm.username.$invalid = false;
        }, function (error) {
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
      Auth.nonprofitSignup($scope.nonprofit,
        function (response) {
          toastr.success("Bem vinda ONG ao atados!");
          // TODO(mpomarole) : redirect redirect nonprofit to awaiting moderation status
        },
        function (error) {
          toastr.error(error);
      });
    }
  };
}]);

app.controller('ProjectBoxController', ['$scope', '$rootScope', function($scope, $rootScope) {
  $scope.project = {
    name: 'Movimento Boa Praça',
    shortDescription: 'This is a short description...',
    city: 'São Paulo',
    state: 'State',
  };
}]);

app.controller('VolunteerController',
    ['$scope', '$rootScope', '$state', '$stateParams', '$http', 'Auth', 'Restangular', function($scope, $rootScope, $state, $stateParams, $http,  Auth, Restangular) {

  $scope.invalidForm = true;
  $scope.passwordDoesNotMatch = true;
  
  Restangular.one('volunteers', $stateParams.username).get().then(function(response) {
    $scope.volunteer = response;
    $scope.volunteer.id = $scope.volunteer.username;
    if ($scope.volunteer.image_url) {
      $scope.image = $scope.volunteer.image_url;
    } else {
      $scope.image = "http://static.bleacherreport.net/images/redesign/avatars/default-user-icon-profile.png";
    }
    delete $scope.volunteer.image_url;
  }, function(response) {
    $state.transitionTo('root.home');
    toastr.error('Voluntário não encontrado');
  });

  $scope.saveVolunteer = function () {
    $scope.volunteer.patch().then( function (response) {
      toastr.success("Perfil salvo!", $scope.volunteer.username);
    }, function (error) {
      toastr.error("Problema em salvar seu perfil :(");
    });
  };

  function checkInvalid () {
    $scope.invalidForm = $scope.emailError || $scope.passwordDoesNotMatch;
  }

  $scope.checkInvalid = function(form) {
    $scope.invalidForm |= form.$invalid;
    checkInvalid();
  };

  $scope.$watch('volunteer.user.email', function (value) {
    if (!$rootScope.loggedUser) return;

    if (value && value != $rootScope.loggedUser.user.email) {
      $scope.emailError = "";
    }
    else if (value != $rootScope.loggedUser.user.email) {
      Auth.isEmailUsed(value, function (response) {
        $scope.emailError = null;
      }, function (error) {
        $scope.emailError = 'Email já existe.';
      });
    }
  });

  $scope.$watch('password + passwordConfirm', function() {
    $scope.passwordDoesNotMatch = $scope.password !== $scope.passwordConfirm;
    checkInvalid();
  });

  $scope.uploadFile = function(files) {
    if (files) {
      var fd = new FormData();
      fd.append("file", files[0]);
      window.fd = files[0];
      $http.post("http://api.atados.com.br:8000/v1/upload_volunteer_image/", fd, {
          headers: {'Content-Type': undefined },
          transformRequest: angular.identity
      }).success( function (response) {
        $scope.image = response.file;
      }).error( function(error) {
        toastr.error("Error no servidor. Não consigo atualizer sua foto :(");
      });
    }
  };
}]);

app.controller('NonprofitController',
    ['$scope', '$rootScope', '$state', '$stateParams', '$http', 'Auth', 'Restangular', function($scope, $rootScope, $state, $stateParams, $http,  Auth, Restangular) {

  angular.extend($scope, {
    center: {
      latitude: -23.553287,
      longitude: -46.638535,
    },
    markers: [],
    zoom: 14,
  });

  function getLatLong(address){
    var geo = new google.maps.Geocoder;
    var addressString = address.addressline + ' ' + address.number;
    geo.geocode({'address':address.addressline, 'region': 'br'},
    function(results, status){
      if (status == google.maps.GeocoderStatus.OK) {
        var location = {
          latitude: results[0].geometry.location.lat(),
          longitude: results[0].geometry.location.lng()
        }
        $scope.center = location;
        $scope.markers.push(location);
        $scope.mapReady = true;
        window.scope = $scope;
      } else {
        console.error("Mapa não retornou resultado."  + results)
      }
    });
  }

  Restangular.one('nonprofits', $stateParams.slug).get().then(function(response) {
    window.scope = $scope

    $scope.nonprofit = response;
    $scope.site.title = "ONG " + $scope.nonprofit.slug;
    $scope.nonprofit.id = $scope.nonprofit.slug;
    if ($scope.nonprofit.image_url) {
      $scope.image = $scope.nonprofit.image_url;
    } else {
      $scope.image = "http://www.tokyocomp.com.br/imagens/estrutura/sem_foto.gif";
    }

    if ($scope.nonprofit.cover_url) {
      $scope.coverImage = $scope.nonprofit.cover_url;
    } else {
      $scope.coverImage = "http://www.jonloomer.com/wp-content/uploads/2012/04/cover_profile_new_layers3.jpg";
    }

    getLatLong($scope.nonprofit.address); 

    console.log($scope.nonprofit.causes);
  }, function(response) {
    $state.transitionTo('root.home');
    toastr.error('Ong não encontrada.');
  });
}]);
