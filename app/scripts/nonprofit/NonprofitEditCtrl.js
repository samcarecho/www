'use strict';

/* global toastr: false */

var app = angular.module('atadosApp');
app.controller('NonprofitEditCtrl', function($scope, $http, $state, $stateParams, $timeout,
      Restangular, Photos, Cleanup, api, VOLUNTEER, NONPROFIT, Nonprofit,$rootScope,$modal) {

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
    
  
    
    function openCrop(url,callback) {
        $rootScope.modalInstance = $modal.open({
          templateUrl: '/partials/cropImage.html',
          controller: ['$scope', function ($scope) {
            $scope.selected = function(cords) {
                $scope.cropped=true;
            };
            $scope.url = url;
            $scope.applyCrop = function(){
                var _image = $.find(".bootstrap-modal-cropper img")[0];
                $scope.cropImage = _image;
                var originalData = {};
                $(_image).cropper({
                    multiple: true,
                    data: originalData,
                    done: function(data) {
                        $scope.cropSettings = {
                            x:data.x,
                            y:data.y,
                            height:data.height,
                            width:data.width
                        };
                    },
                    maxWidth:347,
                    maxHeight:260,
                    resizable:false
                });
            };
            $scope.finishCrop = function(){
                callback($scope.cropSettings);
            }
          }]
        });
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
        
        var reader = new FileReader();
        reader.readAsDataURL(files[0]);
        reader.onload = function (e) {
            openCrop(e.target.result,function(cropSettings){
                var fd = new FormData();
                fd.append('file', files[0]);
                Photos.setNonprofitCoverPhoto(fd,cropSettings, function(response) {
                    $scope.nonprofit.cover_url = response.file;
                    toastr.success('Foto cover da ONG salva com sucesso.');
                }, function() {
                    toastr.error('Error no servidor. Não consigo atualizar sua foto :(');
                });  
            })
        }
    }
  };
});
