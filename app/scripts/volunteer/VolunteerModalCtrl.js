'use strict';

/* global toastr: false */

var app = angular.module('atadosApp');

app.controller('VolunteerModalCtrl', function($scope, $rootScope, $FB, Auth) {

  $scope.loginActive = true;
  $scope.$watch('loginActive', function (value) {
    if (value) {
      $scope.facebookState = 'Entrar ';
    } else {
      $scope.facebookState = 'Criar conta ';
    }
  });

  $scope.switchLoginActive = function () {
    $scope.loginActive = !$scope.loginActive;
  };

  function sendFacebookCredentials(authResponse) {
    Auth.facebookAuth(authResponse,
      function (user) {
        $rootScope.$emit('userLoggedIn', user);
      }, function () {
        toastr.error('Houve um error no servidor tentando logar com sua conta no Facebook.');
      });
  }

  $scope.facebookAuth = function () {
    $FB.getLoginStatus(function (response) {
      if (response.status !== 'connected') {
        $FB.login(function(loginResponse) {
          if (loginResponse.status === 'connected') {
            sendFacebookCredentials(loginResponse.authResponse);
          } else if (response.status === 'not_authorized') {
            // Here now user needs to authorize the app to be used with Facebook
          }
        }, {scope: 'email'});
        // });
      } else {
        if (response.authResponse) {
          sendFacebookCredentials(response.authResponse);
        } else {
          toastr.error('Could not get facebook credentials');
        }
      }
    });
  };
});
