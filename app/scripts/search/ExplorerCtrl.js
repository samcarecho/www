'use strict';

/* global google: false */
/* global constants: false */
/* global OverlappingMarkerSpiderfier: false */

var app = angular.module('atadosApp');

app.controller('ExplorerCtrl', function ($scope, $filter) {

  $scope.site.title = 'Atados - Explore';
  $scope.landing = false;
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
    for (var m in $scope.markers) {
      $scope.markers[m].setIcon(constants.notselected);
      $scope.oms.addMarker($scope.markers[m]);
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
    return angular.extend(
      // TODO: add link to nonprofit or project page here
      { title: '<h4>' + object.name  + '</h4><p>' + $filter('as_location_string')(object.address) + '</p>'},
      { slug: object.slug}
    );
  };
});


