'use strict';

/* global toastr: false */

var app = angular.module('atadosApp');

app.factory('Nonprofit', function(Restangular, $state, $stateParams, Cleanup) {
  return {
    get: function (slug) {
      return Restangular.one('nonprofit', slug).get().then(function(nonprofit) {
        if (!nonprofit.published) {
          $state.transitionTo('root.home');
          toastr.error('ONG ainda não foi aprovada. Se isso é um erro entre em contato por favor.');
        } else {
          Cleanup.nonprofit(nonprofit);
          return nonprofit;
        }
      }, function() {
        $state.transitionTo('root.home');
        toastr.error('ONG não existe.', $stateParams.slug);
      });
    }
  };
});
