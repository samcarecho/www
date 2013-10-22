'use strict';

describe('Controller: AppController', function () {

  // load the controller's module
  beforeEach(module('atadosApp'));

  var AppController,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    rootScope = $rootScope;
    AppController = $controller('AppController', {
      $scope: scope,
      $rootScope: rootScope
    });
  }));

  it('shold have the site name on the root scope', function () {
    expect($rootScope.site.name).toBe('Atados - Juntando gente Boa');
    expect($rootScope.site.title).toBe('Juntando gente Boa');
  });
});

// Stuff that I need to test
  // 1 . I need to make sure the authentication page creates a user well
  // 2. that the user is correctly authenticated and logged in
  // 3. That no trace of the user is cached on the client and on the server when he log outs
