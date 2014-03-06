'use strict';

/* global constants: false */
/* global $: false */

var app = angular.module('atadosApp',
    ['restangular', 'ui.router', 'ui.bootstrap', 'AngularGM', 'ezfb']);

app.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {

  $stateProvider
    .state('root', {
      url: '',
      abstract: true,
      templateUrl: '/partials/root.html',
      controller: 'RootCtrl',
      resolve: {
        loggedUser: ['Auth', function (Auth) {
          return Auth.getCurrentUser();
        }],
      }
    })
    .state('root.home', {
      url: '/',
      templateUrl: '/partials/home.html',
      controller: 'HomeCtrl'
    })
    .state('root.about', {
      url: '/sobre',
      templateUrl: '/partials/about.html',
      controller: 'AboutCtrl'
    })
    .state('root.404', {
      url: '/ops',
      templateUrl: '/partials/404.html'
    })
    .state('root.explore', {
      url: '/explore',
      templateUrl: '/partials/explore.html',
      controller: 'ExplorerCtrl'
    })
    .state('root.volunteer', {
      url: '/voluntario/:slug',
      templateUrl: '/partials/volunteerProfile.html',
      controller: 'VolunteerCtrl',
      resolve: {
        volunteer: ['Volunteer', '$stateParams', function (Volunteer, $stateParams) {
          return Volunteer.get($stateParams.slug);
        }]
      }
    })
    .state('root.volunteeredit', {
      url: '/editar',
      templateUrl: '/partials/volunteerEdit.html',
      controller: 'VolunteerEditCtrl'
    })
    .state('root.nonprofit', {
      url: '/ong/:slug',
      templateUrl: '/partials/nonprofitProfile.html',
      controller: 'NonprofitCtrl',
      resolve: {
        nonprofit: ['Nonprofit', '$stateParams', function (Nonprofit, $stateParams) {
          return Nonprofit.get($stateParams.slug);
        }]
      }
    })
    .state('root.nonprofitadmin', {
      url: '/controle/:slug',
      templateUrl: '/partials/nonprofitAdminPanel.html',
      controller: 'NonprofitAdminCtrl'
    })
    .state('root.nonprofitsignup', {
        url: '/cadastro/ong',
        templateUrl: '/partials/nonprofitSignup.html',
        controller: 'NonprofitSignupCtrl',
        resolve: {}
      })
    .state('root.project', {
        url: '/ato/:slug',
        templateUrl: '/partials/projectPage.html',
        controller: 'ProjectCtrl',
        resolve: {
          project: ['Project', '$stateParams', function (Project, $stateParams) {
            return Project.get($stateParams.slug);
          }]
        }
      })
    .state('root.newproject', {
        url: '/cadastro/ato',
        templateUrl: '/partials/projectNew.html',
        controller: 'ProjectNewCtrl'
      })
    .state('root.editproject', {
        url: '/editar/ato/:slug',
        templateUrl: '/partials/projectEdit.html',
        controller: 'ProjectEditCtrl'
      })
    .state('legacynonprofit', {
        url: '/site/instituicoes/:nonprofitUid/profile',
        controller: 'LegacyCtrl'
      })
      .state('legacyVolunteerOrNonprofit', {
        url: '/site/users/:slug',
        controller: 'LegacyCtrl'
      })
     .state('legacyproject', {
        url: '/site/ato/:projectUid',
        controller: 'LegacyCtrl'
      });

  $urlRouterProvider.otherwise('/ops');
  $locationProvider.html5Mode(true).hashPrefix('!');
});

app.config(function ($httpProvider) {

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
});

app.config(function($FBProvider) {
  $FBProvider.setLocale(constants.locale);
  $FBProvider.setInitParams({
    appId: constants.facebookClientId
  });
});

app.config(function(RestangularProvider) {
  RestangularProvider.setBaseUrl(constants.api);
  RestangularProvider.setDefaultHttpFields({cache: true});
  RestangularProvider.setRequestSuffix('/?format=json');
  RestangularProvider.setRestangularFields({
    id: 'slug'
  });
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
});
