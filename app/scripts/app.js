'use strict';

/* global constants: false */
/* global $: false */

var app = angular.module('atadosApp',
    ['restangular', 'ui.router', 'ui.bootstrap', 'facebook', 'google-maps']);

angular.element(document).ready(function() {
  angular.bootstrap(document, ['atadosApp']);
});

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
    function ($stateProvider, $urlRouterProvider, $locationProvider) {

  $stateProvider
    .state('root', {
      url: '',
      abstract: true,
      templateUrl: '/views/root.html',
      controller: 'AppController'
    })
    .state('root.home', {
      url: '/'
    })
    .state('root.404', {
      url: '/404',
      templateUrl: '/views/404.html'
    })
    .state('root.volunteer', {
      url: '/voluntario/:username',
      templateUrl: '/views/volunteerProfile.html',
      controller: 'VolunteerController',
      resolve: { // TODO(mpomarole): Fix this resolve
        volunteer: function (Restangular, $stateParams) {
          Restangular.one('volunteers', $stateParams.slug).get().then(function(response) {
            //$scope.volunteer = response;
            //$scope.volunteer.id = $scope.volunteer.slug;
            //$scope.image = $scope.volunteer.image_url;
          }, function () {
            //$state.transisitonTo('root.home');
            //toastr.error('Voluntário não encontrado');
          });
        }
      }
    })
    .state('root.nonprofit', {
      url: '/ong/:slug',
      templateUrl: '/views/nonprofitProfile.html',
      controller: 'NonprofitController',
      resolve: {}
    })
    .state('root.nonprofitadmin', {
        url: '/admin',
        templateUrl: '/views/nonprofitAdminPanel.html',
        controller: 'NonprofitAdminController',
        resolve: {}
      })
    .state('root.nonprofitsignup', {
        url: '/cadastro/ong',
        templateUrl: '/views/nonprofitSignup.html',
        controller: 'NonprofitSignupController',
        resolve: {}
      })
    .state('root.project', {
        url: '/ato/:slug',
        templateUrl: '/views/projectPage.html',
        controller: 'ProjectController',
        resolve: {}
      })
    .state('root.newproject', {
        url: '/ato',
        templateUrl: '/views/projectNew.html',
        controller: 'ProjectNewController',
        resolve: {}
      })
    .state('root.newproject.job', {
        templateUrl: '/views/projectNewJob.html',
        resolve: {}
      })
    .state('root.newproject.work', {
        templateUrl: '/views/projectNewWork.html',
        resolve: {}
      })
    .state('root.newproject.donation', {
        templateUrl: '/views/projectNewDonation.html',
        resolve: {}
      });

    // $urlRouterProvider.when('/test', '/test1');
  $urlRouterProvider.otherwise('/404');

  $locationProvider.html5Mode(true).hashPrefix('!');
}]);

app.config(['$httpProvider', function ($httpProvider) {

  var securityInterceptor = ['$location', '$q', function($location, $q) {

    function success(response) { return response; }

    function error(response) {
      // This is when the user is not logged in
      if (response.status === 401) {
        return $q.reject(response);
      } else if (response.status === 403) {
        $.removeCookie(constants.accessTokenCookie);
        $.removeCookie(constants.csrfCookie);
        $.removeCookie(constants.sessionIdCookie);
        return $q.reject(response);
      }
      else {
        return $q.reject(response);
      }
    }

    return function(promise) {
      return promise.then(success, error);
    };
  }];

  $httpProvider.responseInterceptors.push(securityInterceptor);
}]);

app.config(['FacebookProvider', function(FacebookProvider) {
  FacebookProvider.init(constants.facebookClientId);
  FacebookProvider.setLocale(constants.locale);
  FacebookProvider.setCookie(false);
  window.facebook = FacebookProvider;
}]);

app.config(['RestangularProvider', function(RestangularProvider) {
  RestangularProvider.setBaseUrl(constants.apiServerAddress);
  RestangularProvider.setDefaultHttpFields({cache: true});
  RestangularProvider.setRequestSuffix('/.json');
  // This function is used to map the JSON data to something Restangular expects
  RestangularProvider.setResponseExtractor( function(response, operation) {
    if (operation === 'getList') {
      // Use results as the return type, and save the result metadata
      // in _resultmeta
      var newResponse = response.results;
      newResponse._resultmeta = {
        'count': response.count,
        'next': response.next,
        'previous': response.previous,
      };
      return newResponse;
    }
    return response;
  });
}]);
