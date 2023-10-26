
// Mocking fetch and localStorage
global.fetch = jest.fn();
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};

// Mocking createAuth0Client
global.createAuth0Client = jest.fn();

describe('Auth Module', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should configure Auth0 client', async () => {
      const mockConfig = {
        domain: 'test-domain',
        client_id: 'test-client-id',
        audience: 'test-audience',
        fauna_key: 'test-fauna-key',
      };
      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockConfig),
      });
      await configureClient();
      expect(createAuth0Client).toHaveBeenCalledWith({
        domain: mockConfig.domain,
        client_id: mockConfig.client_id,
        audience: mockConfig.audience,
      });
      expect(localStorage.setItem).toHaveBeenCalledWith('fauna_key', mockConfig.fauna_key);
    });
  
    it('should get Auth0 client', () => {
      const mockAuth0 = {};
      setAuth0(mockAuth0);
      expect(getAuth0()).toBe(mockAuth0);
    });
  
    it('should set and get token', () => {
      setToken('some-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'some-token');
    });
  
    it('should get Fauna key', () => {
      localStorage.getItem.mockReturnValueOnce('some-fauna-key');
      expect(getFaunaKey()).toBe('some-fauna-key');
    });
  
    it('should handle login', async () => {
      const mockAuth0 = {
        loginWithRedirect: jest.fn(),
      };
      setAuth0(mockAuth0);
      await login();
      expect(mockAuth0.loginWithRedirect).toHaveBeenCalledWith({
        redirect_uri: 'https://lineup-manager.netlify.app/player-database.html',
      });
    });
  
    it('should handle logout', () => {
      const mockAuth0 = {
        logout: jest.fn(),
      };
      setAuth0(mockAuth0);
      logout();
      expect(localStorage.clear).toHaveBeenCalled();
      expect(mockAuth0.logout).toHaveBeenCalledWith({
        returnTo: 'https://lineup-manager.netlify.app',
      });
    });
  });
  