'use strict';

/* global constants: false */
/* global $: false */

var app = angular.module('atadosApp',
    ['restangular', 'ui.router', 'ui.bootstrap', 'facebook', 'google-maps', 'AngularGM']);

angular.element(document).ready(function() {
  angular.bootstrap(document, ['atadosApp']);
});

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {

  $stateProvider
    .state('root', {
      url: '',
      abstract: true,
      templateUrl: '/views/root.html',
      controller: 'RootCtrl'
    })
    .state('root.home', {
      url: '/',
      templateUrl: '/views/home.html',
      controller: 'HomeCtrl'
    })
    .state('root.about', {
      url: '/sobre',
      templateUrl: '/views/about.html',
      controller: 'AboutCtrl'
    })
    .state('root.404', {
      url: '/404',
      templateUrl: '/views/404.html'
    })
    .state('root.explore', {
      url: '/explore',
      templateUrl: '/views/explore.html',
      controller: 'ExplorerCtrl'
    })
    .state('root.volunteer', {
      url: '/voluntario/:slug',
      templateUrl: '/views/volunteerProfile.html',
      controller: 'VolunteerCtrl',
      resolve: { // TODO(mpomarole): Fix this resolve
        volunteer: function (Restangular, $stateParams) {
          Restangular.one('volunteers', $stateParams.slug).get().then(function(response) {
            console.log('response ' + response);
          }, function (error) {
            console.log('error ' + error);
          });
        }
      }
    })
    .state('root.nonprofit', {
      url: '/ong/:slug',
      templateUrl: '/views/nonprofitProfile.html',
      controller: 'NonprofitCtrl',
      resolve: {}
    })
    .state('root.nonprofitadmin', {
        url: '/controle',
        templateUrl: '/views/nonprofitAdminPanel.html',
        controller: 'NonprofitAdminCtrl',
        resolve: {
        }
      })
    .state('root.nonprofitsignup', {
        url: '/cadastro/ong',
        templateUrl: '/views/nonprofitSignup.html',
        controller: 'NonprofitSignupCtrl',
        resolve: {}
      })
    .state('root.project', {
        url: '/ato/:slug',
        templateUrl: '/views/projectPage.html',
        controller: 'ProjectCtrl',
        resolve: {}
      })
    .state('root.newproject', {
        url: '/ato',
        templateUrl: '/views/projectNew.html',
        controller: 'ProjectNewCtrl',
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
  // $urlRouterProvider.otherwise('/404');
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
  RestangularProvider.setBaseUrl(constants.api);
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
