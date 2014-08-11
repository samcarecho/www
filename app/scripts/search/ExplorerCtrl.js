'use strict';

/* global google: false */
/* global OverlappingMarkerSpiderfier: false */
/* global $: false */

var constants = {
  map: null,
  markers: []
};

var app = angular.module('atadosApp');

app.controller('ExplorerCtrl', function ($scope, $rootScope, $filter, notselected, selected, defaultZoom) {

  $scope.site.title = 'Atados - Explore';
  $rootScope.explorerView = true;
  $scope.landing = false;

  $scope.$on('$destroy', function () {
    $rootScope.explorerView = false;
  });

  // TODO(marjoripomarole): Move this to directive Wed Feb  5 11:23:50 2014 
  function resizeExploreElements () {
    var newSize = window.innerHeight - $('.navbar-header').height() - 5;
    $('.atados-explorer').height(newSize - 40);
    $('.map-outer .map').height(newSize);
  }
  resizeExploreElements();
  $(window).resize(resizeExploreElements);
  $('.atados-explorer').scroll(function() {
    if($('.atados-explorer').scrollTop() >= $('#searchSpace').height() - $(window).height()) {
      $scope.getMore();
    }
  });

  $scope.mapOptions = {
    map : {
      center : new google.maps.LatLng(-23.5505199, -46.6333094), // São Paulo
      zoom : defaultZoom
    },
    marker : {
      clickable : true,
      draggable : false
    }
  };
  $scope.previousMarker = null;
  $scope.iw = new google.maps.InfoWindow();
  $scope.oms = null;

  $scope.$on('gmMarkersUpdated', function() {
    if (constants.map && !$scope.oms) {
      $scope.oms = new OverlappingMarkerSpiderfier(constants.map);
      $scope.oms.addListener('spiderfy', function() {
        $scope.iw.close();
      });
      $scope.oms.addListener('unspiderfy', function () {
        $scope.iw.close();
      });
      $scope.oms.addListener('click', $scope.selectMarker);
    }
    if ($scope.oms) {
      for (var m in constants.markers) {
        constants.markers[m].setIcon(notselected);
        constants.markers[m].setZIndex(1);
        $scope.oms.addMarker(constants.markers[m]);
      }
    }
  });

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

  // Called whenever a marker is selected or a card is moused over.
  $scope.selectMarker = function (marker, object) {
    if ($scope.previousMarker) {
      $scope.previousMarker.setIcon(notselected);
      angular.element(document.querySelector('#card-' + $scope.previousMarker.slug))
        .removeClass('hover');
      $scope.previousMarker.setZIndex(1);
      $scope.previousMarker = null;
      $('.map-outer').fadeTo('fast', 1);
      $scope.hasAddress = false;
    }
    
    if (object && !marker) {
      marker = constants.markers[object.slug];
    }

    if (marker) {
      var cardId = 'card-' + marker.slug;
      //$scope.iw.setContent(marker.title);
      //$scope.iw.open(constants.map, marker); // Also centers to the marker

      marker.setIcon(selected);
      angular.element(document.querySelector('#' + cardId))
        .addClass('hover');
      marker.setZIndex(100);
      $scope.previousMarker = marker;
      if (object.address.longitude === 0 || object.address.latitude === 0) {
        $('.map-outer').fadeTo('fast', 0.1);
        $scope.hasAddress = true;
      }
    }
  };

  $scope.getMarkerOpts = function (object) {
    var titleStr = '';
    if (object.user) {
      titleStr = '<div id="info-window"><h4><a href="/ong/' + object.slug + '">' + object.name + '</a></h4><p>' +
        $filter('as_location_string')(object.address) + '</p></div>';
    } else {
      titleStr = '<div id="info-window"><h4><a href="/ato/' + object.slug + '">' + object.name + '</a></h4><p>' +
        $filter('as_location_string')(object.address) + '</p></div>';
    }
    return {title: titleStr, slug: object.slug};
  };

});
