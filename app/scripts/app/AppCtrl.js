'use strict';

var app = angular.module('atadosApp');

app.controller('AppCtrl', function($scope, $rootScope, $modal, $state, $location, $anchorScroll, Site, Search, storage) {
  
  $scope.site = Site;
  $scope.search = Search;
  $rootScope.modalInstance = null;
  $scope.storage = storage;
  $scope.causes = Site.causes;
  $scope.skills = Site.skills;
  $scope.cities = Site.cities;
  $scope.states = Site.states;
  $scope.numbers = Site.numbers;

  $scope.citySearch = function (city) {
    $scope.cities().forEach(function (c) {
      if (c.name === city) {
        $scope.search.city = c;
        $location.hash('top');
        $anchorScroll();
        return;
      }
    });
  };

  $scope.siteSearch = function () {
    $state.transitionTo('root.explore');
    $scope.search.query = $scope.search.landingQuery;
    $scope.search.landingQuery = '';
    Search.filter(Search.query, Search.cause.id, Search.skill.id, Search.city.id);
  };

  function conversionQueroSerVoluntario() {
    console.log('converseion quero ser voluntario');
    /* <![CDATA[ */
goog_snippet_vars = function() {
var w = window;
w.google_conversion_id = 971695909;
w.google_conversion_label = "rFkyCMPopgoQpc6rzwM";
w.google_remarketing_only = false;
}
// DO NOT CHANGE THE CODE BELOW.
goog_report_conversion = function(url) {
goog_snippet_vars();
window.google_conversion_format = "3";
window.google_is_call = true;
var opt = new Object();
opt.onload_callback = function() {
if (typeof(url) != 'undefined') {
window.location = url;
}
}
var conv_handler = window['google_trackConversion'];
if (typeof(conv_handler) == 'function') {
conv_handler(opt);
}
}
/* ]]> */  }

  $scope.openLogin = function(type) {

    $rootScope.modalInstance = $modal.open({
      templateUrl: '/partials/loginModal.html',
      controller: ['$scope', function ($scope) {
        if (type === 'volunteer') {
          $scope.volunteerActive = true;
          conversionQueroSerVoluntario();
        } else if (type === 'nonprofit') {
          $scope.volunteerActive = false;
        } else {
          $scope.volunteerActive = true;
        }
      }]
    });
  };

  $scope.openTermsModal = function() {
    $rootScope.modalInstance = $modal.open({
      templateUrl: '/partials/termsModal.html'
    });
  };

  $rootScope.closeNonprofitLoginModal = function () {
    $rootScope.modalInstance.close();
  };
});
