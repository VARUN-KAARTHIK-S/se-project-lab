import { useState } from "react";
import { Link } from "react-router-dom";
import "./Auth.css";

function Signuppage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "CUSTOMER",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Signup Data:", formData);
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Create Account</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                        required
                    />
                    <select name="role" onChange={handleChange}>
                        <option value="CUSTOMER">Customer</option>
                        <option value="OWNER">Car Owner</option>
                    </select>

                    <button type="submit">SIGN UP</button>
                </form>

                <p>
                    Already have an account? <Link to="/signin">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Signuppage;
