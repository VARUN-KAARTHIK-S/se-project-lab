import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './BookCar.css';
import { createBooking } from '../services/api';

function BookCar() {
    const location = useLocation();
    const car = location.state?.car;

    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [returnTime, setReturnTime] = useState('');
    const [estimatedKm, setEstimatedKm] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingError, setBookingError] = useState('');
    const lightboxRef = useRef(null);

    const now = new Date();

    // Rates and Constants dynamic from Car JSON
    const daily_rate = car?.dailyRate || 0;
    const km_rate = car?.kmRate || 0;
    const max_km_per_day = car?.allowedKm || 0;

    // Calculate approximate amount
    let approxAmount = 0;
    let totalHours = 0;
    let days = 0;
    let extra_hours = 0;
    let total_km = parseInt(estimatedKm || '0');

    let allowed_km = 0;
    let isOverLimit = false;
    let hasDiscount = false;
    let discountAmount = 0;
    let originalApproxAmount = 0;

    if (startDate && startTime && returnDate && returnTime) {
        const startDateTime = new Date(`${startDate}T${startTime}`);
        const returnDateTime = new Date(`${returnDate}T${returnTime}`);
        const diffMs = returnDateTime - startDateTime;

        if (diffMs > 0) {
            totalHours = Math.ceil(diffMs / (1000 * 60 * 60));
            days = Math.ceil(totalHours / 24);
            extra_hours = totalHours % 24;

            allowed_km = days * max_km_per_day;
            isOverLimit = total_km > allowed_km;

            if (isOverLimit) {
                approxAmount = total_km * km_rate;
            } else {
                approxAmount = days * daily_rate;
                originalApproxAmount = approxAmount;

                const isHighDays = days >= 5;
                const isVeryLowKm = total_km > 0 && total_km <= (days * 100);

                if (isHighDays && isVeryLowKm) {
                    discountAmount = approxAmount * 0.15;
                    approxAmount -= discountAmount;
                    hasDiscount = true;
                }
            }
        }
    }

    const hasMultipleImages = car?.images && car.images.length > 1;

    const nextImage = () => {
        if (!car?.images) return;
        setCurrentImageIndex(prev => (prev + 1) % car.images.length);
    };

    const prevImage = () => {
        if (!car?.images) return;
        setCurrentImageIndex(prev => (prev - 1 + car.images.length) % car.images.length);
    };

    const openFullscreen = () => {
        setIsFullscreen(true);
        setTimeout(() => {
            if (lightboxRef.current && lightboxRef.current.requestFullscreen) {
                lightboxRef.current.requestFullscreen();
            } else if (lightboxRef.current?.webkitRequestFullscreen) {
                lightboxRef.current.webkitRequestFullscreen();
            }
        }, 50);
    };

    const closeFullscreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else if (document.webkitFullscreenElement) {
            document.webkitExitFullscreen();
        }
        setIsFullscreen(false);
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                setIsFullscreen(false);
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isFullscreen) return;
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen, nextImage, prevImage]);
    const today = now.toISOString().split('T')[0];

    const handleBooking = async () => {
        setBookingError('');
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            setBookingError('You must be logged in to book a car.');
            return;
        }
        const user = JSON.parse(storedUser);
        setBookingLoading(true);
        try {
            await createBooking({
                car: car._id,
                user: user.id,
                startDate,
                startTime,
                returnDate,
                returnTime,
                estimatedKm: estimatedKm || 0,
                totalFare: approxAmount
            });
            setBookingSuccess(true);
        } catch (error) {
            setBookingError(error.response?.data?.message || 'Booking failed. Please try again.');
        } finally {
            setBookingLoading(false);
        }
    };

    // If no car data, redirect back
    if (!car) {
        return (
            <div className="bookcar-container">
                <div className="bookcar-error">
                    <h2>No car selected</h2>
                    <p>Please go back and select a car to book.</p>
                    <Link to="/available-cars" className="btn-outline" style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 10, borderRadius: '50px' }}>
                        ← Browse Cars
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bookcar-container">
            <Navbar role="customer" />
            <div className="bookcar-hero">
                <div className="bookcar-image-wrapper">
                    {hasMultipleImages && (
                        <button className="bookcar-nav-btn bookcar-prev" onClick={prevImage}>&#10094;</button>
                    )}
                    <img
                        src={car.images?.[currentImageIndex] || 'https://via.placeholder.com/800x400?text=No+Image'}
                        alt={`${car.brand} ${car.model}`}
                        className="bookcar-hero-image"
                        onClick={openFullscreen}
                    />
                    {hasMultipleImages && (
                        <button className="bookcar-nav-btn bookcar-next" onClick={nextImage}>&#10095;</button>
                    )}
                </div>

                {hasMultipleImages && (
                    <div className="bookcar-dots">
                        {car.images.map((_, idx) => (
                            <span
                                key={idx}
                                className={`bookcar-dot ${idx === currentImageIndex ? 'active' : ''}`}
                                onClick={() => setCurrentImageIndex(idx)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="bookcar-content">
                <div className="bookcar-details-section">
                    <h1 className="bookcar-title">{car.brand} {car.model}</h1>
                    <div className="bookcar-meta">
                        <span className="bookcar-location">📍 {car.location}</span>
                    </div>

                    <div className="bookcar-pricing-badges">
                        <div className="bookcar-badge">
                            <span className="badge-label">Fuel Type</span>
                            <span className="badge-value">{car.fuelType || 'Petrol'}</span>
                        </div>
                        <div className="bookcar-badge">
                            <span className="badge-label">Daily Rate</span>
                            <span className="badge-value">₹{daily_rate}</span>
                        </div>
                        <div className="bookcar-badge">
                            <span className="badge-label">KM Limit</span>
                            <span className="badge-value">{max_km_per_day} KM</span>
                        </div>
                        <div className="bookcar-badge">
                            <span className="badge-label">Rate per KM</span>
                            <span className="badge-value">₹{km_rate}/KM</span>
                        </div>
                    </div>
                </div>

                <div className="bookcar-form-section">
                    <h2 className="bookcar-form-title">Estimate Your Trip</h2>

                    <div className="bookcar-form-row">
                        <div className="bookcar-form-group">
                            <label htmlFor="startDate">Start Date</label>
                            <input
                                type="date"
                                id="startDate"
                                value={startDate}
                                min={today}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        <div className="bookcar-form-group">
                            <label htmlFor="startTime">Start Time</label>
                            <input
                                type="time"
                                id="startTime"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bookcar-form-row">
                        <div className="bookcar-form-group">
                            <label htmlFor="returnDate">Approx. Return Date</label>
                            <input
                                type="date"
                                id="returnDate"
                                value={returnDate}
                                min={startDate || today}
                                onChange={(e) => setReturnDate(e.target.value)}
                            />
                        </div>

                        <div className="bookcar-form-group">
                            <label htmlFor="returnTime">Approx. Return Time</label>
                            <input
                                type="time"
                                id="returnTime"
                                value={returnTime}
                                onChange={(e) => setReturnTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bookcar-form-group">
                        <label htmlFor="estimatedKm">Estimated KMs</label>
                        <input
                            type="number"
                            id="estimatedKm"
                            placeholder="e.g. 200"
                            value={estimatedKm}
                            min="0"
                            onChange={(e) => setEstimatedKm(e.target.value)}
                        />
                    </div>

                    {startDate && startTime && returnDate && returnTime && (
                        <div className={`bookcar-estimate ${approxAmount > 0 ? 'visible' : ''}`}>
                            <div className="estimate-row">
                                <span>Duration</span>
                                <span className="estimate-value">{days} Days ({extra_hours} extra hrs)</span>
                            </div>

                            <div className="estimate-row">
                                <span>Allowed KM ({days} days × {max_km_per_day})</span>
                                <span className="estimate-value">{allowed_km} KM</span>
                            </div>

                            <div className="estimate-row">
                                <span>Actual KM</span>
                                <span className={`estimate-value ${isOverLimit ? 'bookcar-over-limit' : ''}`}>{total_km} KM</span>
                            </div>

                            <div className="estimate-divider"></div>

                            {isOverLimit ? (
                                <div className="estimate-row">
                                    <span>Charge Type</span>
                                    <span className="estimate-value highlight">KM Based (Over Limit)</span>
                                </div>
                            ) : (
                                <div className="estimate-row">
                                    <span>Charge Type</span>
                                    <span className={`estimate-value highlight ${hasDiscount ? 'discount' : ''}`}>
                                        {hasDiscount ? 'Daily Rate (Low Usage Discount Applied)' : 'Daily Rate'}
                                    </span>
                                </div>
                            )}

                            {hasDiscount && (
                                <>
                                    <div className="estimate-row">
                                        <span>Original Fare</span>
                                        <span className="estimate-value">₹{originalApproxAmount.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="estimate-row discount">
                                        <span>Low Usage Discount (15%)</span>
                                        <span className="discount-value">-₹{discountAmount.toLocaleString('en-IN')}</span>
                                    </div>
                                </>
                            )}

                            <div className="estimate-row total">
                                <span>Total Fare</span>
                                <span className="estimate-total">₹{approxAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <p className="estimate-note">
                                {isOverLimit
                                    ? `* Limit exceeded: ${total_km} KM × ₹${km_rate}`
                                    : hasDiscount
                                        ? `* ${days} days × ₹${daily_rate.toLocaleString('en-IN')} with 15% low usage discount`
                                        : `* Within limit: ${days} days × ₹${daily_rate.toLocaleString('en-IN')}`
                                }
                            </p>
                        </div>
                    )}

                    {startDate && startTime && returnDate && returnTime && approxAmount <= 0 && (
                        <p className="bookcar-warning">⚠ Return date/time must be after the start date/time.</p>
                    )}

                    {bookingError && (
                        <p className="bookcar-error-msg">⚠ {bookingError}</p>
                    )}

                    {bookingSuccess ? (
                        <div className="bookcar-success-box">
                            <span className="bookcar-success-icon">✅</span>
                            <h3>Booking Confirmed!</h3>
                            <p>Your ride has been booked for ₹{approxAmount.toLocaleString('en-IN')}.</p>
                            <Link to="/available-cars" className="btn-primary">
                                Return to Fleet
                            </Link>
                        </div>
                    ) : (
                        <button
                            className="btn-primary"
                            style={{ width: '100%', marginTop: '2rem' }}
                            disabled={!startDate || !startTime || !returnDate || !returnTime || approxAmount <= 0 || bookingLoading}
                            onClick={handleBooking}
                        >
                            {bookingLoading ? 'Booking...' : `Confirm Booking — ₹${approxAmount > 0 ? approxAmount.toLocaleString('en-IN') : '---'}`}
                        </button>
                    )}
                </div>
            </div>

            {isFullscreen && (
                <div className="lightbox-overlay" ref={lightboxRef}>
                    <button className="lightbox-back" onClick={closeFullscreen}>← Back</button>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        {hasMultipleImages && (
                            <button className="lightbox-nav lightbox-prev" onClick={prevImage}>&#10094;</button>
                        )}
                        <img
                            src={car.images?.[currentImageIndex]}
                            alt={car.name}
                            className="lightbox-image"
                        />
                        {hasMultipleImages && (
                            <button className="lightbox-nav lightbox-next" onClick={nextImage}>&#10095;</button>
                        )}
                    </div>
                    {hasMultipleImages && (
                        <div className="lightbox-counter">
                            {currentImageIndex + 1} / {car.images.length}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default BookCar;
