'use strict';

/* global toastr: false */

var app = angular.module('atadosApp');

app.controller('VolunteerSignupCtrl',
    ['$scope', '$rootScope', 'Auth', function($scope, $rootScope, Auth) {

  $scope.$watch('slug', function (value) {
    if (value) {
      if (value.indexOf(' ') >= 0) {
        $scope.signupForm.slug.$invalid = true;
        $scope.signupForm.slug.hasSpace = true;
        $scope.signupForm.slug.alreadyUsed = false;
      } else {
        $scope.signupForm.slug.hasSpace = false;
        $scope.signupForm.slug.$invalid = false;
        Auth.isSlugUsed(value, function () {
          $scope.signupForm.slug.alreadyUsed = false;
          $scope.signupForm.slug.$invalid = false;
        }, function () {
          $scope.signupForm.slug.alreadyUsed = true;
          $scope.signupForm.slug.$invalid = true;
        });
      }
    } else {
      $scope.signupForm.slug.alreadyUsed = false;
      $scope.signupForm.slug.hasSpace = false;
      $scope.signupForm.slug.$invalid = false;
    }
  });

  $scope.$watch('email', function (value) {
    if (value) {
      Auth.isEmailUsed(value, function () {
        $scope.signupForm.email.alreadyUsed = false;
      }, function () {
        $scope.signupForm.email.alreadyUsed = true;
      });
    } else {
      $scope.signupForm.email.alreadyUsed = false;
    }
  });

  $scope.$watch('password + passwordConfirm', function() {
    $scope.passwordDoesNotMatch = $scope.password !== $scope.passwordConfirm;
  });

  $scope.signup = function () {
    if ($scope.signupForm.$valid) {
      Auth.volunteerSignup({
          slug: $scope.slug,
          email: $scope.email,
          password: $scope.password
        },
        function () {
          Auth.login({
            username: $scope.email,
            password: $scope.password,
            remember: $scope.remember
          }, function () {
            Auth.getCurrentUser().then(
              function (user) {
                $rootScope.$emit('userLoggedIn', user);
              }, function (error) {
                toastr.error(error);
              });
          }, function () {
            $scope.error = 'Usuário ou senha estão errados :(';
          });
        },
        function (error) {
          toastr.error(error.detail);
        });
    }
  };
}]);
