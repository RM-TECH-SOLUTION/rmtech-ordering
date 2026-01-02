import React, { useState } from 'react';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "../styles/pages/OrderHistory.scss";
import {
  FaShoppingBag,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCreditCard,
  FaBox,
  FaShippingFast,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaFilter,
  FaSearch,
  FaArrowRight,
  FaRedo,
  FaStar,
  FaTruck,
  FaHome,
  FaPhone,
  FaUndo,
  FaEye
} from "react-icons/fa";

function OrderHistory() {
  const orders = useSelector((state) => state.orders.orders || []);
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    
    try {
      const options = { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (error) {
      return "Invalid date";
    }
  };

  // Get order ID as string and truncate if needed
  const getOrderId = (orderId) => {
    if (!orderId) return 'N/A';
    
    // Convert to string if it's a number
    const idString = orderId.toString();
    
    // Take last 8 characters for display
    return idString.length > 8 ? idString.slice(-8) : idString;
  };

  // Calculate total items in an order
  const calculateTotalItems = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + (item.qty || 0), 0);
  };

  // Get status icon and color
  const getStatusInfo = (status) => {
    const statusLower = (status || '').toLowerCase();
    
    switch(statusLower) {
      case 'delivered':
        return {
          icon: <FaCheckCircle />,
          color: '#1dbf73',
          bgColor: 'rgba(29, 191, 115, 0.1)',
          label: 'Delivered'
        };
      case 'shipped':
      case 'on the way':
      case 'ontheway':
        return {
          icon: <FaShippingFast />,
          color: '#2196f3',
          bgColor: 'rgba(33, 150, 243, 0.1)',
          label: 'Shipped'
        };
      case 'processing':
        return {
          icon: <FaBox />,
          color: '#ffa726',
          bgColor: 'rgba(255, 167, 38, 0.1)',
          label: 'Processing'
        };
      case 'pending':
        return {
          icon: <FaClock />,
          color: '#ffa726',
          bgColor: 'rgba(255, 167, 38, 0.1)',
          label: 'Pending'
        };
      case 'cancelled':
        return {
          icon: <FaTimesCircle />,
          color: '#ff6b6b',
          bgColor: 'rgba(255, 107, 107, 0.1)',
          label: 'Cancelled'
        };
      default:
        return {
          icon: <FaClock />,
          color: '#718096',
          bgColor: 'rgba(113, 128, 150, 0.1)',
          label: status || 'Unknown'
        };
    }
  };

  // Calculate order total
  const calculateOrderTotal = (order) => {
    if (order.total !== undefined) return order.total;
    if (order.items && Array.isArray(order.items)) {
      return order.items.reduce((sum, item) => 
        sum + (Number(item.price || 0) * (item.qty || 0)), 0
      );
    }
    return 0;
  };

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const orderIdString = order.id ? order.id.toString() : '';
      const matchesSearch = 
        orderIdString.includes(searchLower) ||
        (order.items && Array.isArray(order.items) && order.items.some(item => 
          (item.name || '').toLowerCase().includes(searchLower)
        )) ||
        (order.status || '').toLowerCase().includes(searchLower);
      
      // Status filter
      const matchesStatus = 
        statusFilter === 'all' || 
        (order.status || '').toLowerCase() === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by date
      const dateA = a.date || a.createdAt || 0;
      const dateB = b.date || b.createdAt || 0;
      
      if (sortBy === 'newest') {
        return new Date(dateB) - new Date(dateA);
      } else if (sortBy === 'oldest') {
        return new Date(dateA) - new Date(dateB);
      } else if (sortBy === 'highest') {
        return calculateOrderTotal(b) - calculateOrderTotal(a);
      } else if (sortBy === 'lowest') {
        return calculateOrderTotal(a) - calculateOrderTotal(b);
      }
      return 0;
    });

  // Get status counts for filter tabs
  const statusCounts = {
    all: orders.length,
    delivered: orders.filter(o => (o.status || '').toLowerCase() === 'delivered').length,
    shipped: orders.filter(o => (o.status || '').toLowerCase() === 'shipped').length,
    processing: orders.filter(o => (o.status || '').toLowerCase() === 'processing').length,
    pending: orders.filter(o => (o.status || '').toLowerCase() === 'pending').length,
    cancelled: orders.filter(o => (o.status || '').toLowerCase() === 'cancelled').length,
  };

  if (orders.length === 0) {
    return (
      <div className="order-history-empty">
        <div className="empty-container">
          <div className="empty-icon">
            <FaShoppingBag />
          </div>
          <h2 className="empty-title">No Orders Yet</h2>
          <p className="empty-description">
            You haven't placed any orders yet. Start shopping to see your order history here.
          </p>
          <button 
            className="btn btn--primary"
            onClick={() => navigate("/categories")}
          >
            <FaShoppingBag className="icon" />
            Start Shopping
          </button>
          <div className="empty-actions">
            <button 
              className="btn btn--outline"
              onClick={() => navigate("/")}
            >
              <FaArrowRight className="icon" />
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history">
      <div className="order-history__container">
        {/* Header */}
        <div className="order-history__header">
          <div className="header-content">
            <h1 className="order-history__title">
              <FaShoppingBag className="icon" />
              Order History
            </h1>
            <p className="order-history__subtitle">
              Track and manage all your previous orders in one place
            </p>
          </div>
          <div className="order-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <FaShoppingBag />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Orders</span>
                <span className="stat-value">{orders.length}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FaCheckCircle />
              </div>
              <div className="stat-info">
                <span className="stat-label">Delivered</span>
                <span className="stat-value">
                  {orders.filter(o => (o.status || '').toLowerCase() === 'delivered').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="order-history__filters">
          <div className="search-container">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search orders by ID, item name, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm("")}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="status-filter">
            <div className="filter-header">
              <FaFilter className="icon" />
              <span>Filter by Status</span>
            </div>
            <div className="filter-tabs">
              {Object.entries(statusCounts).map(([status, count]) => (
                <button
                  key={status}
                  className={`filter-tab ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => setStatusFilter(status)}
                >
                  <span className="tab-label">
                    {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                  <span className="tab-count">{count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="sort-options">
            <div className="sort-header">
              <span>Sort by</span>
            </div>
            <select 
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="results-info">
          <span className="results-count">
            Showing {filteredOrders.length} of {orders.length} orders
          </span>
          {searchTerm && (
            <button 
              className="btn btn--text"
              onClick={() => setSearchTerm("")}
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Orders Grid */}
        <div className="orders-grid">
          {filteredOrders.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">
                <FaSearch />
              </div>
              <h3>No orders found</h3>
              <p>Try adjusting your search or filter criteria</p>
              <button 
                className="btn btn--outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                <FaUndo className="icon" />
                Reset Filters
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const totalItems = calculateTotalItems(order.items);
              const orderTotal = calculateOrderTotal(order);
              
              return (
                <div key={order.id || Math.random()} className="order-card">
                  {/* Order Header */}
                  <div className="order-card__header">
                    <div className="order-info">
                      <div className="order-id">
                        <FaShoppingBag className="icon" />
                        <span>Order #{getOrderId(order.id)}</span>
                      </div>
                      <div className="order-date">
                        <FaCalendarAlt className="icon" />
                        <span>{formatDate(order.date || order.createdAt)}</span>
                      </div>
                    </div>
                    <div 
                      className="order-status"
                      style={{ 
                        color: statusInfo.color,
                        backgroundColor: statusInfo.bgColor
                      }}
                    >
                      {statusInfo.icon}
                      <span>{statusInfo.label}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="order-card__items">
                    <h4 className="items-title">
                      Items ({totalItems})
                    </h4>
                    <div className="items-list">
                      {order.items && Array.isArray(order.items) && order.items.slice(0, 3).map((item, index) => (
                        <div key={`${item.id || index}-${index}`} className="order-item">
                          <div className="item-info">
                            <div className="item-name">{item.name || "Unnamed Item"}</div>
                            <div className="item-meta">
                              <span className="item-price">₹{item.price || 0}</span>
                              <span className="item-qty">× {item.qty || 0}</span>
                            </div>
                          </div>
                          <div className="item-total">
                            ₹{Number(item.price || 0) * (item.qty || 0)}
                          </div>
                        </div>
                      ))}
                      {order.items && order.items.length > 3 && (
                        <div className="more-items">
                          + {order.items.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="order-card__summary">
                    <div className="summary-row">
                      <div className="summary-label">
                        <FaBox className="icon" />
                        <span>Items Total</span>
                      </div>
                      <div className="summary-value">
                        ₹{(order.items || []).reduce((sum, item) => 
                          sum + (Number(item.price || 0) * (item.qty || 0)), 0
                        )}
                      </div>
                    </div>
                    {order.deliveryFee !== undefined && (
                      <div className="summary-row">
                        <div className="summary-label">
                          <FaTruck className="icon" />
                          <span>Delivery Fee</span>
                        </div>
                        <div className="summary-value">
                          {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
                        </div>
                      </div>
                    )}
                    {order.discount !== undefined && order.discount > 0 && (
                      <div className="summary-row discount">
                        <div className="summary-label">
                          <FaStar className="icon" />
                          <span>Discount</span>
                        </div>
                        <div className="summary-value">
                          -₹{order.discount}
                        </div>
                      </div>
                    )}
                    <div className="summary-row total">
                      <div className="summary-label">
                        <strong>Total Amount</strong>
                      </div>
                      <div className="summary-value total-amount">
                        ₹{orderTotal}
                      </div>
                    </div>
                  </div>

                  {/* Payment & Address */}
                  <div className="order-card__details">
                    <div className="detail-section">
                      <div className="detail-header">
                        <FaCreditCard className="icon" />
                        <span>Payment Method</span>
                      </div>
                      <div className="detail-content">
                        <span className={`payment-method ${(order.paymentMethod || '').toLowerCase()}`}>
                          {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 
                           order.paymentMethod === 'ONLINE' ? 'Online Payment' : 
                           order.paymentMethod || 'Not specified'}
                        </span>
                      </div>
                    </div>
                    
                    {order.address && (
                      <div className="detail-section">
                        <div className="detail-header">
                          <FaMapMarkerAlt className="icon" />
                          <span>Delivery Address</span>
                        </div>
                        <div className="detail-content">
                          <div className="address-info">
                            <div className="address-line">
                              <FaHome className="icon" />
                              <span>{order.address.addressLine || 'Address not specified'}</span>
                            </div>
                            {(order.address.city || order.address.state || order.address.pincode) && (
                              <div className="address-city">
                                {[order.address.city, order.address.state, order.address.pincode]
                                  .filter(Boolean)
                                  .join(', ')}
                              </div>
                            )}
                            {order.address.phone && (
                              <div className="address-contact">
                                <FaPhone className="icon" />
                                <span>{order.address.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order Actions */}
                  <div className="order-card__actions">
                    <button 
                      className="btn btn--outline"
                      onClick={() => {
                        // Navigate to order details page if available
                        // Or show order details modal
                        console.log('View details for order:', order.id);
                      }}
                    >
                      <FaEye className="icon" />
                      View Details
                    </button>
                    {statusInfo.label === 'Delivered' && (
                      <button 
                        className="btn btn--primary"
                        onClick={() => {
                          // Reorder functionality
                          console.log('Reorder:', order.id);
                        }}
                      >
                        <FaRedo className="icon" />
                        Reorder
                      </button>
                    )}
                    {statusInfo.label === 'Cancelled' && (
                      <button 
                        className="btn btn--primary"
                        onClick={() => navigate("/categories")}
                      >
                        <FaShoppingBag className="icon" />
                        Shop Again
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Load More / Pagination (if needed) */}
        {filteredOrders.length > 0 && (
          <div className="load-more">
            <button className="btn btn--outline">
              Load More Orders
            </button>
          </div>
        )}

        {/* Help Section */}
        <div className="order-history__help">
          <h3>Need Help with Your Orders?</h3>
          <div className="help-actions">
            <button className="help-action">
              <div className="help-icon">📞</div>
              <div className="help-content">
                <strong>Contact Support</strong>
                <span>24/7 Customer Service</span>
              </div>
            </button>
            <button className="help-action">
              <div className="help-icon">📦</div>
              <div className="help-content">
                <strong>Track Order</strong>
                <span>Real-time Tracking</span>
              </div>
            </button>
            <button className="help-action">
              <div className="help-icon">🔄</div>
              <div className="help-content">
                <strong>Return/Exchange</strong>
                <span>Easy Returns</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderHistory;