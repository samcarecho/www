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
      $scope.loggedUser = user;
    }, function (error) {
      console.log(error);
    }
  );

  var modalInstance = null;
  $rootScope.$on('userLoggedIn', function(event, user) {
    $scope.loggedUser = user;
    modalInstance.close();
  });

  $scope.openLoginModal = function() { 
    modalInstance = $modal.open({
      templateUrl: 'views/loginSignupModal.html'
    });
  }

  $scope.logout = function () {
    toastr.info('Tchau!', $scope.loggedUser.username);
    Auth.logout();
    $scope.loggedUser = null;
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
    }, function () {
      Auth.getCurrentUser(
        function (user) { 
          toastr.success('Oi ' + user.username  + '!');
          $rootScope.$emit('userLoggedIn', user);
          $scope.error = null;
        }, function (error) {}
      );
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

  $scope.facebookLogin = function () {
    Facebook.getLoginStatus(function (response) {
      if (response.status != 'connected') {
        Facebook.login(function(response) {
          if (response.status == 'connected') {
            Auth.facebookLogin(response.authResponse,
              function () {
                console.log("Now get the access token")
              }, function () {
                console.log("Error")
              });
            $scope.me();
          }
        });
      } else {
        Auth.facebookLogin(response.authResponse,
          function () {
            console.log("Now get the access token")
          }, function () {
            console.log("Error")
          });
        $scope.me();
      } 
    });
  };

 $scope.me = function() {
    Facebook.api('/me', function(response) {
      $rootScope.$emit('userLoggedIn', response);
    });
  };
}]);

app.controller('VolunteerSignupController', ['$scope', '$rootScope', '$location', 'Auth', function($scope, $rootScope, $location, Auth) {
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
          $location.path('/');
        },
        function (error) {
          toastr.error('Error on volunteer signup ' + error);
      });
    }
  };

  $scope.facebookSignup = function (provider) {
    toastr.info('Trying signup through ' + provider);
  };
}]);

app.controller('NonprofitSignupController', ['$scope', '$rootScope', '$location', 'Auth', function($scope, $rootScope, $location, Auth) {
}]);

app.controller('ProjectBoxController', ['$scope', '$rootScope', function($scope, $rootScope) {
  $scope.project = {
    name: 'Movimento Boa Praça',
    shortDescription: 'This is a short description...',
    city: 'São Paulo',
    state: 'State',
  };
}]);
