'use strict';

var app = angular.module('atadosApp');

app.directive('login', function() {
  return {
    restrict: 'E',
    scope: {},
    controller: 'LoginController',
    templateUrl: 'views/login.html'
  };
});

app.directive('volunteersignup', function() {
  return {
    restrict: 'E',
    scope: {},
    controller: 'VolunteerSignupController',
    templateUrl: 'views/signup-volunteer.html'
  };
});

app.directive('nonprofitsignup', function() {
  return {
    restrict: 'E',
    scope: {},
    controller: 'NonprofitSignupController',
    templateUrl: 'views/signup-nonprofit.html'
  };
});

app.directive('projectbox', function() {
  return {
    restrict: 'E',
    scope: {},
    controller: 'ProjectBoxController',
    templateUrl: 'views/projectBox.html'
  };
});
