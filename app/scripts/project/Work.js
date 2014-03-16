'use strict';

/* global constants: false */

var app = angular.module('atadosApp');

app.factory('Work', function($http, $q) {
  return {
    get: function(id) {
      var deferred = $q.defer();
      $http.get(constants.api + 'works/'+ id + '/').success(function (work) {
        deferred.resolve(work);
      });
      return deferred.promise;
    }
  };
});
