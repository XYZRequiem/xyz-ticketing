const mockEmail = 'test@test.com';
const mockPassword = 'password';
const getMockSignupPayload = () => {
    return {
        email: mockEmail,
        password: mockPassword,
    };
};

export { getMockSignupPayload, mockEmail, mockPassword };
