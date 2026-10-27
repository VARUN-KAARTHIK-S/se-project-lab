import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Signinpage() {
    const navigate = useNavigate();

    const handleRoleLogin = (role) => {
        localStorage.setItem('userRole', role);
        if (role === 'admin') {
            navigate('/admin-dashboard');
        } else if (role === 'partner') {
            navigate('/list-car');
        } else {
            navigate('/');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Welcome</h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>
                    Quick Login: Select your user type
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        className="role-selection-btn"
                        onClick={() => handleRoleLogin('customer')}
                        style={{ padding: '15px', borderRadius: '10px', border: '1px solid #fff', background: '#fff', color: '#000', fontWeight: '700', cursor: 'pointer', textTransform: 'uppercase' }}
                    >
                        Login as Customer
                    </button>

                    <button
                        className="role-selection-btn"
                        onClick={() => handleRoleLogin('partner')}
                        style={{ padding: '15px', borderRadius: '10px', border: '1px solid #333', background: '#111', color: '#fff', fontWeight: '600', cursor: 'pointer', textTransform: 'uppercase' }}
                    >
                        Login as Car Owner (Partner)
                    </button>

                    <button
                        className="role-selection-btn"
                        onClick={() => handleRoleLogin('admin')}
                        style={{ padding: '15px', borderRadius: '10px', border: '1px solid #ff3e3e', background: 'rgba(255,62,62,0.1)', color: '#ff3e3e', fontWeight: '600', cursor: 'pointer', textTransform: 'uppercase' }}
                    >
                        Login as Admin
                    </button>
                </div>

                <p style={{ marginTop: '2.5rem' }}>
                    New here? <Link to="/signup">Create account</Link>
                </p>
            </div>
        </div>
    );
}

export default Signinpage;
