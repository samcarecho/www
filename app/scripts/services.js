'use strict';

var app = angular.module('atadosApp');

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
      facebook: 'marjoripomarole'}]
  };
});

app.factory('Photos', function($http) {
  
  var apiUrl = constants.apiServerAddress;

  return {
    setVolunteerPhoto: function (file, success, error) {
      $http.post(apiUrl + 'upload_volunteer_image/', file, {
          headers: {'Content-Type': undefined },
          transformRequest: angular.identity
      }).success(success).error(error);
    }
  }
});
 
app.factory('Auth', function($http) {
  
  function setAuthHeader(accessToken) {
    if (accessToken) {
       $http.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
    }
  }

  var apiUrl = constants.apiServerAddress;
  var currentUser;

  return {
    facebookLogin: function (facebookAuthData, success, error) {
      $http.post(apiUrl + 'facebook/', facebookAuthData).success( function(response) {
        setAuthHeader(response.access_token);
         $.cookie(constants.accessTokenCookie, response.access_token);
         success(response.user);
      }).error(error);
    },
    resetPassword: function (email, success, error) {
      $http.post(apiUrl + 'password_reset/', {email: email})
        .success( function(response){
           success();
        }).error(error);
    },
    // Both email and password field need to be set on data object
    changePassword: function (data, success, error) {
      console.log(data);
      $http.put(apiUrl + 'change_password/', data)
        .success( function(response) {
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
     var token = $.cookie(constants.accessTokenCookie);

     if (token) {
       setAuthHeader(token);
       $http.get(apiUrl + 'current_user/')
        .success(function (response) {
          currentUser = response;
          success(currentUser);
        }).error(function (response) {
          error(response);
        });
      }
    },
    isLoggedIn: function(user) {
      return currentUser ? true : false;
    },
    volunteerSignup: function(volunteer, success, error) {
      $http.post(apiUrl + 'create/volunteer/', volunteer).success( function(response) {
        success();
      }).error(error);
    },
    nonprofitSignup: function(nonprofit, success, error) {
      $http.post(apiUrl + 'create/nonprofit/', nonprofit).success( function(response) {
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
           $.cookie(constants.accessTokenCookie, response.access_token, { expires: 30, path: '/' });
         } else {
           $.cookie(constants.accessTokenCookie, response.access_token);
         }
         success(response);
      }).error(error);
     },
    logout: function() {
      $http.post(apiUrl + 'logout/');
      currentUser = null;
      $.removeCookie(constants.accessTokenCookie);
      delete $http.defaults.headers.common['Authorization'];
    },
    user: currentUser
  };
});
