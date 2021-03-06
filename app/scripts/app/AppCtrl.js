'use strict';

/* global dataLayer: false */

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

  // Called from Footer links
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

  // Called from search bar on navbar
  $scope.siteSearch = function () {
    $state.transitionTo('root.explore');
    $scope.search.query = $scope.search.landingQuery;
    $scope.search.landingQuery = '';
    Search.filter(Search.query, Search.cause.id, Search.skill.id, Search.city.id);
  };

  $scope.openLogin = function(type) {
    
    $rootScope.modalInstance = $modal.open({
      templateUrl: '/partials/loginModal.html',
      controller: ['$scope', function ($scope) {
        if (type === 'volunteer') {
          dataLayer.push({
            'event': 'queroSerVoluntarioButtonClick',
            'eventCategory': 'buttonClicked',
            'eventAction' : 'success'
          });

          $scope.volunteerActive = true;
        } else if (type === 'nonprofit') {
          dataLayer.push({
            'event': 'souUmaOngButtonClick',
            'eventCategory': 'buttonClicked',
            'eventAction' : 'success'
          });

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
