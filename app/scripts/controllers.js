'use strict';

toastr.options.closeButton = true;

var app = angular.module('atadosApp');

app.controller('AppController', function($scope, $translate, Site) {
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

app.controller('LoginController', function($scope, $rootScope, $location, Auth) {
  $scope.username = '';
  $scope.password = '';
  $scope.rememberme = false;

  $scope.login = function() {
    if ( !($scope.password && $scope.username)) {
      return;
    }

    Auth.login({
        username: $scope.username,
        password: $scope.password,
        rememberme: $scope.rememberme
      }, function (response) {
        toastr.error('Success on login ' + response);
        $location.path('/');
      }, function (error) {
        toastr.error('Failed to login ' + error);
      });
  };

  $scope.loginOauth = function (provider) {
    toastr.info('Trying login through Facebook');
    $location.path('/auth/' + provider)
  };
});

app.controller('VolunteerSignupController', ['$rootScope', '$scope', '$location', 'Auth', function($scope, $rootScope, $location, Auth) {
  $scope.role = Auth.userRoles.volunteer;
  $scope.userRoles = Auth.userRoles;
  $scope.volunteer = {username: '', email: '', password: '', passwordConfirm: ''};

  $scope.$watch('volunteer.password + volunteer.passwordConfirm', function() {
    $scope.passwordDoesNotMatch = $scope.volunteer.password !== $scope.volunteer.passwordConfirm;
  });

  $scope.signup = function () {
    Auth.signup({
        username: $scope.username,
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
}]);
