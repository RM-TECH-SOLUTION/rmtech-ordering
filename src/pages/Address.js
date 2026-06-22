// src/pages/Address.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  addAddress,
  updateAddress,
  deleteAddress,
  selectAddress,
  addressSelectors,
} from '../redux/address/address.reducer';
import '../styles/pages/Addresses.scss';
import {
  FaHome,
  FaBriefcase,
  FaMapMarkerAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaArrowLeft,
  FaCity,
  FaMapPin,
  FaExclamationTriangle,
  FaSpinner,
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const getReadableTextColor = (background, dark = '#111827', light = '#ffffff') => {
  if (!background) {
    return dark;
  }

  const value = String(background).trim();
  const hex = value.startsWith('#') ? value.slice(1) : value;

  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(hex)) {
    return dark;
  }

  const normalized =
    hex.length === 3
      ? hex.split('').map((char) => char + char).join('')
      : hex;

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance < 0.56 ? light : dark;
};

function Address() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Get query parameters
  const searchParams = new URLSearchParams(location.search);
  const fromCart = searchParams.get('from') === 'cart';
  const returnTo = searchParams.get('returnTo') || '/cart';

  // Redux state
  const addresses = useSelector(addressSelectors.getAllAddresses);
  const selectedAddress = useSelector(addressSelectors.getSelectedAddress);
  const loading = useSelector(addressSelectors.isLoading);
  const error = useSelector(addressSelectors.getError);
  const user = useSelector((state) => state.auth?.user || null);
  const themeColors = useSelector((state) => state.homeReducer?.themeColors || {});
  const cardsBackgroundColor = themeColors?.cardsBackgroundColor || '#ffffff';
  const primaryButtonBackgroundColor =
    themeColors?.primaryButtonBackgroundColor ||
    themeColors?.['Primary Button Background Color'] ||
    '#0f172a';
  const cardTextColor = getReadableTextColor(cardsBackgroundColor, '#111827', '#ffffff');
  const mutedTextColor = cardTextColor === '#ffffff' ? 'rgba(255,255,255,0.74)' : '#718096';
  const borderColor = cardTextColor === '#ffffff' ? 'rgba(255,255,255,0.18)' : '#e2e8f0';
  const inputBackgroundColor = cardTextColor === '#ffffff' ? 'rgba(255,255,255,0.08)' : '#ffffff';
  const buttonTextColor = getReadableTextColor(primaryButtonBackgroundColor, '#111827', '#ffffff');

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [addressType, setAddressType] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    type: 'home',
    instructions: '',
  });

  // Form validation
  const [errors, setErrors] = useState({});

  // Load sample addresses if no addresses exist
  useEffect(() => {
    if (addresses.length === 0) {
      // You can load sample addresses here if needed
    }
  }, [addresses.length]);

  // Fill form when editing
  useEffect(() => {
    if (editingId) {
      const addressToEdit = addresses.find(addr => addr.id === editingId);
      if (addressToEdit) {
        setForm({
          name: addressToEdit.name || '',
          phone: addressToEdit.phone || '',
          addressLine: addressToEdit.addressLine || '',
          city: addressToEdit.city || '',
          state: addressToEdit.state || '',
          pincode: addressToEdit.pincode || '',
          landmark: addressToEdit.landmark || '',
          type: addressToEdit.type || 'home',
          instructions: addressToEdit.instructions || '',
        });
        setAddressType(addressToEdit.type || 'home');
      }
    }
  }, [editingId, addresses]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!form.addressLine.trim()) {
      newErrors.addressLine = 'Address is required';
    }

    if (!form.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(form.pincode.trim())) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      const payload = {
        ...form,
        name: form.name || user?.name || 'Customer',
        phone: form.phone || user?.phone || '',
      };

      if (isEditing && editingId) {
        await dispatch(updateAddress({
          id: editingId,
          ...payload,
        })).unwrap();

        toast.success('Address updated successfully!');
        setIsEditing(false);
        setEditingId(null);
      } else {
        await dispatch(addAddress(payload)).unwrap();

        toast.success('Address added successfully!');
        // Reset form
        setForm({
          name: '',
          phone: '',
          addressLine: '',
          city: '',
          state: '',
          pincode: '',
          landmark: '',
          type: 'home',
          instructions: '',
        });
        setAddressType('home');
      }
    } catch (error) {
      toast.error(`Error: ${error}`);
    }
  };

  // Handle edit
  const handleEdit = (address) => {
    setIsEditing(true);
    setEditingId(address.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await dispatch(deleteAddress(id)).unwrap();
      toast.success('Address deleted successfully!');
      setShowDeleteConfirm(null);
    } catch (error) {
      toast.error(`Error: ${error}`);
    }
  };

  // Handle select address
  const handleSelect = async (id) => {
    try {
      await dispatch(selectAddress(id)).unwrap();
      toast.success('Address selected!');

      if (fromCart) {
        setTimeout(() => navigate(returnTo), 500);
      }
    } catch (error) {
      toast.error(`Error: ${error}`);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    setForm({
      name: '',
      phone: '',
      addressLine: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      type: 'home',
      instructions: '',
    });
    setAddressType('home');
    setErrors({});
  };

  // Handle address type select
  const handleAddressTypeSelect = (type) => {
    setAddressType(type);
    setForm({ ...form, type });
  };

  // Filter addresses based on search
  const filteredAddresses = addresses.filter(addr =>
    addr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    addr.addressLine.toLowerCase().includes(searchQuery.toLowerCase()) ||
    addr.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    addr.pincode.includes(searchQuery)
  );

  return (
    <div
      className="address"
      style={{
        '--address-card-bg': cardsBackgroundColor,
        '--address-card-text': cardTextColor,
        '--address-muted-text': mutedTextColor,
        '--address-border': borderColor,
        '--address-input-bg': inputBackgroundColor,
        '--address-input-border': borderColor,
        '--address-primary-btn-bg': primaryButtonBackgroundColor,
        '--address-primary-btn-text': buttonTextColor,
      }}
    >
      <div className="address__container">
        {/* Header */}
        <div className="address__header">
          <button
            className="back-btn"
            onClick={() => navigate(fromCart ? returnTo : '/')}
            disabled={loading}
          >
            <FaArrowLeft className="icon" />
            {fromCart ? 'Back to Cart' : 'Back to Home'}
          </button>

          <div className="header-content">
            <h1 className="address__title">
              {isEditing ? '✏️ Edit Address' : '📍 Manage Addresses'}
            </h1>
            <p className="address__subtitle">
              {fromCart
                ? 'Select or add a delivery address for your order'
                : 'Add, edit, or remove your saved addresses'}
            </p>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">
              <FaSpinner className="spinner-icon" />
              <p>Processing...</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-alert">
            <FaExclamationTriangle className="icon" />
            <span>{error}</span>
          </div>
        )}

        <div className="address__content">
          {/* Left Column - Address Form */}
          <div className="address__form-section">
            <div className="form-card">
              <div className="form-card__header">
                <FaMapMarkerAlt className="icon" />
                <h2 className="form-title">
                  {isEditing ? 'Edit Address' : 'Add New Address'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="address-form">
                {/* Address Type Selection */}
                <div className="form-group">
                  <label className="form-label">Address Type</label>
                  <div className="address-type-selector">
                    <div
                      className={`type-option ${addressType === 'home' ? 'active' : ''}`}
                      onClick={() => handleAddressTypeSelect('home')}
                    >
                      <div className="type-icon">
                        <FaHome className="icon" />
                      </div>
                      <div className="type-info">
                        <span className="type-name">Home</span>
                        <span className="type-desc">(All day delivery)</span>
                      </div>
                    </div>

                    <div
                      className={`type-option ${addressType === 'work' ? 'active' : ''}`}
                      onClick={() => handleAddressTypeSelect('work')}
                    >
                      <div className="type-icon">
                        <FaBriefcase className="icon" />
                      </div>
                      <div className="type-info">
                        <span className="type-name">Work</span>
                        <span className="type-desc">(Weekday delivery)</span>
                      </div>
                    </div>

                    <div
                      className={`type-option ${addressType === 'other' ? 'active' : ''}`}
                      onClick={() => handleAddressTypeSelect('other')}
                    >
                      <div className="type-icon">
                        <FaMapMarkerAlt className="icon" />
                      </div>
                      <div className="type-info">
                        <span className="type-name">Other</span>
                        <span className="type-desc">(Other locations)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                {/* Address Line */}
                <div className="form-group">
                  <label className="form-label">
                    Complete Address *
                  </label>
                  <textarea
                    placeholder="House/Flat No, Building, Street, Area"
                    value={form.addressLine}
                    onChange={(e) => {
                      setForm({ ...form, addressLine: e.target.value });
                      if (errors.addressLine) setErrors({ ...errors, addressLine: '' });
                    }}
                    className={`form-textarea ${errors.addressLine ? 'error' : ''}`}
                    rows="3"
                  />
                  {errors.addressLine && <span className="error-message">{errors.addressLine}</span>}
                </div>

                {/* City, State, Pincode */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <div className="input-with-icon">
                      <FaCity className="input-icon" />
                      <input
                        type="text"
                        placeholder="City"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      placeholder="State"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Pincode *
                    </label>
                    <div className="input-with-icon">
                      <FaMapPin className="input-icon" />
                      <input
                        type="text"
                        placeholder="6-digit pincode"
                        value={form.pincode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setForm({ ...form, pincode: value });
                          if (errors.pincode) setErrors({ ...errors, pincode: '' });
                        }}
                        className={`form-input ${errors.pincode ? 'error' : ''}`}
                        maxLength="6"
                      />
                    </div>
                    {errors.pincode && <span className="error-message">{errors.pincode}</span>}
                  </div>
                </div>

                {/* Landmark */}
                <div className="form-group">
                  <label className="form-label">Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="Nearby landmark for easy delivery"
                    value={form.landmark}
                    onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                    className="form-input"
                  />
                </div>

                {/* Delivery Instructions */}
                <div className="form-group">
                  <label className="form-label">Delivery Instructions (Optional)</label>
                  <textarea
                    placeholder="Any special instructions for delivery"
                    value={form.instructions}
                    onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                    className="form-textarea"
                    rows="2"
                  />
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn btn--outline"
                      disabled={loading}
                    >
                      <FaTimes className="icon" />
                      Cancel
                    </button>
                  )}

                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="icon spinner" />
                        {isEditing ? 'Updating...' : 'Saving...'}
                      </>
                    ) : isEditing ? (
                      <>
                        <FaCheck className="icon" />
                        Update Address
                      </>
                    ) : (
                      <>
                        <FaPlus className="icon" />
                        Save Address
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Saved Addresses */}
          <div className="address__list-section">
            <div className="address-list">
              <div className="address-list__header">
                <div className="header-left">
                  <h3 className="section-title">Saved Addresses</h3>
                  <div className="address-count">
                    <span className="count-number">{addresses.length}</span>
                    <span className="count-label">addresses saved</span>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="address-search">
                  <input
                    type="text"
                    placeholder="Search addresses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  {searchQuery && (
                    <button
                      className="clear-search"
                      onClick={() => setSearchQuery('')}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {addresses.length === 0 ? (
                <div className="empty-address">
                  <div className="empty-icon">
                    <FaMapMarkerAlt className="icon" />
                  </div>
                  <h4 className="empty-title">No Addresses Yet</h4>
                  <p className="empty-description">
                    Add your first address to get started with delivery
                  </p>
                  <button
                    className="btn btn--outline"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    <FaPlus className="icon" />
                    Add Address
                  </button>
                </div>
              ) : filteredAddresses.length === 0 ? (
                <div className="no-results">
                  <p>No addresses found for "{searchQuery}"</p>
                  <button
                    className="btn btn--text"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="address-list__grid">
                  {filteredAddresses.map((address) => (
                    <div
                      key={address.id}
                      className={`address-card ${selectedAddress?.id === address.id ? 'selected' : ''
                        }`}
                    >
                      {/* Card Header */}
                      <div className="address-card__header">
                        <div className="address-type">
                          <div className={`type-badge type-${address.type || 'home'}`}>
                            {address.type === 'work' ? (
                              <FaBriefcase className="icon" />
                            ) : address.type === 'other' ? (
                              <FaMapMarkerAlt className="icon" />
                            ) : (
                              <FaHome className="icon" />
                            )}
                            <span className="type-text">
                              {address.type === 'home' ? 'Home' :
                                address.type === 'work' ? 'Work' : 'Other'}
                            </span>
                          </div>

                          {selectedAddress?.id === address.id && (
                            <div className="selected-badge">
                              <FaCheck className="icon" />
                              <span>Selected</span>
                            </div>
                          )}
                        </div>

                        <div className="address-actions">
                          <button
                            className="action-btn edit"
                            onClick={() => handleEdit(address)}
                            disabled={loading}
                          >
                            <FaEdit className="icon" />
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => setShowDeleteConfirm(address.id)}
                            disabled={loading}
                          >
                            <FaTrash className="icon" />
                          </button>
                        </div>
                      </div>

                      {/* Delete Confirmation Modal */}
                      {showDeleteConfirm === address.id && (
                        <div className="delete-confirmation">
                          <div className="confirmation-content">
                            <FaExclamationTriangle className="warning-icon" />
                            <p>Are you sure you want to delete this address?</p>
                            <div className="confirmation-actions">
                              <button
                                className="btn btn--outline"
                                onClick={() => setShowDeleteConfirm(null)}
                              >
                                Cancel
                              </button>
                              <button
                                className="btn btn--danger"
                                onClick={() => handleDelete(address.id)}
                              >
                                Yes, Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Card Body */}
                      <div className="address-card__body">
                        <div
                          className="address-content"
                          onClick={() => handleSelect(address.id)}
                        >
                          <h4 className="address-name">{address.name}</h4>
                          <p className="address-phone">{address.phone}</p>
                          <p className="address-line">{address.addressLine}</p>
                          {address.city && address.state && (
                            <p className="address-location">
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                          )}
                          {address.landmark && (
                            <p className="address-landmark">
                              <strong>Landmark:</strong> {address.landmark}
                            </p>
                          )}
                          {address.instructions && (
                            <div className="address-instructions">
                              <strong>Instructions:</strong> {address.instructions}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="address-card__footer">
                        <button
                          className={`select-btn ${selectedAddress?.id === address.id ? 'selected' : ''
                            }`}
                          onClick={() => handleSelect(address.id)}
                          disabled={loading}
                        >
                          {selectedAddress?.id === address.id ? (
                            <>
                              <FaCheck className="icon" />
                              Selected
                            </>
                          ) : (
                            'Select this address'
                          )}
                        </button>

                        {fromCart && selectedAddress?.id !== address.id && (
                          <button
                            className="use-address-btn"
                            onClick={() => {
                              handleSelect(address.id);
                            }}
                            disabled={loading}
                          >
                            Use for Delivery →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Quick Actions */}
            {/* <div className="quick-actions">
 <h4 className="actions-title">Quick Actions</h4>
 <div className="actions-grid">
 <button
 className="action-btn-card"
 onClick={() => {
 handleCancel();
 window.scrollTo({ top: 0, behavior: 'smooth' });
 }}
 >
 <FaPlus className="icon" />
 <span>Add New Address</span>
 </button>
 {addresses.length > 0 && (
 <button
 className="action-btn-card"
 onClick={() => {
 // Auto-fill current location logic here
 toast.info('Location detection coming soon!');
 }}
 >
 <FaMapMarkerAlt className="icon" />
 <span>Use Current Location</span>
 </button>
 )}
 </div>
 </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Address;