'use strict';

var app = angular.module('atadosApp');

app.factory('Site', function() {
  return {
    name : "Atados - Juntando gente Boa",
  copyright: "",
  termsOfService: "",
  privacy: "",
  team: [{ name: "Marjori Pomarole", email: "marjori@atados.com.br", photo: "URL here", description: "Hi I am the programmer", facebook: "marjoripomarole"}]
  };
});

app.factory('Auth', function($http, $resource, $cookieStore) {

  var apiUrl = constants.apiServerAddress;
  var accessLevels = routingConfig.accessLevels;
  var userRoles = routingConfig.userRoles;
  var currentUser = $cookieStore.get('user') || { username: '', role: userRoles.public };

  $cookieStore.remove('user');

  function changeUser(user) {
    _.extend(currentUser, user);
  };

  return {
    isUsernameUsed: function (username, success, error) {
      $http.get(apiUrl + "check-username/?username=" + username)
        .success(function (response) {success(response);}).error(error);
    },
    isEmailUsed: function (email, success, error) {
      $http.get(apiUrl + "check-email/?email=" + email)
        .success(function (response) {success(response);}).error(error);
    },
    authorize: function(accessLevel, role) {
       if (role === undefined) {
         role = currentUser.role;
       }

      return accessLevel.bitMask & role.bitMask;
    },
    isLoggedIn: function(user) {
      if (user === undefined) {
        user = currentUser;
      }
      return user.role.title == userRoles.user.title || user.role.title == userRoles.admin.title;
    },
    signup: function(user, success, error) {
      console.log("signup for user " + user);
      $http.post(apiUrl + 'signup/', user).success( function(res) {
        changeUser(res);
        success();
      }).error(error);
    },
    login: function(user, success, error) {
        console.log(user);
        $http.post(apiUrl + 'api-token-auth/', user)
         .success( function(response){
           $http.defaults.headers.common['Authorization'] = 'Token ' + response.token;
            success();
         }).error(error);

       /*$http.post(apiUrl + 'api-token-auth/', user)
         .success( function(response){
           $http.defaults.headers.common['Authorization'] = 'Token ' + response.token;
           $http.get(apiUrl + 'current-user/')
            .success(function (response) {
              changeUser(response);
              if (user.remember) {
                $cookieStore.put('user', currentUser);
              }
              success();
            }).error("Current user could not be found.");
         }).error(error);*/
     },
    logout: function(success, error, redirectTo) {
      $http.post(apiUrl + 'logout/').success(function(){
        changeUser({
          username: '',
        role: userRoles.public
        });
        success();
      }).error(error);
    },
    accessLevels: accessLevels,
    userRoles: userRoles,
    user: currentUser
  };
});
