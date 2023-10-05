const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

// Import the functions you want to test from auth.js
const { configureClient, login, logout } = require('../dist/scripts/auth');

describe('Auth Functions', () => {
  describe('configureClient', () => {
    it('should initialize Auth0 client', async () => {
      const fetchStub = sinon.stub(global, 'fetch');
      fetchStub.resolves({ json: () => ({ domain: 'test', client_id: 'test', audience: 'test' }) });
      await configureClient();
      expect(fetchStub.calledOnce).to.be.true;
      fetchStub.restore();
    });
  });

  describe('login', () => {
    it('should handle login', async () => {
      const isAuthenticatedStub = sinon.stub(auth0, 'isAuthenticated').resolves(true);
      const getTokenSilentlyStub = sinon.stub(auth0, 'getTokenSilently').resolves('test-token');
      await login();
      expect(isAuthenticatedStub.calledOnce).to.be.true;
      expect(getTokenSilentlyStub.calledOnce).to.be.true;
      isAuthenticatedStub.restore();
      getTokenSilentlyStub.restore();
    });
  });

  describe('logout', () => {
    it('should handle logout', async () => {
      const logoutStub = sinon.stub(auth0, 'logout');
      logout();
      expect(logoutStub.calledOnce).to.be.true;
      logoutStub.restore();
    });
  });
});
