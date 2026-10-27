import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const fetchAvailableCars = () => axios.get(`${API_URL}/cars`);
export const fetchPendingCars = () => axios.get(`${API_URL}/cars/pending`);
export const fetchPartnerCars = (partnerId) => axios.get(`${API_URL}/cars/partner/${partnerId}`);
export const submitCar = (carData) => axios.post(`${API_URL}/cars/list`, carData);
export const approveCar = (id) => axios.put(`${API_URL}/cars/approve/${id}`);
export const deleteCar = (id) => axios.delete(`${API_URL}/cars/${id}`);
export const updateCar = (id, carData) => axios.put(`${API_URL}/cars/${id}`, carData);

export const fetchPartners = () => axios.get(`${API_URL}/users/partners`);
export const fetchCustomers = () => axios.get(`${API_URL}/users/customers`);

export const login = (credentials) => axios.post(`${API_URL}/users/login`, credentials);
export const register = (userData) => axios.post(`${API_URL}/users/register`, userData);

export const createBooking = (bookingData) => axios.post(`${API_URL}/bookings`, bookingData);
export const fetchAllBookings = () => axios.get(`${API_URL}/bookings`);
export const fetchUserBookings = (userId) => axios.get(`${API_URL}/bookings/user/${userId}`);
export const completeBooking = (id) => axios.put(`${API_URL}/bookings/complete/${id}`);
export const cancelBooking = (id) => axios.put(`${API_URL}/bookings/cancel/${id}`);

export const fetchOrgs = () => axios.get(`${API_URL}/orgs`);
export const createOrg = (orgData) => axios.post(`${API_URL}/orgs`, orgData);
export const deleteOrg = (id) => axios.delete(`${API_URL}/orgs/${id}`);
