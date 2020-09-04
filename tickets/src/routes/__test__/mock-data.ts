import mongoose from 'mongoose';
const mockTitle = 'Metallica - No Leaf Clover';
const mockPrice = 85;
const mockCreateTicketPayload = () => {
    return {
        title: mockTitle,
        price: mockPrice,
    };
};
const createMockId = () => {
    return new mongoose.Types.ObjectId().toHexString();
};

const mockUpdateTitle = "The-Dream - Walkin' On The Moon";
const mockUpdatePrice = 70;
const mockUpdatePayload = () => {
    return {
        title: mockUpdateTitle,
        price: mockUpdatePrice,
    };
};

export {
    mockCreateTicketPayload,
    mockTitle,
    mockPrice,
    createMockId,
    mockUpdateTitle,
    mockUpdatePrice,
    mockUpdatePayload,
};
