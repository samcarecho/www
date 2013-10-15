'use strict';

toastr.options.closeButton = true;

var app = angular.module('atadosApp');

app.controller('AppController', ['$scope', '$rootScope', '$translate', '$modal', 'Site', 'Auth', 'Facebook',
  function($scope, $rootScope, $translate, $modal, Site, Auth, Facebook) {

  $scope.changeLanguage = function (langKey) {
    $translate.uses(langKey);
  };

  $scope.site = Site;
  Auth.getCurrentUser(
    function (user) { 
      $rootScope.loggedUser = user;
    }, function (error) {
      console.log(error);
    }
  );

  var modalInstance = null;
  $rootScope.$on('userLoggedIn', function(event, user) {
    $rootScope.loggedUser = user;
    modalInstance.close();
  });

  $scope.openLoginModal = function() { 
    modalInstance = $modal.open({
      templateUrl: 'views/loginSignupModal.html'
    });
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
      remember: $scope.remember,
    }, function (response) {
      Auth.getCurrentUser(
        function (user) { 
          toastr.success('Oi!', user.username);
          $rootScope.$emit('userLoggedIn', user);
          // $scope.error = null;
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
        toastr.error(error)
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
      Auth.signup({
          username: $scope.username,
          email: $scope.email,
          password: $scope.password
        },
        function (response) {
          // TODO(mpomarole) : redirect user to his new profile page
        },
        function (error) {
          toastr.error(error);
      });
    }
  };

  $scope.facebookSignup = function (provider) {
    toastr.info('Trying signup through ' + provider);
  };
}]);

app.controller('NonprofitSignupController', ['$scope', '$rootScope', 'Auth', function($scope, $rootScope, Auth) {
}]);

app.controller('ProjectBoxController', ['$scope', '$rootScope', function($scope, $rootScope) {
  $scope.project = {
    name: 'Movimento Boa Praça',
    shortDescription: 'This is a short description...',
    city: 'São Paulo',
    state: 'State',
  };
}]);

app.controller('VolunteerController', ['$scope', '$rootScope', '$stateParams', 'Restangular', function($scope, $rootScope, $stateParams, Restangular) {
  $scope.volunteer  = Restangular.one('volunteers', $stateParams.username).get().then(function(response) {
    $scope.volunteer = response;
  }, function(response) {
    toastr.error("Voluntário não encontrado");
  });
}]);
