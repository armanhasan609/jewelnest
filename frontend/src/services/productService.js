import API from './api';

// Saare products mangwane ke liye
export const fetchAllProducts = async () => {
    const response = await API.get('/products/all');
    return response.data;
};

// Naya product add karne ke liye (Admin ke liye)
export const addProduct = async (formData) => {
    const response = await API.post('/products/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

// Product delete karne ke liye
export const deleteProduct = async (id) => {
    const response = await API.post('/products/remove', { id });
    return response.data;
};