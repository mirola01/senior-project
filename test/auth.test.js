// Store the actual auth module for later use
let actualAuthModule;

// Before all tests, get the actual auth module
beforeAll(() => {
  actualAuthModule = require.requireActual('../dist/scripts/auth');
});

// Mock the auth module, but keep the original functionality except for faunadb
jest.doMock('../dist/scripts/auth', () => ({
  ...actualAuthModule,
  faunadb: {
    query: jest.fn()
  }
}));


// Test if the login function authenticates the user
test('login should authenticate user', async () => {
  const result = await login();
  expect(result).toBe(true);
});
