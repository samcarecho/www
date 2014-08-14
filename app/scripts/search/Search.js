'use strict';

var app = angular.module('atadosApp');

app.factory('Search', function (Restangular, ENV, Cleanup) {
  var _query = '';
  var _cause = {};
  var _skill = {};
  var _city = {};
  
  var _highlightedProjects = [];
  var _highlightedNonprofits = [];

  var _cardListProjects = [];
  var _cardListNonprofits = [];

  var _mapProjects = [];
  var _mapNonprofits = [];

  var _nextUrlProject = '';
  var _nextUrlNonprofit = '';

  var _projectCount = 0;
  var _nonprofitCount = 0;

  var _loading = false;

  var toHttps = function (url) {
    if (url && ENV === 'production') {
      return url.replace('http','https');
    }
    return url;
  };

  var fixProjects = function (projects) {
    projects.forEach(Cleanup.projectForSearch);
    if (projects._resultmeta) {
      _nextUrlProject = toHttps(projects._resultmeta.next);
      _projectCount = projects._resultmeta.count;
    } else {
      _nextUrlProject = '';
    }
    return projects;
  };

  var fixNonprofits = function (nonprofits) {
    nonprofits.forEach(Cleanup.nonprofitForSearch);
    if (nonprofits._resultmeta) {
      _nextUrlNonprofit = toHttps(nonprofits._resultmeta.next);
      _nonprofitCount = nonprofits._resultmeta.count;
    } else {
      _nextUrlNonprofit = '';
    }
    return nonprofits;
  };

  // city is the the city id
  function searchProjects(query, cause, skill, city) {
    var urlHeaders = {
      page_size: 20,
      query: query,
      cause: cause,
      skill: skill,
      city: city,
    };

    _loading = true;
    Restangular.all('projects').getList(urlHeaders).then( function(response) {
      _cardListProjects = response;
      _cardListProjects = fixProjects(response);
      _loading = false;
    }, function () {
      console.error('Não consegui pegar os atos do servidor.');
      _loading = false;
    });
  }

  // city is the the city id
  var searchNonprofits = function (query, cause, city) {
    var urlHeaders = {
      page_size: 20,
      query: query,
      cause: cause,
      city: city,
    };

    _loading = true;
    Restangular.all('nonprofits').getList(urlHeaders).then( function (response) {
      _cardListNonprofits = [];
      _cardListNonprofits = fixNonprofits(response);
      _loading = false;
    }, function () {
      console.error('Não consegui pegar ONGs do servidor.');
      _loading = false;
    });
  };

  var getMapProjects = function() {
    Restangular.all('map/projects').getList({page_size: 1000}).then( function (projects) {
      _mapProjects = projects;
    }, function () {
      console.error('Não consegui pegar Atos no Mapa do servidor.');
    });
  };
  var getMapNonprofits = function() {
    Restangular.all('map/nonprofits').getList({page_size: 1000}).then( function (nonprofits) {
      _mapNonprofits = nonprofits;
    }, function () {
      console.error('Não consegui pegar ONGs no Mapa do servidor.');
    });
  };

  getMapProjects();
  getMapNonprofits();

  return {
    filter: function (query, cause, skill, city) {
      _cardListProjects = [];
      _cardListNonprofits = [];
      searchProjects(query, cause, skill, city);
      searchNonprofits(query, cause, city);
    },
    query: _query,
    cause: _cause,
    skill: _skill,
    city: _city,
    loading: function () {
      return _loading;
    },
    showProjects: true,
    projectCount: function () {
      return _projectCount;
    },
    nonprofitCount: function () {
      return _nonprofitCount;
    },
    nextUrlProject: function () {
      return _nextUrlProject;
    },
    nextUrlNonprofit: function () {
      return _nextUrlNonprofit;
    },
    setNextUrlProject: function (url) {
      _nextUrlProject = toHttps(url);
    },
    setNextUrlNonprofit: function (url) {
      _nextUrlNonprofit = toHttps(url);
    },
    mapProjects: function() {
      return _mapProjects;
    },
    mapNonprofits: function() {
      return _mapNonprofits;
    },
    projects: function () {
      return _cardListProjects;
    },
    nonprofits: function () {
      return _cardListNonprofits;
    },
    getHighlightedProjects: function () {
      return Restangular.all('projects').getList({highlighted: true}).then( function(projects) {
        _highlightedProjects = fixProjects(projects);
        return;
      }, function () {
        console.error('Não consegui pegar os atos em destaque do servidor.');
      });
    },
    getHighlightedNonprofits: function () {
      return Restangular.all('nonprofits').getList({highlighted: true}).then( function(nonprofits) {
        _highlightedNonprofits = fixNonprofits(nonprofits);
        return;
      }, function () {
        console.error('Não consegui pegar as ONGs em destaque do servidor.');
      });
    },
    highlightedProjects: function () {
      return _highlightedProjects;
    },
    highlightedNonprofits: function () {
      return _highlightedNonprofits;
    },
  };
});
