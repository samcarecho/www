'use strict';

var app = angular.module('atadosApp');

app.factory('Site', function() {
  return {
    name : "Atados - Juntando gente Boa",
    copyright: "",
    termsOfService: "",
    privacy: "",
    team: [{ name: "Marjori Pomarole", email: "marjori@atados.com.br", photo: "URL here", description: "Hi I am the programmer", facebook: "marjoripomarole"}]
  };
});

app.factory('Session', function($resource) {
    return $resource('/api/sessions');
});

app.factory('Volunteer', function() {
  return {message: "Im'a data from a service"};
});

app.factory('Nonprofit', function() {
  return {message: "Im'a data from a service"};
});

app.factory('Cause', function() {
  return {message: "Im'a data from a service"};
});

app.directive("Nonprofit", function() {
  return {
    restrict: "E",
    scope: {},
    template: '<div></div>'
  };
});

app.controller('MainController', function($scope, $translate, Site) {
  $scope.site = Site;
  $scope.changeLanguage = function (langKey) {
    $translate.uses(langKey);
  };
});

app.controller('LoginController', function($scope, $rootScope, $location, Session) {
  $scope.user = {username: '', password: ''};

  $scope.login = function() {
    console.log("pressed login button");
    /*$scope.user = Session.save($scope.user, function(success) {
      $rootScope.loggedIn = true;
      $location.path('/');
    }, function(error) {
      $scope.loginError = true;
    });*/
  };
});

app.controller('LogoutController', function($scope, $rootScope, $location, Session) {
});

app.controller('NonprofitController', function($scope, $rootScope, $location, Session) {
});




function SearchNavController ($scope) {
}

function AuthController ($scope) {
  $scope.user = { name: "Marjori" };
}

function CauseController($scope) {
  $scope.input = "Hello";
}

function CauseEditController($scope) {
  $scope.input = "Hello";
}

function CauseListController($scope) {

}

function CauseViewController($scope) {

}

function VolunteerController($scope) {

}

function VolunteerEditController($scope) {

}

function VolunteerListController($scope) {

}

function VolunteerViewController($scope) {

}

function NonprofitController($scope) {

}

function NonprofitEditController($scope) {

}

function NonprofitListController($scope) {

}

function NonprofitViewController($scope) {

}

// TODO
// create directive for Nonprofit, ato and volunteer,
// create service for seesion, nonprofit, user, volunteer, ato information
