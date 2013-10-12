'use strict';

toastr.options.closeButton = true;

var app = angular.module('atadosApp');

app.controller('AppController', function($scope, $rootScope, $translate, Site, Auth) {
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

  $rootScope.$on('userLoggedIn', function(event, user) {
    $scope.loggedUser = user;
  });
  $rootScope.$on('userLoggedOut', function(user) {
    toastr.info('Tchau!', $scope.loggedUser.username);
    $scope.loggedUser = null;
  });

  $scope.logout = function () {
    Auth.logout();
    $rootScope.$emit('userLoggedOut', 'HAHA');
  };
});

app.controller('LoginSignupModalController', ['$scope', '$modal', '$log', function($scope, $modal, $log) {
  $scope.show = function () {
    var modalInstance = $modal.open({
      templateUrl: 'views/loginSignupModal.html'
    });
  };
}]);

app.controller('LoginController', ['$scope', '$rootScope', 'Auth', function($scope, $rootScope, Auth) {

  $scope.username = '';
  $scope.password = '';
  $scope.remember = true;

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
        }, function (error) {
          console.log(error);
        }
      );
          }, function (error) {
      $scope.error = 'Usuário ou senha estão errados :(';
    });
  };

  $scope.loginOauth = function (provider) {
    toastr.info('Trying login through ' + provider);
  };

  // TODO
  $scope.forgotPassword = function () {
    console.log('You forgot password :(');
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
  });

  $scope.signup = function () {
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
