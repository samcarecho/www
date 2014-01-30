'use strict';

/* global toastr: false */
/* global constants: false */

var app = angular.module('atadosApp');

app.controller('VolunteerCtrl', function($scope, $state, $stateParams, Restangular) {

  if (!$stateParams.slug) {
    $state.transitionTo('root.home');
    toastr.error('Voluntário não encontrado');
  } else {

    $scope.site.title = 'Voluntário - ' + $stateParams.slug;

    var sanitizeProject = function (p) {
      p.causes.forEach(function (c) {
        c.image = constants.storage + 'cause_' + c.id + '.png';
        c.class = 'cause_' + c.id;
      });
      p.skills.forEach(function (s) {
        s.image = constants.storage + 'skill_' + s.id + '.png';
        s.class = 'skill_' + s.id;
      });
      p.nonprofit.image_url = 'https://atadosapp.s3.amazonaws.com/' + p.nonprofit.image;
      p.nonprofit.slug = p.nonprofit.user.slug;
    };
    var sanitizeNonprofit = function (n) {
      var causes = [];
      n.causes.forEach(function (c) {
        c = $scope.causes()[c];
        causes.push(c);
        c.image = constants.storage + 'cause_' + c.id + '.png';
        c.class = 'cause_' + c.id;
      });
      n.causes = causes;
      n.address = n.user.address;
    };

    var sanitizeVolunteer = function (v) {
      $scope.image = v.image_url;
      var causes = [];
      v.causes.forEach(function(c) {
        c = $scope.causes()[c];
        c.checked = true;
        causes.push(c);
      });
      v.causes = causes;
      var skills = [];
      v.skills.forEach(function(s) {
        s = $scope.skills()[s];
        skills.push(s);
      });
      v.skills = skills;
      v.projects.forEach(function(p) {
        sanitizeProject(p);
      });
      v.nonprofits.forEach(function(n) {
        sanitizeNonprofit(n);
      });
    };

    Restangular.one('volunteers_public', $stateParams.slug).get().then(function(response) {
      $scope.volunteer = response;
      sanitizeVolunteer($scope.volunteer);
    }, function() {
      $state.transitionTo('root.home');
      toastr.error('Voluntário não encontrado');
    });
  }
});
