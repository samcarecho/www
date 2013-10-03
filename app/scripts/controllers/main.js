'use strict';

var app = angular.module('atadosApp');

app.controller('MainController', function ($scope) {
  $scope.awesomeThings = [
  ];
});

function TranslateController ($translate, $scope) {
  $scope.changeLanguage = function (langKey) {
    $translate.uses(langKey);
  };
}

function SearchNavController ($scope) {
  $scope.search = function () {
    console.log("Trying to search for " + $scope.input);
  };

  console.log("Trying to search for " + $scope.input);
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
