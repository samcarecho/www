'use strict';

var app = angular.module('atadosApp');

app.factory('Search', function (Restangular, Site, api, storage, ENV, page_size) {
  var _query = '';
  var _cause = {};
  var _skill = {};
  var _city = {};
  
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
  var fixProject = function (response) {
    response.forEach(sanitizeProject);
    if (response._resultmeta) {
      _nextUrlProject = toHttps(response._resultmeta.next);
      _projectCount = response._resultmeta.count;
    } else {
      _nextUrlProject = '';
    }
  };

  var fixNonprofit = function (response) {
    response.forEach(sanitizeNonprofit);
    if (response._resultmeta) {
      _nextUrlNonprofit = toHttps(response._resultmeta.next);
      _nonprofitCount = response._resultmeta.count;
    } else {
      _nextUrlNonprofit = '';
    }
  };

  var sanitizeProject = function (p) {
    p.causes.forEach(function (c) {
      c.image = storage + 'cause_' + c.id + '.png';
      c.class = 'cause_' + c.id;
    });

    p.skills.forEach(function (s) {
      s.image = storage + 'skill_' + s.id + '.png';
      s.class = 'skill_' + s.id;
    });

    _projects.push(p);
  };

  var sanitizeNonprofit = function (n) {
    var causes = [];
    n.causes.forEach(function (c) {
      var cause = {};
      cause.id = Site.causes()[c].id;
      cause.name = Site.causes()[c].name;
      cause.class = Site.causes()[c].class;
      cause.image = Site.causes()[c].image;
      cause.checked = true;
      causes.push(cause);
    });
    n.causes = causes;
    n.address = n.user.address;
    _nonprofits.push(n);
  };

  function searchProjects(query, cause, skill, city, highlighted, pageSize) {
    pageSize = typeof pageSize !== 'undefined' ? pageSize : page_size;
    var urlHeaders = {
      page_size: pageSize,
      query: query,
      cause: cause,
      skill: skill,
      city: city,
      highlighted: highlighted
    };
    _loading = true;
    Restangular.all('projects').getList(urlHeaders).then( function(response) {
      _projects = [];
      fixProject(response);
      _loading = false;
    }, function () {
      console.error('Não consegui pegar os atos do servidor.');
      _loading = false;
    });
  }

  var searchNonprofits = function (query, cause, city, highlighted) {
    var urlHeaders = {
      page_size: 20,
      query: query,
      cause: cause,
      city: city,
      highlighted: highlighted
    };
    _loading = true;
    Restangular.all('nonprofits').getList(urlHeaders).then( function (response) {
      _nonprofits = [];
      fixNonprofit(response);
      _loading = false;
    }, function () {
      console.error('Não consegui pegar ONGs do servidor.');
      _loading = false;
    });
  };

  return {
    filter: function (query, cause, skill, city, highlighted) {
      _projects = [];
      _nonprofits = [];
      searchProjects(query, cause, skill, city, highlighted);
      searchNonprofits(query, cause, city, highlighted);
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
  };
});
