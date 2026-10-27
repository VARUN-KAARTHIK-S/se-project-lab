import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './ListCar.css';
import { submitCar, fetchPartnerCars, deleteCar as deleteCarApi, fetchOrgs, updateCar as updateCarApi } from '../services/api';

function ListCar() {
    const [activeTab, setActiveTab] = useState('view');
    const [imageUrls, setImageUrls] = useState(['']);
    const [localFiles, setLocalFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const PARTNER_ID = '6997efa51fcfe6e7ae4f34fc';

    const [formData, setFormData] = useState({
        brand: '', model: '', year: '', fuelType: 'Petrol',
        isTBoard: false, dailyRate: '', kmRate: '',
        allowedKm: '300', location: '', organization: ''
    });

    const [orgs, setOrgs] = useState([]);

    const [myCars, setMyCars] = useState([]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [fleetRes, orgsRes] = await Promise.all([
                    fetchPartnerCars(PARTNER_ID),
                    fetchOrgs()
                ]);
                setMyCars(fleetRes.data);
                setOrgs(orgsRes.data);
            } catch (error) {
                console.error("Error loading initial data:", error);
            }
        };
        loadInitialData();
    }, []);

    const [showSuccess, setShowSuccess] = useState(false);
    const [viewingCar, setViewingCar] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);

    const startEditing = () => {
        setEditData({ ...viewingCar });
        setIsEditing(true);
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const saveEdit = async () => {
        setLoading(true);
        try {
            const data = new FormData();
            data.append('dailyRate', Number(editData.dailyRate));
            data.append('kmRate', Number(editData.kmRate));
            data.append('allowedKm', Number(editData.allowedKm));
            data.append('location', editData.location);
            const orgId = typeof editData.organization === 'object' ? editData.organization?._id : editData.organization;
            if (orgId) data.append('organization', orgId);

            if (editData.images && editData.images.length > 0) {
                editData.images.forEach(img => {
                    if (img) data.append('images', img);
                });
            }

            localFiles.forEach(file => {
                data.append('carImages', file);
            });

            const response = await updateCarApi(editData._id, data);
            setMyCars(myCars.map(c => c._id === editData._id ? response.data : c));
            setViewingCar(response.data);
            setIsEditing(false);
            setLocalFiles([]);
            alert('Details and images updated successfully!');
        } catch (error) {
            console.error("Update error:", error);
            alert("Failed to update car details: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'organization') {
            const selectedOrg = orgs.find(o => o._id === value);
            setFormData(prev => ({
                ...prev,
                organization: value,
                location: selectedOrg ? `${selectedOrg.name} (${selectedOrg.location})` : ''
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageUrlChange = (index, value) => {
        const newUrls = [...imageUrls];
        newUrls[index] = value;
        setImageUrls(newUrls);
    };

    const addImageField = () => setImageUrls([...imageUrls, '']);
    const removeImageField = (index) => {
        if (imageUrls.length > 1) {
            setImageUrls(imageUrls.filter((_, i) => i !== index));
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setLocalFiles(prev => [...prev, ...files]);
    };

    const removeLocalFile = (index) => {
        setLocalFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const hasUrlImage = imageUrls.some(url => url.trim() !== '');
        const hasLocalImage = localFiles.length > 0;

        if (!hasUrlImage && !hasLocalImage) {
            alert("Please provide at least one image of the vehicle (either a local file or a URL).");
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();

            data.append('brand', formData.brand);
            data.append('model', formData.model);
            data.append('year', Number(formData.year));
            data.append('fuelType', formData.fuelType);
            data.append('isTBoard', formData.isTBoard);
            data.append('dailyRate', Number(formData.dailyRate));
            data.append('kmRate', Number(formData.kmRate));
            data.append('allowedKm', Number(formData.allowedKm));
            data.append('location', formData.location);
            data.append('organization', formData.organization);
            data.append('owner', PARTNER_ID);

            imageUrls.forEach(url => {
                if (url.trim()) data.append('images', url);
            });

            localFiles.forEach(file => {
                data.append('carImages', file);
            });

            const response = await submitCar(data);
            setMyCars([response.data, ...myCars]);
            setShowSuccess(true);

            setFormData({
                brand: '', model: '', year: '', fuelType: 'Petrol',
                isTBoard: false, dailyRate: '', kmRate: '',
                allowedKm: '300', location: '', organization: ''
            });
            setImageUrls(['']);
            setLocalFiles([]);

            setTimeout(() => {
                setShowSuccess(false);
                setActiveTab('view');
            }, 2000);
        } catch (error) {
            console.error("Submission error:", error.response?.data || error.message);
            alert("Error listing car: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const removeCar = async (id) => {
        if (window.confirm('Are you sure you want to remove this car?')) {
            try {
                await deleteCarApi(id);
                setMyCars(myCars.filter(car => car._id !== id));
            } catch (error) {
                console.error(error);
                alert("Error removing car.");
            }
        }
    };

    return (
        <div className="listcar-container">
            <Navbar role="partner" />

            <header className="listcar-header">
                <div className="header-content">
                    <h1>Partner Dashboard</h1>
                    <div className="dashboard-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'view' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('view'); setViewingCar(null); }}
                        >
                            View Fleet
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('add'); setViewingCar(null); }}
                        >
                            List Another Vehicle
                        </button>
                    </div>
                </div>
                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-label">Your Active Cars</span>
                        <span className="stat-value">{myCars.length}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Organization</span>
                        <span className="stat-value verified" style={{ fontSize: '1rem' }}>Nellore Rentals</span>
                    </div>
                </div>
            </header>

            <main className="listcar-main single-col">
                {activeTab === 'add' ? (
                    <section className="form-section">
                        <div className="glass-card">
                            <h2>List Another Vehicle</h2>
                            <form onSubmit={handleSubmit} className="listing-form">
                                <div className="form-grid">
                                    <div className="form-group"><label>Brand</label><input type="text" name="brand" placeholder="e.g. Toyota" value={formData.brand} onChange={handleChange} required /></div>
                                    <div className="form-group"><label>Model</label><input type="text" name="model" placeholder="e.g. Fortuner" value={formData.model} onChange={handleChange} required /></div>
                                    <div className="form-group"><label>Model Year</label><input type="number" name="year" placeholder="2024" value={formData.year} onChange={handleChange} required /></div>
                                    <div className="form-group">
                                        <label>Fuel Type</label>
                                        <select name="fuelType" value={formData.fuelType} onChange={handleChange}>
                                            <option value="Petrol">Petrol</option>
                                            <option value="Diesel">Diesel</option>
                                            <option value="EV">Electric (EV)</option>
                                            <option value="CNG">CNG</option>
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Daily Rate (₹)</label><input type="number" name="dailyRate" placeholder="e.g. 5000" value={formData.dailyRate} onChange={handleChange} required /></div>
                                    <div className="form-group"><label>Allowed KM per Day</label><input type="number" name="allowedKm" placeholder="e.g. 300" value={formData.allowedKm} onChange={handleChange} required /></div>
                                    <div className="form-group">
                                        <label>Select Organization (Hub)</label>
                                        <select name="organization" value={formData.organization} onChange={handleChange} required>
                                            <option value="">-- Select Hub --</option>
                                            {orgs.map(org => (
                                                <option key={org._id} value={org._id}>{org.name} - {org.location}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Static Location (Auto-filled)</label>
                                        <input type="text" value={formData.location} disabled placeholder="Select a Hub above" />
                                    </div>
                                    <div className="form-group">
                                        <label className="checkbox-container">
                                            <input type="checkbox" name="isTBoard" checked={formData.isTBoard} onChange={handleChange} />
                                            <span className="checkmark"></span>
                                            T-Board?
                                        </label>
                                    </div>
                                </div>

                                <div className="image-uploads-section" style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #222' }}>
                                    <label style={{ color: '#888', display: 'block', marginBottom: '1rem' }}>Upload Local Images (Multiple)</label>
                                    <div className="file-upload-wrapper">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            id="file-input"
                                            style={{ display: 'none' }}
                                        />
                                        <label htmlFor="file-input" className="add-img-btn" style={{ display: 'inline-block', cursor: 'pointer' }}>
                                            + Select Local Images
                                        </label>
                                    </div>

                                    {localFiles.length > 0 && (
                                        <div className="selected-files-list" style={{ marginTop: '1rem' }}>
                                            {localFiles.map((file, idx) => (
                                                <div key={idx} className="image-input-row" style={{ background: 'rgba(255,255,255,0.05)', padding: '5px 10px', borderRadius: '4px', marginBottom: '5px' }}>
                                                    <span style={{ fontSize: '0.85rem', color: '#ccc' }}>{file.name}</span>
                                                    <button type="button" className="remove-img-btn" onClick={() => removeLocalFile(idx)}>×</button>
                                                </div>
                                            ))}
                                            <p style={{ fontSize: '0.8rem', color: '#4facfe', marginTop: '5px' }}>Total: {localFiles.length} local file(s)</p>
                                        </div>
                                    )}
                                </div>

                                <div className="image-urls-section">
                                    <label>Or provide Image URLs</label>
                                    {imageUrls.map((url, idx) => (
                                        <div key={idx} className="image-input-row">
                                            <input
                                                type="url"
                                                placeholder="https://image-link.com/car.jpg"
                                                value={url}
                                                onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                                            />
                                            {imageUrls.length > 1 && (
                                                <button type="button" className="remove-img-btn" onClick={() => removeImageField(idx)}>×</button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" className="add-img-btn" onClick={addImageField}>+ Add More URLs</button>
                                </div>

                                <button type="submit" className="submit-btn" disabled={loading || showSuccess}>
                                    {loading ? 'Submitting...' : showSuccess ? '✅ Success!' : 'Submit Vehicle for Listing'}
                                </button>
                            </form>
                        </div>
                    </section>
                ) : viewingCar ? (
                    <section className="detail-section">
                        <div className="glass-card detail-view">
                            <div className="detail-nav">
                                <button className="back-to-fleet" onClick={() => { setViewingCar(null); setIsEditing(false); }}>← Back to Fleet</button>
                                {!isEditing && (
                                    <div className="detail-actions">
                                        <button className="edit-details-btn" onClick={startEditing}>✎ Edit Details</button>
                                        <button className="remove-car-btn-large" onClick={() => { removeCar(viewingCar._id); setViewingCar(null); }}>Remove Vehicle</button>
                                    </div>
                                )}
                            </div>

                            <div className="detail-header">
                                <div className="detail-info">
                                    <h1>{viewingCar.brand} {viewingCar.model}</h1>
                                    <span className={`status-pill ${viewingCar.status.toLowerCase()}`}>{viewingCar.status}</span>
                                </div>
                            </div>

                            {isEditing ? (
                                <div className="edit-container-inner">
                                    <div className="edit-form-grid">
                                        <div className="form-group"><label>Daily Rate (₹)</label><input type="number" name="dailyRate" value={editData.dailyRate} onChange={handleEditChange} /></div>
                                        <div className="form-group"><label>Allowed KM/Day</label><input type="number" name="allowedKm" value={editData.allowedKm} onChange={handleEditChange} /></div>
                                        <div className="form-group"><label>Rate per KM (₹)</label><input type="number" name="kmRate" value={editData.kmRate} onChange={handleEditChange} /></div>
                                        <div className="form-group"><label>Location</label><input type="text" name="location" value={editData.location} onChange={handleEditChange} /></div>
                                        <div className="form-group">
                                            <label>Change Hub (Organization)</label>
                                            <select name="organization" value={typeof editData.organization === 'object' ? editData.organization?._id : editData.organization}
                                                onChange={(e) => {
                                                    const org = orgs.find(o => o._id === e.target.value);
                                                    setEditData({ ...editData, organization: e.target.value, location: org ? `${org.name} (${org.location})` : editData.location });
                                                }}>
                                                <option value="">-- Select Hub --</option>
                                                {orgs.map(o => (
                                                    <option key={o._id} value={o._id}>{o.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="edit-images-section">
                                        <h3>Manage Vehicle Images</h3>

                                        <div className="current-images-grid">
                                            {editData.images && editData.images.map((img, idx) => (
                                                <div key={idx} className={`edit-img-card ${idx === 0 ? 'primary-img' : ''}`}>
                                                    <img src={img} alt="Vehicle" />
                                                    {idx === 0 && <span className="primary-tag">PRIMARY</span>}
                                                    <div className="img-ctrls">
                                                        {idx > 0 && (
                                                            <button type="button" onClick={() => {
                                                                const newImgs = [...editData.images];
                                                                [newImgs[idx], newImgs[idx - 1]] = [newImgs[idx - 1], newImgs[idx]];
                                                                setEditData({ ...editData, images: newImgs });
                                                            }} title="Move Left">←</button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditData({ ...editData, images: editData.images.filter((_, i) => i !== idx) })}
                                                            className="remove-img-icon"
                                                            title="Remove"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="add-edit-img-controls">
                                            <div className="edit-img-url-input">
                                                <label>Add Image by URL</label>
                                                <div className="url-input-group">
                                                    <input
                                                        type="text"
                                                        id="new-edit-url"
                                                        placeholder="https://..."
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const inp = document.getElementById('new-edit-url');
                                                            if (inp.value.trim()) {
                                                                setEditData({ ...editData, images: [...(editData.images || []), inp.value.trim()] });
                                                                inp.value = '';
                                                            }
                                                        }}
                                                        className="add-url-btn"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="add-new-images-edit">
                                                <label className="upload-label-btn">
                                                    📁 Upload Local Files
                                                    <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                                </label>
                                                {localFiles.length > 0 && (
                                                    <div className="edit-local-files">
                                                        {localFiles.map((f, i) => (
                                                            <div key={i} className="edit-file-row">
                                                                <span>📄 {f.name}</span>
                                                                <button type="button" onClick={() => removeLocalFile(i)}>Remove</button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="edit-footer">
                                        <button className="cancel-edit-btn" onClick={() => { setIsEditing(false); setLocalFiles([]); }}>Cancel</button>
                                        <button className="save-edit-btn" onClick={saveEdit} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="detail-grid">
                                    <div className="detail-images">
                                        {viewingCar.images && viewingCar.images.map((img, i) => (
                                            <img key={i} src={img} alt="Vehicle" />
                                        ))}
                                    </div>
                                    <div className="detail-specs">
                                        <div className="spec-item"><span className="spec-label">Year</span><span className="spec-val">{viewingCar.year}</span></div>
                                        <div className="spec-item"><span className="spec-label">Fuel</span><span className="spec-val">{viewingCar.fuelType}</span></div>
                                        <div className="spec-item"><span className="spec-label">Rate</span><span className="spec-val">₹{viewingCar.dailyRate}/day</span></div>
                                        <div className="spec-item"><span className="spec-label">KM Limit</span><span className="spec-val">{viewingCar.allowedKm} KM/day</span></div>
                                        <div className="spec-item"><span className="spec-label">Location</span><span className="spec-val">{viewingCar.location}</span></div>
                                        <div className="spec-item"><span className="spec-label">Assigned Hub</span><span className="spec-val" style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>{viewingCar.organization?.name || 'No Hub Assigned'}</span></div>
                                        <div className="spec-item"><span className="spec-label">Parking Info</span><span className="spec-val">{viewingCar.organization?.parkingDetails || 'N/A'}</span></div>
                                        <div className="spec-item"><span className="spec-label">Type</span><span className="spec-val">{viewingCar.isTBoard ? 'Commercial' : 'Private'}</span></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                ) : (
                    <section className="fleet-section">
                        <div className="fleet-grid">
                            {myCars.map(car => (
                                <div key={car._id} className="car-card-partner">
                                    <div className="car-partner-img">
                                        <img src={car.images && car.images[0] ? car.images[0] : 'https://via.placeholder.com/300'} alt={car.model} />
                                        <span className={`status-tag ${car.status.toLowerCase()}`}>{car.status}</span>
                                    </div>
                                    <div className="car-partner-content">
                                        <h3>{car.brand} {car.model}</h3>
                                        <p style={{ color: 'var(--accent-blue)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>🏦 {car.organization?.name || 'Unassigned Hub'}</p>
                                        <p>{car.year} • {car.fuelType} • {car.allowedKm} KM/day</p>
                                        <div className="car-partner-actions">
                                            <button className="view-btn" onClick={() => setViewingCar(car)}>View Details</button>
                                            <button className="delete-icon-btn" onClick={() => removeCar(car._id)} title="Remove Car">🗑</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="add-car-placeholder" onClick={() => setActiveTab('add')}>
                                <span className="plus-icon">+</span>
                                <p>List Another Vehicle</p>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {showSuccess && (
                <div className="success-toast">
                    ✅ Vehicle listed successfully! Redirecting to fleet...
                </div>
            )}
        </div>
    );
}

export default ListCar;
