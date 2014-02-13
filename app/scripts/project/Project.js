'use strict';

/* global toastr: false */
/* global constants: false */

var app = angular.module('atadosApp');

app.factory('Project', ['$http', 'Restangular', 'Site', 'Auth', '$state', function($http, Restangular, Site, Auth, $state) {
  return {
    create: function (project, success, error) {
      $http.post(constants.api + 'create/project/', project, {
        headers: {'Content-Type': undefined },
        transformRequest: angular.identity
      }).success(success).error(error);
    },
    get: function(slug) {
      return Restangular.one('project', slug).get().then(function(project) {
        project.causes.forEach( function (c) {
          c.image = constants.storage + 'cause_' + c.id + '.png';
        });
        project.skills.forEach(function (s) {
          s.image = constants.storage + 'skill_' + s.id + '.png';
        });

        if (project.work) {
          var availabilities = [];
          for (var period = 0; period < 3; period++) {
            var periods = [];
            availabilities.push(periods);
            for (var weekday = 0; weekday < 7; weekday++) {
              periods.push({checked: false});
            }
          }
          project.work.availabilities.forEach(function(a) {
            availabilities[a.period][a.weekday].checked = true;
          });
          project.work.availabilities = availabilities;
        }

        Site.causes().forEach(function(c) {
          project.causes.forEach(function(nc) {
            if (c.id === nc) {
              var i = project.causes.indexOf(nc);
              project.nonprofit.causes[i] = c;
            }
          });
        });

        
        return project;

      }, function() {
        $state.transitionTo('root.home');
        toastr.error('Ato não encontrado.');
      });
    },
    getSlug: function (name, success, error) {
      $http.get(constants.api + 'create_project_slug/?name=' + name)
        .success(success).error(error);
    }
  };
}]);
