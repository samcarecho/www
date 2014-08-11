'use strict';

var app = angular.module('atadosApp');

app.factory('Search', function (Restangular, ENV, Cleanup) {
  var _query = '';
  var _cause = {};
  var _skill = {};
  var _city = {};
  
  var _highlightedProjects = [];
  var _highlightedNonprofits = [];

  var _projects = [];
  var _nonprofits = [];

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

  function searchProjects(query, cause, skill, city) {
    if (!city) {
      city = 9422; // São Paulo
    }

    var urlHeaders = {
      page_size: 1000,
      query: query,
      cause: cause,
      skill: skill,
      city: city,
    };

    _loading = true;
    Restangular.all('markers/projects').getList(urlHeaders).then( function(response) {
      _projects = response;
      //_projects = fixProjects(response);
      _loading = false;
    }, function () {
      console.error('Não consegui pegar os atos do servidor.');
      _loading = false;
    });
  }

  var searchNonprofits = function (query, cause, city) {
    if (!city) {
      city = 9422; // São Paulo
    }

    var urlHeaders = {
      page_size: 20,
      query: query,
      cause: cause,
      city: city,
    };

    _loading = true;
    Restangular.all('nonprofits').getList(urlHeaders).then( function (response) {
      _nonprofits = [];
      _nonprofits = fixNonprofits(response);
      _loading = false;
    }, function () {
      console.error('Não consegui pegar ONGs do servidor.');
      _loading = false;
    });
  };

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
    projects: function () {
      return _projects;
    },
    nonprofits: function () {
      return _nonprofits;
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
