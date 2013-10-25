'use strict';

var app = angular.module('atadosApp');

app.directive('volunteerlogin', function() {
  return {
    restrict: 'E',
    scope: {},
    controller: 'LoginController',
    templateUrl: '/views/volunteerLogin.html'
  };
});

app.directive('nonprofitlogin', function() {
  return {
    restrict: 'E',
    scope: {},
    controller: 'LoginController',
    templateUrl: '/views/nonprofitLogin.html'
  };
});


app.directive('volunteersignup', function() {
  return {
    restrict: 'E',
    scope: {},
    controller: 'VolunteerSignupController',
    templateUrl: '/views/volunteerSignup.html'
  };
});

app.directive('nonprofitsignup', function() {
  return {
    restrict: 'E',
    scope: {},
    controller: 'NonprofitSignupController',
    templateUrl: '/views/nonprofitSignup.html'
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
      scope.debug = function(exp) {
        return angular.toJson(exp, true);
      };
    }
  };
});

app.directive('phone', function () {
  return {
    restrict: 'E',
    scope: {
      number: '@'
    },
    template: '<div><i class="icon-phone-sign"></i> {{number}}</div>'
  };
});

app.directive('email', function () {
  return {
    restrict: 'E',
    scope: {
      email: '@'
    },
    template: '<div><i class="icon-laptop"></i> {{email}}</div>'
  };
});

/*app.directive('address', function () {
  return {
    restrict: 'AE',
    scope: {
      addressline: '',
      addressnumber: '',
      complement: '',
      suburb: '',
      zipcode: '',
      city: '',
      state: '',
    },
    template: ''
  }
});*/
