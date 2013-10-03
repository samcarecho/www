'use strict';

var app = angular.module('atados');

app.controller('MainCtrl', function ($scope) {
  $scope.awesomeThings = [
  ];
});

app.controller('TranslateCtrl', ['$translate', '$scope', function ($translate, $scope) {
  $scope.changeLanguage = function (langKey) {
    $translate.uses(langKey);
  };
}]);
