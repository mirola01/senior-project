const { configureClient } = require('…/…/dist/scripts/auth'); // Import the relevant functions

const user = {
  email: "lmirorodrigo@gmai.com",
  email_verified: true,
  sub: "google-oauth2|102291571763260774886",
};

const adminUser = {
  email: "mirola01@luther.edu",
  email_verified: true,
  sub: "google-oauth2|376153054506909769",
  "https:/db.fauna.com/roles": ["admin", "writer_admin"],
};

// Mocking the fetch function
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

// Mocking localStorage
global.localStorage = {
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

describe('Auth Module', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  it('configures client correctly', async () => {
    await configureClient();
    expect(localStorage.setItem).toHaveBeenCalledWith("fauna_key", "fnAFOF01yxAASegxSMrTHFl72bpUPsUmoW9aNNO7");
    // ... other assertions for auth0 client initialization
  });

  // ... other tests
});
