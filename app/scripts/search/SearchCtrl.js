'use strict';

/* global toastr: false */
/* global constants: false */

var app = angular.module('atadosApp');

app.controller('SearchCtrl', function ($scope, $http, $location, $anchorScroll, Search) {

  $scope.search =  Search;
  $scope.map = constants.map;

  if (Search.nonprofits().length === 0 && Search.projects().length === 0) {
    Search.filter();
  }

  $scope.$watch('search.city', function (city) {
    $scope.zoom = constants.defaultZoom;
    if (city.name === 'Sao Paulo') {
      $scope.center = constants.saoPauloCenter;
    } else if (city.name === 'Curitiba') {
      $scope.center = constants.curitibaCenter;
    } else if (city.name === 'Brasilia') {
      $scope.center = constants.brasiliaCenter;
    } else if (city.id === 0) {
      $scope.center = null;
      $scope.zoom  = 1;
    }
  });

  var search = function(value, old) {
    if (value !== old) {
      $scope.search.filter(Search.query, Search.cause.id, Search.skill.id, Search.city.id);
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
  $scope.$watch('search.query', function (value, old) {
    console.log(value + ' ' + old);
    search(value, old);
  });

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
      if ($scope.search.nextUrlProject()) {
        $http.get($scope.search.nextUrlProject()).success( function (response) {
          response.results.forEach(function (project) {
            project.causes.forEach(function (c) {
              c.image = constants.storage + 'cause_' + c.id + '.png';
              c.class = 'cause_' + c.id;
            });
            $scope.search.projects().push(project);
          });
          $scope.search.setNextUrlProject(response.next);
        }).error(function () {
          toastr.error('Erro ao buscar mais atos do servidor');
        });
      } else {
        toastr.error('Não conseguimos achar mais atos. Tente mudar os filtros.');
      }
    } else {
      if ($scope.search.nextUrlNonprofit()) {
        $http.get($scope.search.nextUrlNonprofit()).success( function (response) {
          response.results.forEach(function (nonprofit) {
            nonprofit.address = nonprofit.user.address;
            var causes = [];
            nonprofit.causes.forEach(function (c) {
              var cause = {};
              cause.image = constants.storage + 'cause_' + c + '.png';
              cause.class = 'cause_' + c;
              causes.push(cause);
            });
            nonprofit.causes = causes;
            $scope.search.nonprofits().push(nonprofit);
          });
          $scope.search.setNextUrlNonprofit(response.next);
        }).error(function () {
          toastr.error('Erro ao buscar mais ONGs do servidor');
        });
      } else {
        toastr.error('Não conseguimos achar mais ONGs. Tente mudar os filtros.');
      }
    }
  };
});
