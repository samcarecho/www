'use strict';

var app = angular.module('atadosApp');

app.controller('AppController', function($scope, $translate, Site) {
  $scope.changeLanguage = function (langKey) {
    $translate.uses(langKey);
  };

  $scope.site = Site;
  $scope.userLoggedIn = false;

  $scope.user  = { name: "Marjori Pomarole", email: "marjoripomarole@gmail.com" };
});

app.controller('LoginController', function($scope, $rootScope, $location) {
  $scope.user = {username: '', password: ''};

  $scope.login = function() {
    toastr.clear();
    // 1. Check valid username
    var username = $scope.user.username;
    if (username === '') {
      toastr.error("Falta o nome do usuario!");
    } else if (username.length < 5) {
      toastr.error("Nome do usuário tem que ter mais de 5 caracteres");
    }
    // 2. Check for password
    var password = $scope.user.password;
    if (password === '') {
      toastr.error("Falta a senha!");
    } else if (password.length < 8) {
      toastr.error("Senha tem que ter mais de 8 caracteres");
    }
  };

  $scope.$watch('user.username', function (newValue, oldValue, scope) {
    toastr.clear();
    console.log(scope);
    if (newValue.length < 5) {
      toastr.error("Nome do usuário tem que ter mais de 5 caracteres");
    }
  });
});

app.controller('SignupController', function($scope, $rootScope, $location) {

});


app.controller('MessagesController', function($scope, $rootScope, $location) {
  $scope.message = "";

  if ($scope.message !== "") {
    $scope.hasMessages = true;
  }
});

// TODO
// create directive for Nonprofit, ato and volunteer,
// create service for seesion, nonprofit, user, volunteer, ato information
//
//
