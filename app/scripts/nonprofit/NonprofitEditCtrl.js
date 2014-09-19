'use strict';

/* global toastr: false */

var app = angular.module('atadosApp');

app.controller('NonprofitEditCtrl', function($scope, $http, $state, $stateParams, $timeout,
      Restangular, Photos, Cleanup, api, VOLUNTEER, NONPROFIT, Nonprofit) {

  $scope.$watch('loggedUser', function (user) {

    if (!user) {
      $state.transitionTo('root.home');
      toastr.error('Nenhum usuário logado.');
      return;
    }

    if (user.role === VOLUNTEER) {
      if (user.user.is_staff) {
        Nonprofit.get($stateParams.slug).then(function(nonprofit) {
          $scope.nonprofit = nonprofit;
          Cleanup.currentUser($scope.nonprofit);
          Cleanup.nonprofitForEdit($scope.nonprofit);
        });
      } else {
        $state.transitionTo('root.home');
        toastr.error('Apenas ONGs tem acesso ao Painel de Controle');
      }
    } else if (user.role === NONPROFIT) {
      $scope.nonprofit = $scope.loggedUser;
      Cleanup.nonprofitForEdit($scope.nonprofit);
    }
  });

  $scope.$watch('password + passwordConfirm', function() {
    $scope.nonprofitForm.password.doesNotMatch = $scope.password !== $scope.passwordConfirm;
    $scope.nonprofitForm.password.$invalid = $scope.nonprofitForm.password.doesNotMatch;
  });

  $scope.save = function(nonprofit) {
    Nonprofit.save(nonprofit);

    if ($scope.password && $scope.password === $scope.passwordConfirm) {
      Nonprofit.savePassword(nonprofit.user.email, $scope.password, nonprofit.user.slug);
    }
  };

  $scope.uploadProfileFile = function(files) {
    if (files) {
      var fd = new FormData();
      fd.append('file', files[0]);
      Photos.setNonprofitProfilePhoto(fd, function(response) {
        $scope.nonprofit.image_url = response.file;
        toastr.success('Logo da ONG salva com sucesso.');
      }, function() {
        toastr.error('Error no servidor. Não consigo atualizar sua foto :(');
      });
    }
  };
  $scope.uploadCoverFile = function(files) {
    if (files) {
      var fd = new FormData();
      fd.append('file', files[0]);
      Photos.setNonprofitCoverPhoto(fd, function(response) {
        $scope.nonprofit.cover_url = response.file;
        toastr.success('Foto cover da ONG salva com sucesso.');
      }, function() {
        toastr.error('Error no servidor. Não consigo atualizar sua foto :(');
      });
    }
  };
});
