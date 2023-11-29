const { configureClient, setToken, getFaunaKey } = require('../../dist/scripts/auth');

describe('Auth Module Tests', () => {
    beforeEach(() => {
        // Clear mock calls before each test
        localStorage.getItem.mockClear();
        localStorage.setItem.mockClear();

        // Mock fetch response
        fetch.mockResolvedValue({
            json: () => Promise.resolve({
                domain: "dev-n84gx3uanib6ojpf.us.auth0.com",
                client_id: "Xe6t07ETgQBkSvipbSCCFRbxaBmeDMEC",
                audience: "https://db.fauna.com/db/ywhfa3yj6yyr1",
                fauna_key: "fnAFOF01yxAASegxSMrTHFl72bpUPsUmoW9aNNO7"
            })
        });
    });

    test('configureClient sets up Auth0 client correctly', async () => {
        await configureClient();
        expect(fetch).toHaveBeenCalled();
        expect(localStorage.setItem).toHaveBeenCalledWith("fauna_key", "fnAFOF01yxAASegxSMrTHFl72bpUPsUmoW9aNNO7");
    });

    test('setToken and getFaunaKey work correctly', () => {
        const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjFwdDJJZlM5SllPZ1pvdVRHOUdRTCJ9...";
        setToken(token);
        expect(localStorage.setItem).toHaveBeenCalledWith("accessToken", token);

        localStorage.getItem.mockReturnValue(token); // Ensure getItem returns the mock token

        const retrievedToken = getFaunaKey();
        expect(retrievedToken).toBe(token);
    });
});
