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

app.factory('Auth', function($http, $cookieStore){

  var accessLevels = routingConfig.accessLevels;
  var userRoles = routingConfig.userRoles;
  var currentUser = $cookieStore.get('user') || { username: '', role: userRoles.public };

  var apiUrl = "http://localhost:8000";

  $cookieStore.remove('user');

  function changeUser(user) {
    _.extend(currentUser, user);
  };

  return {
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
      $http.post(apiUrl + '/signup', user).success(function(res) {
        changeUser(res);
        success();
      }).error(error);
    },
    login: function(user, success, error) {
      console.log("login for user ");
      console.log(user);
      $http.post(apiUrl + '/login', user).success(function(user){
        changeUser(user);
        success(user);
      }).error(error);
    },
    logout: function(success, error) {
      $http.post(apiUrl + '/logout').success(function(){
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
