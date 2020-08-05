const mockTitle = 'Metallica - No Leaf Clover';
const mockPrice = 85;
const mockCreateTicketPayload = () => {
    return {
        title: mockTitle,
        price: mockPrice,
    };
};

export { mockCreateTicketPayload, mockTitle, mockPrice };
