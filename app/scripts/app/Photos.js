'use strict';

/* global toastr: false */
/* global constants: false */

var app = angular.module('atadosApp');

app.factory('Photos', ['$http', '$FB', function($http, $FB) {

  return {
    getFacebookPhoto: function (success, error) {
      $FB.getLoginStatus(function (response) {
        if (response.status === 'connected') {
          if (response.authResponse) {
            response.authResponse.getPhoto = true;
            $http.post(constants.api + 'facebook/', response.authResponse).success( function(response) {
              success(response.user.image_url);
            }).error(error);

          } else {
            toastr.error('Could not get facebook credentials');
            error();
          }
        }
      });
    },
    setVolunteerPhoto: function (file, success, error) {
      $http.post(constants.api + 'upload_volunteer_image/', file, {
          headers: {'Content-Type': undefined },
          transformRequest: angular.identity
        }).success(success).error(error);
    },
    setNonprofitProfilePhoto: function (file, success, error) {
      $http.post(constants.api + 'upload_nonprofit_profile_image/', file, {
        headers: {'Content-Type': undefined },
        transformRequest: angular.indenty
      }).success(success).error(error);
    },
    setNonprofitCoverPhoto: function (file, success, error) {
      $http.post(constants.api + 'upload_nonprofit_cover_image/', file, {
        headers: {'Content-Type': undefined },
        transformRequest: angular.indenty
      }).success(success).error(error);
    },
  };
}]);
