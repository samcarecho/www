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
    scope: {
      type: '=',
      size: '='
    },
    compile: function(element, attrs) {
      element.addClass('btn');
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

app.directive('projectbox', function() {
  return {
    restrict: 'E',
    scope: {},
    controller: 'ProjectBoxController',
    templateUrl: '/views/projectBox.html'
  };
});

app.directive('debug', function() {
  return {
    restrict: 'E',
    scope: {
      expression: '=val'
    },
    template: '<pre>{{debug(expression)}}</pre>',
    link: function(scope) {
      scope.debug = function(exp) {
        return angular.toJson(exp, true);
      };
    }
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

/*app.directive('address', function () {
  return {
    restrict: 'AE',
    scope: {
      addressline: '',
      addressnumber: '',
      complement: '',
      suburb: '',
      zipcode: '',
      city: '',
      state: '',
    },
    template: ''
  }
});*/

app.directive('contactatados', function() {
  return {
    restrict: 'E',
    scope: {},
    template: '<p>Entre em <a href="mailto:contato@atados.com.br?Subject=Ajuda%20Atados!" target="_blank">contato</a> se tiver algum problema!</p>'
  };
});
