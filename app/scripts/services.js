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

app.factory('Session', function($resource) {
    return $resource('/api/sessions');
});

app.factory('Volunteer', function() {
  return {message: "Im'a data from a service"};
});

app.factory('Nonprofit', function() {
  return {message: "Im'a data from a service"};
});

app.factory('Cause', function() {
  return {message: "Im'a data from a service"};
});
