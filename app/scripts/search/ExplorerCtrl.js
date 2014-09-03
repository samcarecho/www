'use strict';

/* global google: false */
/* global OverlappingMarkerSpiderfier: false */
/* global $: false */

var constants = {
  map: null,
  markers: []
};

var app = angular.module('atadosApp');

app.controller('ExplorerCtrl', function ($scope, $rootScope, $filter, Search,
      notselected, selected, defaultZoom, saoPaulo, curitiba, brasilia, distancia) {

  $scope.site.title = 'Atados - Explore';
  $rootScope.explorerView = true;
  $scope.landing = false;

  $scope.$on('$destroy', function () {
    $rootScope.explorerView = false;
  });

  function resizeExploreElements () {
    var newSize = window.innerHeight - $('.navbar-header').height() - 5;
    $('.atados-explorer').height(newSize - 40);
    $('.map-outer .map').height(newSize);
  }
  resizeExploreElements();
  $(window).resize(resizeExploreElements);

  // Getting more cards when scrolling to the bottom of the page
  $('.atados-explorer').scroll(function() {
    if($('.atados-explorer').scrollTop() >= $('#searchSpace').height() - $(window).height()) {
      $scope.getMore();
    }
  });

  $scope.$watch('search.city', function (city) {
    $scope.mapOptions.map.zoom = defaultZoom;
    if (city.id === saoPaulo.id) {
      $scope.mapOptions.map.center = new google.maps.LatLng(saoPaulo.lat, saoPaulo.lng);
    } else if (city.id === curitiba.id) {
      $scope.mapOptions.map.center = new google.maps.LatLng(curitiba.lat, curitiba.lng);
    } else if (city.id === brasilia.id) {
      $scope.mapOptions.map.center = new google.maps.LatLng(brasilia.lat, brasilia.lng);
    } else if (city.id === distancia.id) {
      $scope.mapOptions.map.center = null;
      $scope.mapOptions.map.zoom = 1;
    }
  });

  $scope.objects = Search.mapProjects();
  Search.showProjects = true;
  $scope.mapOptions = {
    map : {
      center : new google.maps.LatLng(saoPaulo.lat, saoPaulo.lng),
      zoom : defaultZoom
    },
    marker : {
      clickable : true,
      draggable : false
    }
  };
  $scope.previousMarker = null;
  $scope.previousSlug = null;
  $scope.iw = new google.maps.InfoWindow();
  $scope.oms = null;

  function addMarkersToOms() {
      for (var m in constants.markers) {
        constants.markers[m].setIcon(notselected);
        constants.markers[m].setZIndex(1);
        if ($scope.oms) {
          $scope.oms.addMarker(constants.markers[m]);
        }
      }
  }

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
    addMarkersToOms();
  });

  $scope.$watch('search.projects()', function () {
    if (Search.showProjects) {
      $scope.objects = Search.mapProjects();
    }
  });

  $scope.$watch('search.nonprofits()', function () {
    if (!Search.showProjects) {
      $scope.objects = Search.mapNonprofits();
    }
  });
  
  $scope.$watch('search.showProjects', function () {
    if (Search.showProjects) {
      $scope.objects = Search.mapProjects();
    } else {
      $scope.objects = Search.mapNonprofits();
    }
  });

  // Called whenever a marker is selected or a card is moused over.
  $scope.selectMarker = function (marker, object) {
    $scope.iw.close();
    $scope.hasAddress = false;
    $scope.distanceAddress = false;
    $('.map').css('opacity', 1);
    angular.element(document.querySelector('#card-' + $scope.previousSlug))
        .removeClass('hover');

    if ($scope.previousMarker) {
      $scope.previousMarker.setIcon(notselected);
      $scope.previousMarker.setZIndex(1);
      $scope.previousMarker = null;
    }
    
    if (object && !marker) {
      marker = constants.markers[object.slug];
    }

    $scope.previousSlug = object.slug;
    var cardId = 'card-' + object.slug;
    angular.element(document.querySelector('#' + cardId))
        .addClass('hover');

    if (marker) {
      $scope.iw.setContent(marker.title);
      $scope.iw.open(constants.map, marker); // Also centers map to the marker.
      marker.setIcon(selected);
      marker.setZIndex(100);
      $scope.previousMarker = marker;
    } else { // No marker
      if (object.address.city.id === distancia.id) { // Trabalho a distancia
        $scope.distanceAddress = true;
        $('.map').css('opacity', 0.1);
      } else if (object.address && (object.address.longitude === 0 || object.address.latitude === 0)) { // No address
        $scope.hasAddress = true;
        $('.map').css('opacity', 0.1);
      }
    }
  };

  $scope.getMarkerOpts = function (object) {
    var titleStr = '';
    if (!Search.showProjects) {
      titleStr = '<div id="info-window"><h4><a href="/ong/' + object.slug + '">' + object.name + '</a></h4><p>' +
        $filter('as_location_string')(object.address) + '</p></div>';
    } else {
      titleStr = '<div id="info-window"><h4><a href="/ato/' + object.slug + '">' + object.name + '</a></h4><p>' +
        $filter('as_location_string')(object.address) + '</p></div>';
    }
    return {title: titleStr, slug: object.slug};
  };

});
