'use strict';

/* global constants: false */

var app = angular.module('atadosApp');

app.factory('Job', ['$http', '$q', function($http, $q) {
  return {
    get: function(id) {
      var deferred = $q.defer();
      $http.get(constants.api + 'jobs/'+ id + '/').success(function (job) {
        deferred.resolve(job);
      });
      return deferred.promise;
    }
  };
}]);
