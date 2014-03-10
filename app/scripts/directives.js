'use strict';

var app = angular.module('atadosApp');

app.directive('removerole', function() {
  return {
    restrict: 'E',
    template: '<button type="destroy" ng-click="removeRole(role, "work")"><i class="fa fa-trash-o"></i></button>'
  };
});

app.directive('button', function() {
  return {
    restrict: 'E',
    compile: function(element, attrs) {
      if ( attrs.type === 'submit') {
        element.addClass('btn-primary');
      } else if ( attrs.type === 'destroy' ) {
        element.addClass('destroy');
      } else if ( attrs.type ) {
        element.addClass('btn-' + attrs.type);
      }
      if ( attrs.size ) {
        element.addClass('btn-' + attrs.size);
      }
    }
  };
});

app.directive('button-facebook', function() {
  return {
    restrict: 'E'
  };
});

app.directive('projectCard', function() {
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: '/partials/projectCard.html'
  };
});
app.directive('depoimento', function() {
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: '/partials/depoimento.html'
  };
});


app.directive('atadosSearch', function() {
  return {
    restrict: 'E',
    templateUrl: '/partials/search.html',
    controller: 'SearchCtrl'
  };
});

app.directive('nonprofitCard', function() {
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: '/partials/nonprofitCard.html'
  };
});

app.directive('phone', function () {
  return {
    restrict: 'E',
    scope: {
      number: '@'
    },
    template: '<p><i class="fa fa-phone"></i> {{number}}</p>'
  };
});

app.directive('email', function () {
  return {
    restrict: 'E',
    scope: {
      email: '@'
    },
    template: '<p><i class="fa fa-laptop"></i> {{email}}</p>'
  };
});

app.directive('contactatados', function() {
  return {
    restrict: 'E',
    scope: {},
    template: '<p>Entre em contato clicando abaixo no canto direito se estiver tendo problemas.</p>'
  };
});

app.directive('doubtAtados', function() {
  return {
    restrict: 'E',
    scope: {},
    template: '<p>Entre em contato clicando abaixo no canto direito se estiver com dúvidas.</p>'
  };
});

app.directive('backgroundImg', function () {
  return function (scope, element, attrs) {
    var url = attrs.backgroundImg;
    element.css({
      'background-image': 'url(' + url + ')',
      'background-size': 'cover'
    });
  };
});
