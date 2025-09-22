// [profile.jsx](file:///C:\Users\inoninja\AniME-YOU-NEW\src\pages\profile.jsx)
import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaHeart, FaCog,FaUser, FaCreditCard, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom'; 
import './profile.css';
import { useUser } from '../contexts/UserContext';
import LogoutButton from '../components/LogoutButton';


const Profile = () => {
    const { user } = useUser();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user || user.isGuest) {
                setLoading(false);
                return;
            }

            try {
                const API_URL = 'https://bookstore-0hqj.onrender.com';
                // Use the /api/orders/myorders endpoint instead
                const response = await fetch(`${API_URL}/api/orders/myorders`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }

                const data = await response.json();
                setOrders(data);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Failed to load orders. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);


    return (
    <div className="app" style={{ minHeight: "100vh" }}>
        <div className="profile-main" style={{ minHeight: "calc(100vh - 150px)" }}>
            <aside className="sidebar">
                <div className="profile-info">
                    <div className="avatar-placeholder">👤</div>
                    {/* Display user's name from context, or "Guest" if not available */}
                    <h2>{user ? (user.firstName || user.name || 'Guest') : 'Guest'}</h2> 
                </div>
                <nav className="menu-list">
                  <LogoutButton />
    
                    <Link to="/profile" className="menu-item"><FaUser /> Profile</Link>
                    <Link to="/settings" className="menu-item"><FaCog /> Settings</Link>
                    <Link to="/payments" className="menu-item"><FaCreditCard /> Payments</Link>
                    <Link to="/address" className="menu-item active"><FaMapMarkerAlt /> Address</Link>
                                      
                </nav>
            </aside>

            <div className="main-content" style={{ minHeight: "calc(100vh - 200px)" }}>
               {/* Conditionally render user details if user is logged in  */}
               {user && (
                <div>
                    <p>Email: {user.email}</p>
                    <p>Phone: {user.phone || user.phoneNumber || user.address?.telephone || 'Not provided'}</p>
                    <p>Registration Date: {user.registrationDate}</p>
                    {/* Add more user details as needed */}
                </div>
                )}
                <div className="order-section">
                    <h2>Completed Orders</h2>
                    {loading ? (
                        <p>Loading your orders...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : orders.length > 0 ? (
                        <div className="order-grid">
                            {orders.map(order => (
                                <div key={order._id} className="order-card">
                                    <div className="order-header">
                                        <span>Order #{order._id.substring(0, 8)}</span>
                                        <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="order-items">
                                        {order.orderItems.map((item, index) => (
                                            <div key={index} className="order-item">
                                                <img src={item.image} alt={item.name} />
                                                <div className="item-details">
                                                    <h4>{item.name}</h4>
                                                    <p>Qty: {item.qty}</p>
                                                    <p>₱{item.price.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="order-footer">
                                        <p className="order-status">Status: {order.status}</p>
                                        <p className="order-total">Total: ₱{order.totalPrice.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>You don't have any completed orders yet.</p>
                    )}
                </div>
            </div>
        </div>
    </div>
    );
};

export default Profile;
