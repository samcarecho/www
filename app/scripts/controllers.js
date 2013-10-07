'use strict';

var app = angular.module('atadosApp');

app.controller('MainController', function($scope, $translate, Site) {
  $scope.changeLanguage = function (langKey) {
    $translate.uses(langKey);
  };

  $scope.site = Site;
  $scope.userLoggedIn = false;

  $scope.user  = { name: "Marjori Pomarole", email: "marjoripomarole@gmail.com" };
});

app.controller('LoginController', function($scope, $rootScope, $location, Session) {
  $scope.user = {username: '', password: ''};

  $scope.login = function() {
    console.log("user: " + $scope.user.username + " pass: " + $scope.user.password);
  };
});

app.controller('MessagesController', function($scope, $rootScope, $location, Session) {
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
