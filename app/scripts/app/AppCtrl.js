'use strict';

/* global constants: false */

var app = angular.module('atadosApp');

app.controller('AppCtrl', function($scope, $rootScope, $modal, $state, $location, $anchorScroll, Site, Auth, Search) {
  
  $scope.site = Site;
  $scope.search = Search;
  $rootScope.modalInstance = null;
  $scope.storage = constants.storage;
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
  };

  $scope.openVolunteerModal = function() {
    $rootScope.modalInstance = $modal.open({
      templateUrl: '/views/volunteerModal.html'
    });
  };
  $scope.openNonprofitModal = function () {
    $rootScope.modalInstance = $modal.open({
      templateUrl: '/views/nonprofitModal.html'
    });
  };
  $scope.openTermsModal = function() {
    $rootScope.modalInstance = $modal.open({
      templateUrl: '/views/termsModal.html',
      windowClass: 'width: 1000px;'
    });
  };

  $rootScope.closeNonprofitLoginModal = function () {
    $rootScope.modalInstance.close();
  };
});
