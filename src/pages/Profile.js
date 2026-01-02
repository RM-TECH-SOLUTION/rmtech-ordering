import React, { useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/auth/auth.reducer";
import { useNavigate } from "react-router-dom";
import "../styles/pages/Profile.scss";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaEdit,
  FaSignOutAlt,
  FaShieldAlt,
  FaBell,
  FaCreditCard,
  FaHeart,
  FaShoppingBag,
  FaStar,
  FaHistory,
  FaLock,
  FaCheckCircle,
  FaCog,
  FaQuestionCircle,
  FaShareAlt,
  FaTrophy,
  FaCrown,
  FaBolt
} from "react-icons/fa";

function Profile() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock user data (you can replace with actual user data)
  const userData = {
    ...user,
    name: user?.name || "John Doe",
    email: user?.email || "john.doe@example.com",
    phone: user?.phone || "+1 (234) 567-8900",
    joinedDate: "January 15, 2023",
    loyaltyPoints: 1250,
    memberLevel: "Gold",
    totalOrders: 24,
    totalSpent: 12500,
    favoriteRestaurants: 8,
    addresses: 3
  };

  if (!user) return null;

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Get user initial for avatar
  const getUserInitial = () => {
    return userData.name.charAt(0).toUpperCase();
  };

  // Get member level color
  const getMemberLevelColor = (level) => {
    switch(level.toLowerCase()) {
      case 'platinum': return '#e5e4e2';
      case 'gold': return '#ffd700';
      case 'silver': return '#c0c0c0';
      case 'bronze': return '#cd7f32';
      default: return '#667eea';
    }
  };

  return (
    <div className="profile">
      <div className="profile__container">
        {/* Header */}
        <div className="profile__header">
          <h1 className="profile__title">
            <FaUser className="icon" />
            My Profile
          </h1>
          <p className="profile__subtitle">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="profile__content">
          {/* Left Sidebar */}
          <div className="profile__sidebar">
            {/* User Card */}
            <div className="user-card">
              <div className="user-avatar">
                <div className="avatar-circle">
                  {getUserInitial()}
                </div>
                <div className="user-status">
                  <span className="status-dot"></span>
                  <span>Active</span>
                </div>
              </div>
              
              <div className="user-info">
                <h3 className="user-name">{userData.name}</h3>
                <div className="user-member-level">
                  <FaCrown className="icon" style={{ color: getMemberLevelColor(userData.memberLevel) }} />
                  <span>{userData.memberLevel} Member</span>
                </div>
                <p className="user-email">{userData.email}</p>
              </div>

              <div className="user-stats">
                <div className="stat-item">
                  <div className="stat-icon">
                    <FaShoppingBag />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{userData.totalOrders}</span>
                    <span className="stat-label">Orders</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">
                    <FaTrophy />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{userData.loyaltyPoints}</span>
                    <span className="stat-label">Points</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="profile-nav">
              <button 
                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <FaUser className="icon" />
                <span>Profile</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <FaShoppingBag className="icon" />
                <span>My Orders</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
                onClick={() => setActiveTab('addresses')}
              >
                <FaMapMarkerAlt className="icon" />
                <span>Addresses</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
                onClick={() => setActiveTab('favorites')}
              >
                <FaHeart className="icon" />
                <span>Favorites</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <FaLock className="icon" />
                <span>Security</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <FaBell className="icon" />
                <span>Notifications</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'payment' ? 'active' : ''}`}
                onClick={() => setActiveTab('payment')}
              >
                <FaCreditCard className="icon" />
                <span>Payment Methods</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <FaCog className="icon" />
                <span>Settings</span>
              </button>
            </div>

            {/* Logout Button */}
            <button 
              className="logout-btn"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="icon" />
              <span>Logout</span>
            </button>
          </div>

          {/* Main Content */}
          <div className="profile__main">
            {/* Profile Information */}
            <div className="profile-section">
              <div className="section-header">
                <h2 className="section-title">Personal Information</h2>
                <button 
                  className="btn btn--outline btn--small"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <FaEdit className="icon" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              <div className="info-grid">
                <div className="info-card">
                  <div className="info-icon">
                    <FaUser />
                  </div>
                  <div className="info-content">
                    <label className="info-label">Full Name</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        defaultValue={userData.name}
                        className="info-input"
                      />
                    ) : (
                      <p className="info-value">{userData.name}</p>
                    )}
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <FaPhone />
                  </div>
                  <div className="info-content">
                    <label className="info-label">Phone Number</label>
                    {isEditing ? (
                      <input 
                        type="tel" 
                        defaultValue={userData.phone}
                        className="info-input"
                      />
                    ) : (
                      <p className="info-value">{userData.phone}</p>
                    )}
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <FaEnvelope />
                  </div>
                  <div className="info-content">
                    <label className="info-label">Email Address</label>
                    {isEditing ? (
                      <input 
                        type="email" 
                        defaultValue={userData.email}
                        className="info-input"
                      />
                    ) : (
                      <p className="info-value">{userData.email}</p>
                    )}
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <FaCalendarAlt />
                  </div>
                  <div className="info-content">
                    <label className="info-label">Member Since</label>
                    <p className="info-value">{userData.joinedDate}</p>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="edit-actions">
                  <button 
                    className="btn btn--outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn--primary"
                    onClick={() => {
                      // Save changes logic here
                      setIsEditing(false);
                    }}
                  >
                    <FaCheckCircle className="icon" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {/* Account Overview */}
            <div className="profile-section">
              <h2 className="section-title">Account Overview</h2>
              
              <div className="overview-grid">
                <div className="overview-card">
                  <div className="overview-icon loyalty">
                    <FaTrophy />
                  </div>
                  <div className="overview-content">
                    <h4>Loyalty Points</h4>
                    <p className="overview-value">{userData.loyaltyPoints} pts</p>
                    <p className="overview-subtext">Earned from orders</p>
                  </div>
                  <button className="btn btn--text">View Details</button>
                </div>

                <div className="overview-card">
                  <div className="overview-icon orders">
                    <FaShoppingBag />
                  </div>
                  <div className="overview-content">
                    <h4>Total Orders</h4>
                    <p className="overview-value">{userData.totalOrders}</p>
                    <p className="overview-subtext">Orders placed</p>
                  </div>
                  <button 
                    className="btn btn--text"
                    onClick={() => navigate("/orders")}
                  >
                    View History
                  </button>
                </div>

                <div className="overview-card">
                  <div className="overview-icon spent">
                    <FaCreditCard />
                  </div>
                  <div className="overview-content">
                    <h4>Total Spent</h4>
                    <p className="overview-value">₹{userData.totalSpent}</p>
                    <p className="overview-subtext">Lifetime spending</p>
                  </div>
                </div>

                <div className="overview-card">
                  <div className="overview-icon favorite">
                    <FaHeart />
                  </div>
                  <div className="overview-content">
                    <h4>Favorites</h4>
                    <p className="overview-value">{userData.favoriteRestaurants}</p>
                    <p className="overview-subtext">Restaurants saved</p>
                  </div>
                  <button 
                    className="btn btn--text"
                    onClick={() => setActiveTab('favorites')}
                  >
                    View All
                  </button>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="profile-section">
              <h2 className="section-title">Security & Privacy</h2>
              
              <div className="security-grid">
                <div className="security-card">
                  <div className="security-header">
                    <FaShieldAlt className="icon" />
                    <h4>Password</h4>
                  </div>
                  <p>Change your password regularly to keep your account secure</p>
                  <button className="btn btn--outline btn--small">
                    Change Password
                  </button>
                </div>

                <div className="security-card">
                  <div className="security-header">
                    <FaLock className="icon" />
                    <h4>Two-Factor Authentication</h4>
                  </div>
                  <p>Add an extra layer of security to your account</p>
                  <button className="btn btn--outline btn--small">
                    Enable 2FA
                  </button>
                </div>

                <div className="security-card">
                  <div className="security-header">
                    <FaBell className="icon" />
                    <h4>Login Alerts</h4>
                  </div>
                  <p>Get notified about new logins to your account</p>
                  <div className="toggle-switch">
                    <input type="checkbox" id="login-alerts" defaultChecked />
                    <label htmlFor="login-alerts"></label>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="profile-section">
              <div className="section-header">
                <h2 className="section-title">Recent Activity</h2>
                <button className="btn btn--text" onClick={() => navigate("/orders")}>
                  View All Activity
                </button>
              </div>
              
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon success">
                    <FaCheckCircle />
                  </div>
                  <div className="activity-content">
                    <h4>Order Delivered</h4>
                    <p>Order #ORD-78945 was successfully delivered</p>
                    <span className="activity-time">2 hours ago</span>
                  </div>
                </div>

                <div className="activity-item">
                  <div className="activity-icon info">
                    <FaStar />
                  </div>
                  <div className="activity-content">
                    <h4>Review Added</h4>
                    <p>You reviewed "Spicy Chicken Pizza"</p>
                    <span className="activity-time">1 day ago</span>
                  </div>
                </div>

                <div className="activity-item">
                  <div className="activity-icon warning">
                    <FaHistory />
                  </div>
                  <div className="activity-content">
                    <h4>Order Processing</h4>
                    <p>Order #ORD-78944 is being prepared</p>
                    <span className="activity-time">2 days ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h3 className="actions-title">Quick Actions</h3>
              <div className="actions-grid">
                <button 
                  className="action-card"
                  onClick={() => navigate("/orders")}
                >
                  <div className="action-icon">
                    <FaHistory />
                  </div>
                  <span>Order History</span>
                </button>
                <button 
                  className="action-card"
                  onClick={() => navigate("/address")}
                >
                  <div className="action-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <span>Manage Addresses</span>
                </button>
                <button 
                  className="action-card"
                  onClick={() => navigate("/categories")}
                >
                  <div className="action-icon">
                    <FaBolt />
                  </div>
                  <span>Quick Reorder</span>
                </button>
                <button 
                  className="action-card"
                  onClick={() => {/* Invite friends logic */}}
                >
                  <div className="action-icon">
                    <FaShareAlt />
                  </div>
                  <span>Invite Friends</span>
                </button>
                <button 
                  className="action-card"
                  onClick={() => setActiveTab('payment')}
                >
                  <div className="action-icon">
                    <FaCreditCard />
                  </div>
                  <span>Payment Methods</span>
                </button>
                <button 
                  className="action-card"
                  onClick={() => setActiveTab('settings')}
                >
                  <div className="action-icon">
                    <FaCog />
                  </div>
                  <span>Account Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;