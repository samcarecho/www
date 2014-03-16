'use strict';

/* global constants: false */
/* global toastr: false */

var app = angular.module('atadosApp');

app.factory('Volunteer', function($http, $state, Restangular, Cleanup) {
  return {
    // For now this is only to save the phone number of atar
    save: function (volunteer, success, error) {
      var volunteerCopy = {};
      angular.copy(volunteer, volunteerCopy);
      delete volunteerCopy.projects;
      delete volunteerCopy.nonprofits;
      delete volunteerCopy.address;
      delete volunteerCopy.skills;
      delete volunteerCopy.causes;
      delete volunteerCopy.user.address.city;
      $http.put(constants.api + 'volunteers/' + volunteerCopy.slug + '/.json', volunteerCopy)
        .success(success).error(error);
    },
    get: function(slug) {
      return Restangular.one('volunteers_public', slug).get().then(function(volunteer) {
        Cleanup.volunteer(volunteer);
        return volunteer;
      }, function() {
        $state.transitionTo('root.home');
        toastr.error('Voluntário não encontrado');
      });
    }
  };
});
