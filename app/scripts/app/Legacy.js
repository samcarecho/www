'use strict';

/* global constants: false */

var app = angular.module('atadosApp');

app.factory('Legacy', function($http) {

  return {
    nonprofit: function (uid, success, error) {
      $http.get(constants.api + 'legacy_to_slug/nonprofit/?uid=' + uid).success(success).error(error);
    },
    project: function (uid, success, error) {
      $http.get(constants.api + 'legacy_to_slug/project/?uid=' + uid).success(success).error(error);
    },
    users: function (slug, success, error) {
      $http.get(constants.api + 'slug_role/?slug=' + slug).success(success).error(error);
    }
  };
});
