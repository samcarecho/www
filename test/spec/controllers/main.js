'use strict';

describe('AppController', function () {

  // load the controller's module
  beforeEach(module('atadosApp'));

  var AppController,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AppController = $controller('AppController', {
      $scope: scope
    });
  }));

  it('shold have the site name on the root scope', function () {
    expect(scope.site.name).toBe('Atados - Juntando Gente Boa');
    expect(scope.site.title).toBe('Juntando Gente Boa');
  });
});
