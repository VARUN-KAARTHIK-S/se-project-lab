import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { fetchAvailableCars } from '../services/api';
import './AvailableCars.css';

function AvailableCars() {
    const location = useLocation();
    const navigate = useNavigate();
    const [filteredCars, setFilteredCars] = useState([]);
    const userRole = localStorage.getItem('userRole') || 'customer';

    useEffect(() => {
        const getCars = async () => {
            try {
                const response = await fetchAvailableCars();
                const fetchedCars = response.data;
                const searchState = location.state || {};

                if (searchState.startLocation) {
                    const params = searchState.startLocation.trim().toLowerCase();
                    const filtered = fetchedCars.filter(car =>
                        car.location.toLowerCase().includes(params)
                    );
                    setFilteredCars(filtered);
                } else {
                    setFilteredCars(fetchedCars);
                }
            } catch (error) {
                console.error("Error fetching cars:", error);
            }
        };
        getCars();
    }, [location.state]);

    const [currentImageIndices, setCurrentImageIndices] = useState({});

    const nextImage = (carId, numImages) => {
        setCurrentImageIndices(prev => ({
            ...prev,
            [carId]: ((prev[carId] || 0) + 1) % numImages
        }));
    };

    const prevImage = (carId, numImages) => {
        setCurrentImageIndices(prev => ({
            ...prev,
            [carId]: ((prev[carId] || 0) - 1 + numImages) % numImages
        }));
    };

    return (
        <div className="available-cars-container">
            <Navbar role={userRole} />
            <h2>Available Cars</h2>
            <div className="search-summary">
                {location.state?.startLocation ? (
                    <p>Showing cars in: <span>{location.state.startLocation}</span></p>
                ) : (
                    <p>Showing all available cars</p>
                )}
            </div>

            <div className="car-grid">
                {filteredCars.length > 0 ? (
                    filteredCars.map(car => {
                        const currentImageIndex = currentImageIndices[car._id] || 0;
                        const hasMultipleImages = car.images && car.images.length > 1;

                        return (
                            <div key={car._id} className="car-card">
                                <div className="car-image-container">
                                    {hasMultipleImages && (
                                        <button className="nav-btn prev" onClick={() => prevImage(car._id, car.images.length)}>&#10094;</button>
                                    )}
                                    <img
                                        src={car.images && car.images.length > 0 ? car.images[currentImageIndex] : 'https://via.placeholder.com/300x200?text=No+Image'}
                                        alt={`${car.brand} ${car.model}`}
                                        className="car-image"
                                    />
                                    {hasMultipleImages && (
                                        <button className="nav-btn next" onClick={() => nextImage(car._id, car.images.length)}>&#10095;</button>
                                    )}
                                </div>
                                <div className="car-details">
                                    <h3>{car.brand} {car.model}</h3>
                                    <div className="car-badges">
                                        <span className="car-badge">{car.fuelType}</span>
                                        <span className="car-badge">₹{car.dailyRate}/day</span>
                                        <span className="car-badge">{car.allowedKm} KM Limit</span>
                                    </div>
                                    <p className="car-location">📍 {car.location}</p>
                                    {car.organization && (
                                        <p className="car-hub-info">🏦 {car.organization.name}</p>
                                    )}
                                    <button className="btn-primary" style={{ marginTop: 'auto', width: '100%' }} onClick={() => navigate('/book-car', { state: { car } })}>Book Now</button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="no-cars-container">
                        <p className="no-cars-text">No cars available in "{location.state?.startLocation || 'this location'}"</p>
                        <p className="suggestion-text">Try locations like Madurai, Coimbatore, or Chennai.</p>
                        <Link to="/">
                            <button className="try-btn">Try Another Location</button>
                        </Link>
                    </div>
                )}
            </div>

            <Link to="/" className="back-link">Back to Search</Link>
        </div>
    );
}

export default AvailableCars;
