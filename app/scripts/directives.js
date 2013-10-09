'use strict';

var app = angular.module('atadosApp');

app.directive("login", function() {
  return {
    restrict: "E",
    scope: {},
    controller: 'LoginController',
    templateUrl: 'views/login.html'
  };
});

app.directive("volunteersignup", function() {
  return {
    restrict: "E",
    scope: {},
    controller: 'VolunteerSignupController',
    templateUrl: 'views/signup-volunteer.html'
  };
});

app.directive("nonprofitsignup", function() {
  return {
    restrict: "E",
    scope: {},
    controller: 'NonprofitSignupController',
    templateUrl: 'views/signup-nonprofit.html'
  };
});


// TODO
/*app.directive('ensureUnique', ['$http', function($http) {
  return {
    require: 'ngModel',
    link: function(scope, ele, attrs, c) {
      scope.$watch(attrs.ngModel, function() {
        $http({
          method: 'POST',
          url: '/api/check/' + attrs.ensureUnique,
          data: {'field': attrs.ensureUnique}
        }).success(function(data, status, headers, cfg) {
          c.$setValidity('unique', data.isUnique);
        }).error(function(data, status, headers, cfg) {
          c.$setValidity('unique', false);
        });
      });
    }
  }
}]);*/
