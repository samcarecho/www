'use strict';

var app = angular.module('atadosApp');

app.factory('Site', function() {
  return {
    name : 'Atados - Juntando gente Boa',
    copyright: '',
    termsOfService: '',
    privacy: '',
    team: [{ name: 'Marjori Pomarole', email: 'marjori@atados.com.br', photo: 'URL here', description: 'Hi I am the programmer', facebook: 'marjoripomarole'}]
  };
});

app.factory('Auth', function($http) {

  var apiUrl = constants.apiServerAddress;
  var currentUser;

  return {
    facebookLogin: function (facebookAuthData, success, error) {
      $http.post(apiUrl + 'facebook/', facebookAuthData)
        .success( function(response){
           console.log(response);
           success();
        }).error(error);

      // Get access token and send it to Django to login the user and then call currentUser
    },
    resetPassword: function (email, success, error) {
      console.log("reseting " + email);
      $http.post(apiUrl + 'password_reset/', {email: email})
        .success( function(response){
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
    getCurrentUser: function (success, error) {
     if (currentUser) return currentUser;

     var token = $.cookie('access_token');

     if (token) {
       $http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
       
       $http.get(apiUrl + 'current_user/')
        .success(function (response) {
          currentUser = response;
          success(currentUser);
        }).error(error);
      }
    },
    isLoggedIn: function(user) {
      return currentUser ? true : false;
    },
    signup: function(user, success, error) {
      $http.put(apiUrl + 'create/volunteer/', user).success( function(response) {
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
         $http.defaults.headers.common['Authorization'] = 'Bearer ' + response.access_token;
         if (user.remember) {
           $.cookie('access_token', response.access_token);
         }
         success();
      }).error(error);
     },
    logout: function() {
      delete $http.defaults.headers.common['Authorization'];
      $.removeCookie('access_token');
      currentUser = null;
      $http.post(apiUrl + 'logout/');
    },
    user: currentUser
  };
});
