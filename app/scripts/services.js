'use strict';

/* global constants: false */
/* global $: false */

var app = angular.module('atadosApp');

app.factory('Cookies', function($q, $timeout){
  return {
    get: function(name){
      var deferred = $q.defer();

      $timeout(function() {
        deferred.resolve($.cookie(name));
      }, 0);

      return deferred.promise;
    },

    getAll: function(){
      return $.cookie();
    },

    set: function(name, value, config){
      return $.cookie(name, value, config);
    },

    delete: function(name){
      return $.removeCookie(name);
    }
  };
});

app.factory('Site', function(Restangular, $http) {
  var _causes = [];
  var _skills = [];
  var _cities = [];
  var _states = [];
  var _numbers = {};
  var apiUrl = constants.api;

  var getNumbers = function () {
    $http.get(apiUrl + 'numbers/')
      .success(function (response) {
        if ( !response.projects ) {
          response.projects = 0;
        } else if ( !response.volunteers ) {
          response.volunteers = 0;
        } else if ( !response.nonprofits) {
          response.nonprofits = 0;
        }

        _numbers = response;
      });
  };


  var getCauses = function () {
    Restangular.all('causes').getList({page_size: constants.static_page_size}).then( function(response) {
      _causes = response;
      _causes.forEach(function (c) {
        c.image = constants.storage + 'cause_' + c.id + '.png';
        c.class = 'cause_' + c.id;
      });
      _causes.splice(0, 0, {name: 'Todas Causas', id: '', class: 'cause_0'});
    }, function () {
      console.error('Não consegui pegar as causas do servidor.');
    });
  };
  var getSkills = function () {
    Restangular.all('skills').getList({page_size: constants.static_page_size}).then( function(response) {
      _skills = response;
      _skills.splice(0, 0, {name: 'Todas Habilidades', id: ''});
    }, function () {
      console.error('Não consegui pegar as habilidades do servidor.');
    });
  };
  var getCities = function () {
    Restangular.all('cities').getList({page_size: constants.static_page_size}).then( function(response) {
      _cities = response;
      _cities.splice(0, 0, {name: 'Todas Cidades', id: '', active: true});
      window.cities = _cities;
    }, function () {
      console.error('Não consegui pegar as cidades do servidor.');
    });
  };
  var getStates = function () {
    Restangular.all('states').getList({page_size: constants.static_page_size}).then( function(response) {
      _states = response;
      window.states = _states;
    }, function () {
      console.error('Não consegui pegar os estados do servidor.');
    });
  };

  getCauses();
  getSkills();
  getCities();
  getStates();
  getNumbers();

  return {
    name : 'Atados - Juntando Gente Boa',
    title: 'Atados - Juntando Gente Boa',
    contactEmail: 'contato@atados.com.br',
    copyright: 'Atados, ' + (new Date()).getFullYear(),
    termsOfService: function () {
    },
    privacy: function () {
    },
    team: [{
      name: 'Marjori Pomarole',
      email: 'marjori@atados.com.br',
      photo: 'URL here',
      description: 'Hi I am the programmer',
      facebook: 'marjoripomarole'
    }],
    causes: function () {
      return _causes;
    },
    skills: function () {
      return _skills;
    },
    cities: function () {
      return _cities;
    },
    states: function () {
      return _states;
    },
    numbers: function () {
      return _numbers;
    }
  };
});

app.factory('Search', function (Restangular) {
  var _query = '';
  var _cause = {};
  var _skill = {};
  var _city = {};
  
  var _projects = [];
  var _nonprofits = [];

  var _nextUrlProject = '';
  var _nextUrlNonprofit = '';

  var fixProject = function (response) {
    response.forEach(sanitizeProject);
    if (response._resultmeta) {
      _nextUrlProject = response._resultmeta.next;
    } else {
      _nextUrlProject = '';
    }
  };

  var fixNonprofit = function (response) {
    response.forEach(sanitizeNonprofit);
    if (response._resultmeta) {
      _nextUrlNonprofit = response._resultmeta.next;
    } else {
      _nextUrlNonprofit = '';
    }
  };

  var sanitizeProject = function (p) {
    p.causes.forEach(function (c) {
      c.image = constants.storage + 'cause_' + c.id + '.png';
      c.class = 'cause_' + c.id;
    });
    _projects.push(p);
    p.nonprofit.image_url = 'http://atadosapp.s3.amazonaws.com/' + p.nonprofit.image;
    p.nonprofit.slug = p.nonprofit.user.slug;
  };

  var sanitizeNonprofit = function (n) {
    n.address = n.user.address;
    _nonprofits.push(n);
  };

  function searchProjects(query, cause, skill, city, pageSize) {
    pageSize = typeof pageSize !== 'undefined' ? pageSize : constants.page_size;
    var urlHeaders = {
      page_size: pageSize,
      query: query,
      cause: cause,
      skill: skill,
      city: city
    };
    Restangular.all('projects').getList(urlHeaders).then( function(response) {
      fixProject(response);
    }, function () {
      console.error('Não consegui pegar os atos do servidor.');
    });
  }

  var searchNonprofits = function (query, cause, city) {
    var urlHeaders = {
      page_size: 20,
      query: query,
      cause: cause,
      city: city
    };
    Restangular.all('nonprofits').getList(urlHeaders).then( function (response) {
      fixNonprofit(response);
    });
  };

  searchProjects();
  searchNonprofits();

  return {
    filter: function (query, cause, skill, city) {
      _projects = [];
      _nonprofits = [];
      searchProjects(query, cause, skill, city);
      searchNonprofits(query, cause, city);
    },
    query: _query,
    cause: _cause,
    skill: _skill,
    city: _city,
    showProjects: true,
    nextUrlProject: function () {
      return _nextUrlProject;
    },
    nextUrlNonprofit: function () {
      return _nextUrlNonprofit;
    },
    setNextUrlProject: function (url) {
      _nextUrlProject = url;
    },
    setNextUrlNonprofit: function (url) {
      _nextUrlNonprofit = url;
    },
    projects: function () {
      return _projects;
    },
    nonprofits: function () {
      return _nonprofits;
    },
  };
});

app.factory('Photos', ['$http', function($http) {
  var apiUrl = constants.api;

  return {
    setVolunteerPhoto: function (file, success, error) {
      $http.post(apiUrl + 'upload_volunteer_image/', file, {
          headers: {'Content-Type': undefined },
          transformRequest: angular.identity
        }).success(success).error(error);
    },
    setNonprofitProfilePhoto: function (file, success, error) {
      $http.post(apiUrl + 'upload_nonprofit_profile_image/', file, {
        headers: {'Content-Type': undefined },
        transformRequest: angular.indenty
      }).success(success).error(error);
    },
    setNonprofitCoverPhoto: function (file, success, error) {
      $http.post(apiUrl + 'upload_nonprofit_cover_image/', file, {
        headers: {'Content-Type': undefined },
        transformRequest: angular.indenty
      }).success(success).error(error);
    },
  };
}]);

app.factory('Auth', ['$http', 'Cookies', function($http, Cookies) {
  
  function setAuthHeader(accessToken) {
    if (accessToken) {
      $http.defaults.headers.common.Authorization = 'Bearer ' + accessToken;
    }
  }

  var apiUrl = constants.api;
  var _currentUser;

  var getCurrentUser = function () {
    Cookies.get(constants.accessTokenCookie).then(function(token) {
      if (token) {
        setAuthHeader(token);
        return $http.get(apiUrl + 'current_user/?id=' + new Date().getTime())
          .success(function(response) {
            _currentUser = response;
          });
      }
    });
  };

  getCurrentUser();

  return {
    facebookAuth: function (facebookAuthData, success, error) {
      $http.post(apiUrl + 'facebook/', facebookAuthData).success( function(response) {
        setAuthHeader(response.access_token);
        Cookies.set(constants.accessTokenCookie, response.access_token);
        success(response.user);
      }).error(error);
    },
    getCurrentUser: getCurrentUser,
    resetPassword: function (email, success, error) {
      $http.post(apiUrl + 'password_reset/', {email: email})
        .success( function(){
          success();
        }).error(error);
    },
    // Both email and password field need to be set on data object
    changePassword: function (data, success, error) {
      $http.put(apiUrl + 'change_password/', data)
        .success( function() {
          success();
        }).error(error);
    },
    isEmailUsed: function (email, success, error) {
      if (email) {
        $http.get(apiUrl + 'check_email/?email=' + email + '?id=' + new Date().getTime())
          .success(function (response) {success(response);}).error(error);
      }
    },
    isSlugUsed: function (slug, success, error) {
      $http.get(apiUrl + 'check_slug/?slug=' + slug)
        .success(function (response) {success(response);}).error(error);
    },
    isProjectSlugUsed: function (slug, success, error) {
      if (slug) {
        $http.get(apiUrl + 'check_project_slug/?slug=' + slug)
          .success(function (response) {success(response);}).error(error);
      }
    },
    
    isLoggedIn: function() {
      return _currentUser ? true : false;
    },
    volunteerSignup: function(volunteer, success, error) {
      $http.post(apiUrl + 'create/volunteer/', volunteer).success( function() {
        success();
      }).error(error);
    },
    nonprofitSignup: function(nonprofit, success, error) {
      $http.post(apiUrl + 'create/nonprofit/', nonprofit).success( function() {
        success();
      }).error(error);
    },
    login: function(user, success, error) {
      user.client_id = constants.clientId;
      user.client_secret = constants.clientSecret;
      user.grant_type = constants.grantType;
      $http({
        method: 'POST',
        url: apiUrl + 'oauth2/access_token/',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        data: $.param(user)
      }).success( function(response){
          setAuthHeader(response.access_token);
          if (user.remember) {
            Cookies.set(constants.accessTokenCookie, response.access_token, { expires: 30, path: '/' });
          } else {
            Cookies.set(constants.accessTokenCookie, response.access_token);
          }
          success(response);
        }).error(error);
    },
    logout: function() {
      $http.post(apiUrl + 'logout/');
      _currentUser = null;
      Cookies.delete(constants.accessTokenCookie);
      delete $http.defaults.headers.common.Authorization;
    },
    getUser: function () {
      return _currentUser;
    }
  };
}]);
