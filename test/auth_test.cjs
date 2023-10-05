import { expect } from 'chai';
import sinon from 'sinon';
import * as Auth from '../dist/scripts/auth';

describe('Auth Functions', () => {
  describe('configureClient', () => {
    it('should initialize Auth0 client', async () => {
      const fetchStub = sinon.stub(global, 'fetch');
      fetchStub.resolves({ json: () => ({ domain: 'test', client_id: 'test', audience: 'test' }) });
      await Auth.configureClient();
      expect(fetchStub.calledOnce).to.be.true;
      fetchStub.restore();
    });
  });

  describe('login', () => {
    it('should handle login', async () => {
      const isAuthenticatedStub = sinon.stub(Auth.auth0, 'isAuthenticated').resolves(true);
      const getTokenSilentlyStub = sinon.stub(Auth.auth0, 'getTokenSilently').resolves('test-token');
      await Auth.login();
      expect(isAuthenticatedStub.calledOnce).to.be.true;
      expect(getTokenSilentlyStub.calledOnce).to.be.true;
      isAuthenticatedStub.restore();
      getTokenSilentlyStub.restore();
    });
  });

  describe('logout', () => {
    it('should handle logout', async () => {
      const logoutStub = sinon.stub(Auth.auth0, 'logout');
      Auth.logout();
      expect(logoutStub.calledOnce).to.be.true;
      logoutStub.restore();
    });
  });
});
