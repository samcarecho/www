'use strict';

/* global toastr: false */
/* global constants: false */

var app = angular.module('atadosApp');

app.factory('Nonprofit', function(Restangular, $state, $stateParams) {
  return {
    get: function (slug) {
      return Restangular.one('nonprofit', slug).get().then(function(response) {
        var nonprofit = response;
        if (!nonprofit.published) {
          $state.transitionTo('root.home');
          toastr.error('ONG ainda não foi aprovada. Se isso é um erro entre em contato por favor.');
        }
        if (nonprofit.projects) {
          nonprofit.projects.forEach(function (p) {
            p.causes.forEach( function (c) {
              c.image = constants.storage + 'cause_' + c.id + '.png';
              c.class = 'cause_' + c.id;
            });
            p.skills.forEach(function (s) {
              s.image = constants.storage + 'skill_' + s.id + '.png';
              s.class = 'skill_' + s.id;
            });
            p.nonprofit.slug = p.nonprofit.user.slug;
            p.nonprofit.image_url = 'https://atadosapp.s3.amazonaws.com/' + p.nonprofit.image;
          });
        }
        return nonprofit;
      }, function() {
        $state.transitionTo('root.home');
        toastr.error('ONG não existe.', $stateParams.slug);
      });
    }
  };
});
