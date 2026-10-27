import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Home.css";

function Home() {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole') || 'customer';

    const [searchData, setSearchData] = useState({
        name: "",
        address: "",
        startLocation: "",
        endLocation: "",
        kilometers: "",
        departureTime: "",
        phoneNumber: "",
        licenseNumber: "",
        aadharNumber: "",
    });

    const handleChange = (e) => {
        setSearchData({ ...searchData, [e.target.name]: e.target.value });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        navigate('/available-cars', { state: searchData });
    };

    return (
        <div className="home-container">
            <Navbar role={userRole} />
            <section className="search-section">
                <h2>Find Your Ride</h2>
                <form className="search-form" onSubmit={handleSearch}>
                    <div className="form-group">
                        <label>Your Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your full name"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Your Address</label>
                        <input
                            type="text"
                            name="address"
                            placeholder="Enter full address"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Start Location</label>
                        <input
                            type="text"
                            name="startLocation"
                            placeholder="Pickup Point"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>End Location</label>
                        <input
                            type="text"
                            name="endLocation"
                            placeholder="Drop-off Point"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Kilometers Needed</label>
                        <input
                            type="number"
                            name="kilometers"
                            placeholder="Est. KM"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Departure Time</label>
                        <input
                            type="datetime-local"
                            name="departureTime"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            placeholder="10-digit Mobile Number"
                            pattern="[0-9]{10}"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>License Number</label>
                        <input
                            type="text"
                            name="licenseNumber"
                            placeholder="Driving License No."
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Aadhar Number</label>
                        <input
                            type="text"
                            name="aadharNumber"
                            placeholder="12-digit Aadhar No."
                            pattern="[0-9]{12}"
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit">SEARCH & BOOK</button>
                </form>
            </section>
        </div>
    );
}

export default Home;
