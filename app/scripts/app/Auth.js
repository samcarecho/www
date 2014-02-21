'use strict';

/* global constants: false */
/* global $: false */

var app = angular.module('atadosApp');

app.factory('Auth', function($http, Cookies, Cleanup) {
  
  function setAuthHeader(accessToken) {
    if (accessToken) {
      $http.defaults.headers.common.Authorization = 'Bearer ' + accessToken;
    }
  }

  return {
    facebookAuth: function (facebookAuthData, success, error) {
      $http.post(constants.api + 'facebook/', facebookAuthData).success( function(response) {
        setAuthHeader(response.access_token);
        Cookies.set(constants.accessTokenCookie, response.access_token);
        success(response.user);
      }).error(error);
    },
    getCurrentUser: function () {
      var token = Cookies.get(constants.accessTokenCookie);
      if (token) {
        setAuthHeader(token);
        return $http.get(constants.api + 'current_user/?id=' + new Date().getTime())
          .then(function (response) {
            Cleanup.currentUser(response.data);
            return response.data;
          });
      }
    },
    resetPassword: function (email, success, error) {
      $http.post(constants.api + 'password_reset/', {email: email})
        .success( function(){
          success();
        }).error(error);
    },
    // Both email and password field need to be set on data object
    changePassword: function (data, success, error) {
      $http.put(constants.api + 'change_password/', data)
        .success( function() {
          success();
        }).error(error);
    },
    isEmailUsed: function (email, success) {
      if (email) {
        $http.get(constants.api + 'check_email/?email=' + email + '?id=' + new Date().getTime())
          .success(success);
      }
    },
    isSlugUsed: function (slug, success) {
      $http.get(constants.api + 'check_slug/?slug=' + slug)
        .success(success);
    },
    volunteerSignup: function(volunteer, success, error) {
      $http.post(constants.api + 'create/volunteer/', volunteer).success( function() {
        success();
      }).error(error);
    },
    nonprofitSignup: function(data, success, error) {
      $http.post(constants.api + 'create/nonprofit/', data, {
        headers: {'Content-Type': undefined },
        transformRequest: angular.identity
      }).success( function() {
        success();
      }).error(error);
    },
    login: function(user, success, error) {
      user.grant_type = constants.grantType;
      $http.get(constants.authApi)
        .success(function (response) {
          user.client_id = response.id;
          user.client_secret = response.secret;
          $http({
            method: 'POST',
            url: constants.api + 'oauth2/access_token/',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: $.param(user)
          }).success( function(response){
              setAuthHeader(response.access_token);
              if (user.remember) {
                Cookies.set(constants.accessTokenCookie, response.access_token, { expires: 30, path: '/' });
              } else {
                Cookies.set(constants.accessTokenCookie, response.access_token);
              }
              success(response);
            }).error(error);
        });
    },
    logout: function() {
      $http.post(constants.api + 'logout/');
      Cookies.delete(constants.accessTokenCookie);
      delete $http.defaults.headers.common.Authorization;
    }
  };
});
