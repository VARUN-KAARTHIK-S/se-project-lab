import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ role }) => {
    return (
        <nav className="main-nav">
            <Link to="/" className="logo">Smart <span>Drive</span></Link>
            <div className="nav-links">
                {role === 'admin' && <Link to="/admin-dashboard">Dashboard</Link>}
                {role === 'partner' && <Link to="/list-car">Manage Fleet</Link>}
                {role === 'customer' && <Link to="/available-cars">Browse Cars</Link>}
                <Link to="/signin" className="logout-link">Logout</Link>
            </div>
        </nav>
    );
};

export default Navbar;
