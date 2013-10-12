'use strict';

toastr.options.closeButton = true;

var app = angular.module('atadosApp');

app.controller('AppController', function($scope, $translate, Site, Auth) {
  $scope.changeLanguage = function (langKey) {
    $translate.uses(langKey);
  };

  // Uncomment this if you want to test a user profile
  // $scope.loggedUser = testUser;
  var testUser = {
    name: 'Marjori Pomarole',
    email: 'marjoripomarole@gmail.com',
    username: 'marjoripomarole',
    type: 'NONPROFIT'
  };

  $scope.site = Site;
});

app.controller('LoginSignupModalController', ['$scope', '$modal', '$log', function($scope, $modal, $log) {
  $scope.show = function () {
    var modalInstance = $modal.open({
      templateUrl: 'views/loginSignupModal.html'
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
}]);

app.controller('LoginController', ['$scope', '$rootScope', '$location', 'Auth', function($scope, $rootScope, $location, Auth) {
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
        remember: 'True'
      }, function (response) {
        toastr.success('Oi ' + Auth.user + '!');
        $rootScope.loggedUser = Auth.user;
        $scope.error = null;
      }, function (error) {
        $scope.error = 'Usuário ou senha estão errados :(';
      });
  };

  $scope.loginOauth = function (provider) {
    toastr.info('Trying login through ' + provider);
    //$location.path('/auth/' + provider)
  };

  $scope.forgotPassword = function () {
    console.log('You forgot password :(');
  };
}]);

app.controller('VolunteerSignupController', ['$scope', '$rootScope', '$location', 'Auth', function($scope, $rootScope, $location, Auth) {
  $scope.role = Auth.userRoles.volunteer;
  $scope.userRoles = Auth.userRoles;

  function checkInvalid() {
    $scope.invalidForm =  $scope.signupForm.$invalid ||
      $scope.usernameError || $scope.emailError || $scope.passwordDoesNotMatch;
  }

  $scope.$watch('username + password + passwordConfirm + email', function() {
    checkInvalid();
  });

  $scope.$watch('username', function (value) {
    Auth.isUsernameUsed(value, function (response) {
      $scope.usernameError = null;
      checkInvalid();
    }, function (error) {
      $scope.usernameError = 'Usuário já existe.';
    });
  });

  $scope.$watch('email', function (value) {
    Auth.isEmailUsed(value, function (response) {
      $scope.emailError = null;
      checkInvalid();
    }, function (error) {
      $scope.emailError = 'Email já existe.';
    });
  });


  $scope.$watch('password + passwordConfirm', function() {
    $scope.passwordDoesNotMatch = $scope.password !== $scope.passwordConfirm;
  });

  $scope.signup = function () {

    console.log('This is working');
    Auth.signup({
        username: $scope.username,
        email: $scope.email,
        password: $scope.password,
        role: $scope.role
      },
      function () {
        $location.path('/');
      },
      function (error) {
        toastr.error('Error on volunteer signup ' + error);
      });
  };

  $scope.signupOauth = function (provider) {
    toastr.info('Trying signup through ' + provider);
  };
}]);

app.controller('NonprofitSignupController', ['$scope', '$rootScope', '$location', 'Auth', function($scope, $rootScope, $location, Auth) {
  $scope.role = Auth.userRoles.nonprofit;
  $scope.userRoles = Auth.userRoles;

  $scope.$watch('password + passwordConfirm', function() {
    $scope.passwordDoesNotMatch = $scope.password !== $scope.passwordConfirm;
  });
  $scope.signup = function () {

    console.log('This is working');
    Auth.signup({
        username: $scope.username,
        email: $scope.email,
        password: $scope.password,
        role: $scope.role
      },
      function () {
        $location.path('/');
      },
      function (error) {
        toastr.error('Error on nonprofit signup ' + error);
      });
  };
}]);
