export const stripe = {
    charges: {
        create: jest.fn().mockResolvedValue({ id: "asdf-111234" })
    }
};
