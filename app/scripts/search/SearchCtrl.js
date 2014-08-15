'use strict';

/* global toastr: false */
/* global $: false */

var app = angular.module('atadosApp');

app.controller('SearchCtrl', function ($scope, $http, $location, $anchorScroll,
      Search, $state, storage, defaultZoom, Cleanup) {

  var alreadySearchedProject = false;
  var alreadySearchedNonprofit = false;

  var typingTimer;
  var doneTyping = false;
  var doneTypingInterval = 1000;
  var oldQuery = '';

  var search = function(value, old) {
    console.log(value);
    console.log(old);
    
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

  $('#searchInput').keyup(function(){
    clearTimeout(typingTimer);
    typingTimer = setTimeout(setDoneTyping, doneTypingInterval);
  });
  $('#searchInput').keydown(function(){
    clearTimeout(typingTimer);
  });
  // user is "finished typing," do something
  function setDoneTyping () {
    doneTyping = true;
    search(Search.query, oldQuery);
    oldQuery = Search.query;
  }

  $scope.searchMoreProjectButtonText = 'Mostrar mais Atos';
  $scope.searchMoreNonprofitButtonText = 'Mostrar mais ONGs';
  $scope.searchMoreDisabled = false;
  
  // TODO: Clean up and refactor this.
  $scope.getMore = function () {
    if ($scope.landing) {
      var vars = {
        showProjects: Search.showProjects,
        city: Search.city,
        cause: Search.cause,
        skill: Search.skill
      };
      $scope.$emit('landingToExplorer', vars);
    }
    if (Search.showProjects) {
      $scope.searchMoreProjectButtonText = 'Buscando mais atos...';
      $scope.searchMoreDisabled = true;
      if (Search.nextUrlProject()) {
        $http.get(Search.nextUrlProject()).success( function (response) {
          response.results.forEach(function (project) {
            Cleanup.projectForSearch(project);
            Search.projects().push(project);
            $scope.searchMoreProjectButtonText = 'Mostrar mais';
            $scope.searchMoreDisabled = false;
          });
          Search.setNextUrlProject(response.next);
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
      if (Search.nextUrlNonprofit()) {
        $scope.searchMoreNonprofitButtonText = 'Buscando mais ONGs...';
        $scope.searchMoreDisabled = true;
        $http.get(Search.nextUrlNonprofit()).success( function (response) {
          response.results.forEach(function (nonprofit) {
            Cleanup.nonprofitForSearch(nonprofit);
            Search.nonprofits().push(nonprofit);
            $scope.searchMoreNonprofitButtonText = 'Mostrar mais';
            $scope.searchMoreDisabled = false;
          });
          Search.setNextUrlNonprofit(response.next);
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
