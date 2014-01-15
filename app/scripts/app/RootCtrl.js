'use strict';

/* global toastr: false */
/* global constants: false */

var app = angular.module('atadosApp');

app.controller('RootCtrl', function ($scope, $rootScope, $state, Auth) {
  $scope.getLoggedUser = Auth.getUser;

  $scope.$watch('getLoggedUser()', function (value) {
    $scope.loggedUser = value;
    if ($rootScope.modalInstance) {
      $rootScope.modalInstance.close();
    }
    if ($scope.loggedUser && $scope.loggedUser.role === constants.NONPROFIT) {
      $scope.loggedUser.address = $scope.loggedUser.user.address;
      $scope.loggedUser.causes.forEach(function (c) {
        c.image = constants.storage + 'cause_' + c.id + '.png';
      });
      $scope.loggedUser.projects.forEach(function (p) {
        p.causes.forEach(function (c) {
          c.image = constants.storage + 'cause_' + c.id + '.png';
        });
      });
      $state.transitionTo('root.nonprofitadmin');
    }
  });

  $rootScope.$on('userLoggedIn', function(event, user) {
    if (user) {
      if ($rootScope.modalInstance) {
        $rootScope.modalInstance.close();
      }
      $scope.loggedUser = user;
      if ($scope.loggedUser.role === constants.NONPROFIT) {
        $state.transitionTo('root.nonprofitadmin');
      } else if ($scope.loggedUser.role === constants.VOLUNTEER) {}
      else {
        toastr.error('Usuário desconhecido acabou de logar.');
        // TODO(mpomarole): proper handle this case and disconect the user. Send email to administrador.
      }
      toastr.success('Oi! Bom te ver por aqui :)', $scope.loggedUser.slug);
      $state.transitionTo('root.explore');
    }
  });

  $scope.logout = function () {
    toastr.success('Tchau até a próxima :)', $scope.loggedUser.slug);
    Auth.logout();
    $scope.loggedUser = null;
  };
});