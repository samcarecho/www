'use strict';

/* global toastr: false */
/* global $: false */

var app = angular.module('atadosApp');

app.controller('SearchCtrl', function ($scope, $http, $location, $anchorScroll, Search, $state, storage, defaultZoom, Cleanup) {

  $scope.search =  Search;

  var alreadySearchedProject = false;
  var alreadySearchedNonprofit = false;

  var typingTimer;
  var doneTyping = false;
  var doneTypingInterval = 1000;

  var search = function(value, old) {
    
    if (value !== old) {
      if ($scope.landing) {
        $state.transitionTo('root.explore');
      }
      alreadySearchedProject = false;
      alreadySearchedNonprofit = false;

      Search.filter(Search.query, Search.cause.id, Search.skill.id, Search.city.id);
      doneTyping = false;
    }
  };

  $scope.$watch('search.cause', function (value, old) {
    search(value, old);
  });
  $scope.$watch('search.skill', function (value, old) {
    search(value, old);
  });
  $scope.$watch('search.city', function (value, old) {
    search(value, old);
  });

  // on keyup, start the countdown
  $('#searchInput').keyup(function(){
    clearTimeout(typingTimer);
    typingTimer = setTimeout(setDoneTyping, doneTypingInterval);
  });

  // on keydown, clear the countdown 
  $('#searchInput').keydown(function(){
    clearTimeout(typingTimer);
  });

  // user is "finished typing," do something
  function setDoneTyping () {
    doneTyping = true;
    search($scope.search.query, '');
  }

  $scope.searchMoreProjectButtonText = 'Mostrar mais Atos';
  $scope.searchMoreNonprofitButtonText = 'Mostrar mais ONGs';
  $scope.searchMoreDisabled = false;
  
  $scope.getMore = function () {
    if ($scope.landing) {
      var vars = {
        showProjects: $scope.search.showProjects,
        city: $scope.search.city,
        cause: $scope.search.cause,
        skill: $scope.search.skill
      };
      $scope.$emit('landingToExplorer', vars);
    }
    if ($scope.search.showProjects) {
      $scope.searchMoreProjectButtonText = 'Buscando mais atos...';
      $scope.searchMoreDisabled = true;
      if ($scope.search.nextUrlProject()) {
        console.log($scope.search.nextUrlProject());
        $http.get($scope.search.nextUrlProject()).success( function (response) {
          response.results.forEach(function (project) {
            Cleanup.projectForSearch(project);
            $scope.search.projects().push(project);
            $scope.searchMoreProjectButtonText = 'Mostrar mais';
            $scope.searchMoreDisabled = false;
          });
          $scope.search.setNextUrlProject(response.next);
        }).error(function () {
          toastr.error('Erro ao buscar mais atos do servidor');
        });
      } else {
        if (!alreadySearchedProject) {
          toastr.error('Não conseguimos achar mais atos. Tente mudar os filtros.');
          alreadySearchedProject = true;
        }
      }
    } else {
      if ($scope.search.nextUrlNonprofit()) {
        $scope.searchMoreNonprofitButtonText = 'Buscando mais ONGs...';
        $scope.searchMoreDisabled = true;
        $http.get($scope.search.nextUrlNonprofit()).success( function (response) {
          response.results.forEach(function (nonprofit) {
            Cleanup.nonprofitForSearch(nonprofit);
            $scope.search.nonprofits().push(nonprofit);
            $scope.searchMoreNonprofitButtonText = 'Mostrar mais';
            $scope.searchMoreDisabled = false;
          });
          $scope.search.setNextUrlNonprofit(response.next);
        }).error(function () {
          toastr.error('Erro ao buscar mais ONGs do servidor');
        });
      } else {
        if (!alreadySearchedNonprofit) {
          toastr.error('Não conseguimos achar mais ONGs. Tente mudar os filtros.');
          alreadySearchedNonprofit = true;
        }
      }
    }
  };
});
