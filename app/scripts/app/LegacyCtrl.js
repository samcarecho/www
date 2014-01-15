'use strict';

/* global toastr: false */
/* global constants: false */

var app = angular.module('atadosApp');

app.controller('LegacyCtrl', function ($scope, $stateParams, $state, $http, Legacy) {

  if ($stateParams.nonprofitUid) {
    Legacy.nonprofit($stateParams.nonprofitUid, function (response) {
      var slug = response.slug;
      $state.transitionTo('root.nonprofit', {slug: slug});
    }, function () {
      $state.transitionTo('root.home');
      toastr.error('Essa ong não existe');
    });
  } else if ($stateParams.projectUid) {
    Legacy.project($stateParams.projectUid, function (response) {
      var slug = response.slug;
      $state.transitionTo('root.project', {slug: slug});
    }, function () {
      $state.transitionTo('root.home');
      toastr.error('Este ato não existe');
    });
  } else if ($stateParams.slug) {
    Legacy.users($stateParams.slug, function (response) {
      if (response.type === constants.VOLUNTEER) {
        $state.transitionTo('root.volunteer', {slug: $stateParams.slug});
      } else if (response.type === constants.NONPROFIT) {
        $state.go('root.nonprofit', {slug: $stateParams.slug});
      }
    }, function () {
      toastr.error('Não existe;');
    });
  }
});

toastr.options.closeButton = true;
toastr.options.hideEasing = 'linear';
