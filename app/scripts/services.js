'use strict';

/* global constants: false */
/* global $: false */

var app = angular.module('atadosApp');

app.factory('Cookies', function($q, $timeout){
  return {
    get: function(name){
      var deferred = $q.defer();

      $timeout(function() {
        deferred.resolve($.cookie(name));
      }, 0);

      return deferred.promise;
    },

    getAll: function(){
      return $.cookie();
    },

    set: function(name, value, config){
      return $.cookie(name, value, config);
    },

    delete: function(name){
      return $.removeCookie(name);
    }
  };
});

app.factory('Site', function() {
  return {
    name : 'Atados - Juntando Gente Boa',
    title: 'Atados - Juntando Gente Boa',
    copyright: '',
    termsOfService: '',
    privacy: '',
    team: [{
      name: 'Marjori Pomarole',
      email: 'marjori@atados.com.br',
      photo: 'URL here',
      description: 'Hi I am the programmer',
      facebook: 'marjoripomarole'
    }]
  };
});

app.factory('Photos', ['$http', function($http) {
  
  var apiUrl = constants.apiServerAddress;

  return {
    setVolunteerPhoto: function (file, success, error) {
      $http.post(apiUrl + 'upload_volunteer_image/', file, {
          headers: {'Content-Type': undefined },
          transformRequest: angular.identity
        }).success(success).error(error);
    }
  };
}]);
 
app.factory('Auth', ['$http', 'Cookies', function($http, Cookies) {
  
  function setAuthHeader(accessToken) {
    if (accessToken) {
      $http.defaults.headers.common.Authorization = 'Bearer ' + accessToken;
    }
  }

  var apiUrl = constants.apiServerAddress;
  var currentUser;

  return {
    facebookLogin: function (facebookAuthData, success, error) {
      $http.post(apiUrl + 'facebook/', facebookAuthData).success( function(response) {
        setAuthHeader(response.access_token);
        Cookies.set(constants.accessTokenCookie, response.access_token);
        success(response.user);
      }).error(error);
    },
    resetPassword: function (email, success, error) {
      $http.post(apiUrl + 'password_reset/', {email: email})
        .success( function(){
          success();
        }).error(error);
    },
    // Both email and password field need to be set on data object
    changePassword: function (data, success, error) {
      console.log(data);
      $http.put(apiUrl + 'change_password/', data)
        .success( function() {
          success();
        }).error(error);
    },
    isUsernameUsed: function (username, success, error) {
      $http.get(apiUrl + 'check_username/?username=' + username)
        .success(function (response) {success(response);}).error(error);
    },
    isEmailUsed: function (email, success, error) {
      if (email) {
        $http.get(apiUrl + 'check_email/?email=' + email)
          .success(function (response) {success(response);}).error(error);
      }
    },
    isSlugUsed: function (slug, success, error) {
      if (slug) {
        $http.get(apiUrl + 'check_slug/?slug=' + slug)
          .success(function (response) {success(response);}).error(error);
      }
    },
    getCurrentUser: function (success, error) {
      Cookies.get(constants.accessTokenCookie).then(function(value) {
        var token = value;
        if (token) {
          setAuthHeader(token);
          $http.get(apiUrl + 'current_user/?id=' + new Date().getTime())
          .success(function (response) {
            currentUser = response;
            success(currentUser);
          }).error(function (response) {
            error(response);
          });
        }
      });
    },
    isLoggedIn: function() {
      return currentUser ? true : false;
    },
    volunteerSignup: function(volunteer, success, error) {
      $http.post(apiUrl + 'create/volunteer/', volunteer).success( function() {
        success();
      }).error(error);
    },
    nonprofitSignup: function(nonprofit, success, error) {
      $http.post(apiUrl + 'create/nonprofit/', nonprofit).success( function() {
        success();
      }).error(error);
    },
    login: function(user, success, error) {
      user.client_id = constants.clientId;
      user.client_secret = constants.clientSecret;
      user.grant_type = constants.grantType;
      $http({
        method: 'POST',
        url: apiUrl + 'oauth2/access_token/',
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
    },
    logout: function() {
      $http.post(apiUrl + 'logout/');
      currentUser = null;
      Cookies.delete(constants.accessTokenCookie);
      delete $http.defaults.headers.common.Authorization;
    },
    user: currentUser
  };
}]);
