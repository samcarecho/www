'use strict';

/* global google: false */
/* global constants: false */
/* global OverlappingMarkerSpiderfier: false */
/* global $: false */

var app = angular.module('atadosApp');

app.controller('ExplorerCtrl', function ($scope, $rootScope, $filter) {

  $rootScope.explorerView = true;
  $scope.site.title = 'Atados - Explore';
  $scope.landing = false;

  function resizeExploreElements () {
    var newSize = window.innerHeight - $('.navbar-header').height() - 5;
    $('.atados-explorer').height(newSize - 40);
    $('.map-outer .map').height(newSize);

    console.log('newSize: ' + newSize);
    console.log('navbar-colapse: ' + $('.navbar-header').height());
    console.log('#atados-explorer-outer: ' + $('#atados-explorer-outer').height());
    console.log('.atados-explorer: ' + $('.atados-explorer').height());
    console.log('Inner height: ' + window.innerHeight);
  }
  resizeExploreElements();

  $(window).resize(function() {
    resizeExploreElements();
  });

  $('.atados-explorer').scroll(function() {
    if($('.atados-explorer').scrollTop() >= $('#searchSpace').height() - $(window).height()) {
      $scope.getMore();
    }
  });


  if ($scope.search.showProjects) {
    $scope.objects = $scope.search.projects();
  } else {
    $scope.objects = $scope.search.nonprofits();
  }
  $scope.previousMarker = null;
  $scope.iw = new google.maps.InfoWindow();
  $scope.oms = null;
  $scope.markers = constants.markers;

  $scope.$on('gmMarkersUpdated', function() {
    if ($scope.map && !$scope.oms) {
      $scope.oms = new OverlappingMarkerSpiderfier($scope.map);
      $scope.oms.addListener('spiderfy', function() {
        $scope.iw.close();
      });
      $scope.oms.addListener('unspiderfy', function () {
        $scope.iw.close();
      });
      $scope.oms.addListener('click', $scope.selectMarker);
    }
    if ($scope.oms) {
      for (var m in $scope.markers) {
        $scope.markers[m].setIcon(constants.notselected);
        $scope.oms.addMarker($scope.markers[m]);
      }
    }
  });

  $scope.mapOptions = {
    map : {
      center : constants.saoPauloCenter,
      zoom : constants.defaultZoom,
    },
    marker : {
      clickable : true,
      draggable : false
    }
  };

  $scope.$watch('search.projects()', function () {
    if ($scope.search.showProjects) {
      $scope.objects = $scope.search.projects();
    }
  });

  $scope.$watch('search.nonprofits()', function () {
    if (!$scope.search.showProjects) {
      $scope.objects = $scope.search.nonprofits();
    }
  });
  
  $scope.$watch('search.showProjects', function () {
    if ($scope.search.showProjects) {
      $scope.objects = $scope.search.projects();
    } else {
      $scope.objects = $scope.search.nonprofits();
    }
  });

  $scope.removeMarker = function (marker, object) {
    angular.element(document.querySelector('#card-' + object.slug))
      .removeClass('hover');
  };

  $scope.selectMarker = function (marker, object) {
    if ($scope.previousMarker) {
      $scope.previousMarker.setIcon(constants.notselected);
      angular.element(document.querySelector('#card-' + $scope.previousMarker.slug))
        .removeClass('hover');
      $scope.previousMarker.setZIndex(1);
      $scope.previousMarker = null;
    }
    
    if (object && !marker) {
      marker = $scope.markers[object.slug];
    }
    if (marker) {
      var cardId = 'card-' + marker.slug;
      $scope.iw.setContent(marker.title);
      $scope.iw.open(constants.map, marker);

      marker.setIcon(constants.selected);
      angular.element(document.querySelector('#' + cardId))
        .addClass('hover');
      marker.setZIndex(100);
      $scope.previousMarker = marker;
      constants.map.setCenter(marker.getPosition());
    }
  };

  $scope.getMarkerOpts = function (object) {
    var titleStr = '';
    if (object.user) {
      titleStr = '<div id="info-window"><h4><a href="/ong/' + object.slug + '">' + object.name  + '</a></h4><p>' + $filter('as_location_string')(object.address) + '</p></div>';
    } else {
      titleStr = '<div id="info-window"><h4><a href="/ato/' + object.slug + '">' + object.name  + '</a></h4><p>' + $filter('as_location_string')(object.address) + '</p></div>';
    }
    return angular.extend(
      {title: titleStr},
      {slug: object.slug}
    );
  };
});
