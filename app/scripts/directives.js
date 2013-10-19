'use strict';

var app = angular.module('atadosApp');

app.directive('login', function() {
  return {
    restrict: 'E',
    scope: {},
    controller: 'LoginController',
    templateUrl: '/views/login.html'
  };
});

app.directive('volunteersignup', function() {
  return {
    restrict: 'E',
    scope: {},
    controller: 'VolunteerSignupController',
    templateUrl: '/views/signupVolunteer.html'
  };
});

app.directive('nonprofitsignup', function() {
  return {
    restrict: 'E',
    scope: {},
    controller: 'NonprofitSignupController',
    templateUrl: '/views/signupNonprofit.html'
  };
});

app.directive('projectbox', function() {
  return {
    restrict: 'E',
    scope: {},
    controller: 'ProjectBoxController',
    templateUrl: '/views/projectBox.html'
  };
});

app.directive('debug', function() {
  return {
    restrict: 'E',
    scope: {
      expression: '=val'
    },
    template: '<pre>{{debug(expression)}}</pre>',
      link: function(scope) {
        // pretty-prints
        scope.debug = function(exp) {
          return angular.toJson(exp, true);
        };
      }
  }
});
