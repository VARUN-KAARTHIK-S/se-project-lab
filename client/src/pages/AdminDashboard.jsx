import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './AdminDashboard.css';
import { fetchAvailableCars, fetchPendingCars, fetchPartners, fetchCustomers, approveCar as approveApi, deleteCar as deleteApi, fetchAllBookings, completeBooking as completeApi, fetchOrgs, createOrg as createOrgApi, deleteOrg as deleteOrgApi } from '../services/api';

function AdminDashboard() {
    const [view, setView] = useState('cars');
    const [cars, setCars] = useState([]);
    const [pendingCars, setPendingCars] = useState([]);
    const [partners, setPartners] = useState([]);
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [orgs, setOrgs] = useState([]);
    const [editingCar, setEditingCar] = useState(null);
    const [newOrg, setNewOrg] = useState({ name: '', location: '', parkingDetails: '', capacity: '' });
    const [orgLoading, setOrgLoading] = useState(false);

    useEffect(() => {
        const loadAllData = async () => {
            try {
                const [carsRes, pendingRes, partRes, userRes, bookingsRes, orgsRes] = await Promise.all([
                    fetchAvailableCars(),
                    fetchPendingCars(),
                    fetchPartners(),
                    fetchCustomers(),
                    fetchAllBookings(),
                    fetchOrgs()
                ]);
                setCars(carsRes.data);
                setPendingCars(pendingRes.data);
                setPartners(partRes.data);
                setUsers(userRes.data);
                setBookings(bookingsRes.data);
                setOrgs(orgsRes.data);
            } catch (error) {
                console.error("Error loading admin data:", error);
            }
        };
        loadAllData();
    }, []);

    const handleApprove = async (car) => {
        try {
            const response = await approveApi(car._id);
            setCars([...cars, response.data]);
            setPendingCars(pendingCars.filter(c => c._id !== car._id));
        } catch (error) {
            console.error(error);
            alert("Approval failed.");
        }
    };

    const handleReject = async (id) => {
        if (window.confirm('Reject this car listing?')) {
            try {
                await deleteApi(id);
                setPendingCars(pendingCars.filter(c => c._id !== id));
            } catch (error) {
                console.error(error);
                alert("Action failed.");
            }
        }
    };

    const handleSave = () => {

        setCars(cars.map(c => c._id === editingCar._id ? editingCar : c));
        setEditingCar(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this car?')) {
            try {
                await deleteApi(id);
                setCars(cars.filter(c => c._id !== id));
            } catch (error) {
                console.error(error);
                alert("Delete failed.");
            }
        }
    };

    const handleComplete = async (booking) => {
        if (window.confirm('Mark this booking as Completed?')) {
            try {
                await completeApi(booking._id);
                setBookings(bookings.map(b => b._id === booking._id ? { ...b, status: 'Completed' } : b));
                setCars(prev => prev.map(c => c._id === booking.car?._id ? { ...c, status: 'Available' } : c));
            } catch (error) {
                console.error(error);
                alert('Failed to complete booking.');
            }
        }
    };

    const getStatusLabel = (status) => {
        if (status === 'Available') return 'Ideal at Location';
        if (status === 'Rented') return 'On Ride';
        return status;
    };

    const handleCreateOrg = async (e) => {
        e.preventDefault();
        setOrgLoading(true);
        try {
            const orgToCreate = {
                ...newOrg,
                capacity: newOrg.capacity === '' ? 0 : Number(newOrg.capacity)
            };
            const res = await createOrgApi(orgToCreate);
            setOrgs([...orgs, res.data]);
            setNewOrg({ name: '', location: '', parkingDetails: '', capacity: '' });
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            alert(`Failed to create organization: ${errorMsg}`);
        } finally {
            setOrgLoading(false);
        }
    };

    const handleDeleteOrg = async (id) => {
        if (window.confirm("Delete this organization?")) {
            try {
                await deleteOrgApi(id);
                setOrgs(orgs.filter(o => o._id !== id));
            } catch (error) {
                console.error(error);
                alert("Delete failed.");
            }
        }
    };

    return (
        <div className="admin-container">
            <Navbar role="admin" />
            <div className="admin-sub-nav">
                <button onClick={() => setView('cars')} className={view === 'cars' ? 'active' : ''}>Fleet</button>
                <button onClick={() => setView('approvals')} className={view === 'approvals' ? 'active' : ''}>Approvals ({pendingCars.length})</button>
                <button onClick={() => setView('bookings')} className={view === 'bookings' ? 'active' : ''}>Bookings ({bookings.filter(b => b.status === 'Booked').length})</button>
                <button onClick={() => setView('orgs')} className={view === 'orgs' ? 'active' : ''}>Organizations</button>
                <button onClick={() => setView('partners')} className={view === 'partners' ? 'active' : ''}>Partners</button>
                <button onClick={() => setView('users')} className={view === 'users' ? 'active' : ''}>Customers</button>
            </div>

            <header className="admin-header">
                <h1>{view.charAt(0).toUpperCase() + view.slice(1)} Management</h1>
                <p>Manage and monitor all aspects of your self-driving platform.</p>
            </header>

            <main className="admin-main">
                {view === 'cars' && (
                    <div className="admin-card">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Car Name</th>
                                    <th>Owner</th>
                                    <th>Organization</th>
                                    <th>Location</th>
                                    <th>Rate (₹)</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cars.map(car => (
                                    <tr key={car._id}>
                                        <td>{car.brand} {car.model}</td>
                                        <td>{car.owner?.name || 'Partner'}</td>
                                        <td>{car.organization?.name || 'N/A'}</td>
                                        <td>{car.location}</td>
                                        <td>{car.dailyRate}</td>
                                        <td><span className={`status-text ${car.status.toLowerCase()}`}>{getStatusLabel(car.status)}</span></td>
                                        <td>
                                            <div className="actions">
                                                <button className="btn-outline" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => setEditingCar(car)}>Edit</button>
                                                <button className="btn-danger" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => handleDelete(car._id)}>Delete</button>
                                            </div>    </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {view === 'bookings' && (
                    <div className="admin-card">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Car</th>
                                    <th>Start</th>
                                    <th>Return</th>
                                    <th>Fare (₹)</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.length > 0 ? bookings.map(b => (
                                    <tr key={b._id}>
                                        <td>{b.user?.name || 'Customer'}</td>
                                        <td>{b.car?.brand} {b.car?.model}</td>
                                        <td>{new Date(b.startDate).toLocaleDateString('en-IN')} {b.startTime}</td>
                                        <td>{new Date(b.returnDate).toLocaleDateString('en-IN')} {b.returnTime}</td>
                                        <td>₹{b.totalFare?.toLocaleString('en-IN')}</td>
                                        <td>
                                            <span className={`status-pill status-${b.status.toLowerCase()}`}>
                                                {b.status}
                                            </span>    </td>
                                        <td className="actions">
                                            {b.status === 'Booked' && (
                                                <button className="btn-primary" onClick={() => handleComplete(b)}>Complete</button>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-dim)' }}>No bookings yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {view === 'approvals' && (
                    <div className="approvals-grid">
                        {pendingCars.length > 0 ? pendingCars.map(car => (
                            <div key={car._id} className="approval-card">
                                <img src={car.images[0]} alt={car.model} className="approval-img" />
                                <div className="approval-content">
                                    <h3>{car.brand} {car.model} ({car.year})</h3>
                                    <p className="owner-tag">By: {car.owner?.name || 'Partner'}</p>
                                    <div className="approval-specs">
                                        <span>🏦 {car.organization?.name || 'No Org'}</span>
                                        <span>📍 {car.location}</span>
                                        <span>⛽ {car.fuelType}</span>
                                        <span>₹{car.dailyRate}/day</span>
                                        <span>🛣️ {car.allowedKm} KM/day</span>
                                    </div>
                                    <div className="approval-actions">
                                        <button className="btn-accent" style={{ padding: '10px 20px', fontSize: '0.8rem' }} onClick={() => handleApprove(car)}>Approve</button>
                                        <button className="btn-outline" style={{ padding: '10px 20px', fontSize: '0.8rem', color: '#ff4d4d', borderColor: '#ff4d4d' }} onClick={() => handleReject(car._id)}>Reject</button>
                                    </div>
                                </div>
                            </div>
                        )) : <p className="empty-msg">No pending car listings for approval.</p>}
                    </div>
                )}

                {view === 'partners' && (
                    <div className="admin-card">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Partner Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {partners.map(p => (
                                    <tr key={p._id}>
                                        <td>{p.name}</td>
                                        <td>{p.email}</td>
                                        <td><span className="status-text available">{p.role}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {view === 'orgs' && (
                    <div className="org-management">
                        <div className="admin-card org-form-card">
                            <h2>Add New Organization</h2>
                            <form onSubmit={handleCreateOrg} className="org-form">
                                <div className="form-grid-three">
                                    <div className="input-group">
                                        <label>Org Name</label>
                                        <input value={newOrg.name} onChange={e => setNewOrg({ ...newOrg, name: e.target.value })} placeholder="e.g. Airport Metro Station" required />
                                    </div>
                                    <div className="input-group">
                                        <label>Location Area</label>
                                        <input value={newOrg.location} onChange={e => setNewOrg({ ...newOrg, location: e.target.value })} placeholder="e.g. Terminal 1" required />
                                    </div>
                                    <div className="input-group">
                                        <label>Parking Capacity</label>
                                        <input type="number" value={newOrg.capacity} onChange={e => setNewOrg({ ...newOrg, capacity: e.target.value })} placeholder="e.g. 20" />
                                    </div>
                                </div>
                                <div className="input-group" style={{ marginTop: '1rem' }}>
                                    <label>Parking Details / Instructions</label>
                                    <input value={newOrg.parkingDetails} onChange={e => setNewOrg({ ...newOrg, parkingDetails: e.target.value })} placeholder="e.g. Basement 2, Slots 40-60" />
                                </div>
                                <button type="submit" className="btn-primary" style={{ marginTop: '1.5rem', width: '220px' }} disabled={orgLoading}>
                                    {orgLoading ? 'Creating...' : '+ Create Hub'}
                                </button>
                            </form>
                        </div>

                        <div className="approvals-grid">
                            {orgs.map(org => (
                                <div key={org._id} className="approval-card org-card">
                                    <div className="approval-content">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <h3 style={{ margin: 0 }}>{org.name}</h3>
                                                <p className="owner-tag" style={{ marginTop: '4px' }}>📍 {org.location}</p>
                                            </div>
                                            <span className="status-text available">Active Hub</span>
                                        </div>
                                        <div className="approval-specs" style={{ margin: '1rem 0' }}>
                                            <span>Slots: {org.capacity || 'N/A'}</span>
                                            <span>ℹ️ {org.parkingDetails || 'No details added'}</span>
                                        </div>
                                        <button className="btn-outline" onClick={() => handleDeleteOrg(org._id)} style={{ width: '100%', color: '#ff4d4d', borderColor: 'rgba(255, 77, 77, 0.3)' }}>Delete Hub</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {view === 'users' && (
                    <div className="admin-card">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Customer Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>{u.phone}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {editingCar && (
                    <div className="modal-overlay" onClick={() => setEditingCar(null)}>
                        <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header-row">
                                <h2>Edit Vehicle Details</h2>
                                <button className="modal-close-x" onClick={() => setEditingCar(null)}>&times;</button>
                            </div>

                            <div className="edit-form">
                                <div className="input-group">
                                    <label>Vehicle Identity</label>
                                    <input value={`${editingCar.brand} ${editingCar.model} (${editingCar.year})`} disabled />
                                    <span className="input-note">Brand, model, and year are locked.</span>
                                </div>

                                <div className="input-group">
                                    <label>Operational Status</label>
                                    <select
                                        value={editingCar.status}
                                        onChange={(e) => setEditingCar({ ...editingCar, status: e.target.value })}
                                        className="modal-select"
                                    >
                                        <option value="Available">Ideal at Location (Available)</option>
                                        <option value="Rented">On Ride (Rented)</option>
                                        <option value="Maintenance">Under Maintenance</option>
                                    </select>
                                </div>

                                <div className="modal-footer">
                                    <button className="btn-outline" onClick={() => setEditingCar(false)}>Discard Changes</button>
                                    <button className="btn-primary" onClick={handleSave}>Save Updates</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default AdminDashboard;
