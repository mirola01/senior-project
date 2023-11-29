// jest.setup.js
jest.mock('@auth0/auth0-spa-js');

class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  getItem = jest.fn((key) => this.store[key] || null);
  setItem = jest.fn((key, value) => { this.store[key] = value.toString(); });
  removeItem = jest.fn((key) => { delete this.store[key]; });
  clear = jest.fn(() => { this.store = {}; });
}

// Use Object.defineProperty to define localStorage
Object.defineProperty(global, 'localStorage', {
  value: new LocalStorageMock(),
  writable: true,
});

// Mock for Auth0 client
jest.mock('auth0-spa-js', () => ({
  createAuth0Client: jest.fn().mockResolvedValue({
    isAuthenticated: jest.fn().mockResolvedValue(true),
    // ... other functions as needed
  }),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      domain: "dev-n84gx3uanib6ojpf.us.auth0.com",
      client_id: "Xe6t07ETgQBkSvipbSCCFRbxaBmeDMEC",
      audience: "https://db.fauna.com/db/ywhfa3yj6yyr1",
      fauna_key: "fnAFOF01yxAASegxSMrTHFl72bpUPsUmoW9aNNO7"
    })
  })
);



// ... any other global setup needed for your tests
