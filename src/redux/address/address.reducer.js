// src/redux/address/address.reducer.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Load addresses from localStorage
const loadAddresses = () => {
  try {
    const data = localStorage.getItem('addresses');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading addresses:', error);
    return [];
  }
};

// Load selected address ID from localStorage
const loadSelectedAddressId = () => {
  try {
    return localStorage.getItem('selectedAddressId') || null;
  } catch (error) {
    console.error('Error loading selected address:', error);
    return null;
  }
};

const initialState = {
  addresses: loadAddresses(),
  selectedAddressId: loadSelectedAddressId(),
  loading: false,
  error: null,
};

// Async thunks
export const addAddress = createAsyncThunk(
  'address/addAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const newAddress = {
        id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        ...addressData,
        type: addressData.type || 'home',
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));

      return newAddress;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateAddress = createAsyncThunk(
  'address/updateAddress',
  async (updatedAddress, { rejectWithValue }) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));

      return {
        ...updatedAddress,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'address/deleteAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return addressId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const selectAddress = createAsyncThunk(
  'address/selectAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100));
      return addressId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create slice
const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    clearAddresses: (state) => {
      state.addresses = [];
      state.selectedAddressId = null;
      localStorage.removeItem('addresses');
      localStorage.removeItem('selectedAddressId');
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Address
      .addCase(addAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses.push(action.payload);
        
        // If this is the first address, auto-select it
        if (state.addresses.length === 1) {
          state.selectedAddressId = action.payload.id;
          localStorage.setItem('selectedAddressId', action.payload.id);
        }
        
        // Save to localStorage
        localStorage.setItem('addresses', JSON.stringify(state.addresses));
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Address
      .addCase(updateAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.addresses.findIndex(
          addr => addr.id === action.payload.id
        );
        if (index !== -1) {
          state.addresses[index] = action.payload;
          localStorage.setItem('addresses', JSON.stringify(state.addresses));
        }
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Address
      .addCase(deleteAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = state.addresses.filter(
          addr => addr.id !== action.payload
        );
        
        // If the deleted address was selected, select another or clear selection
        if (state.selectedAddressId === action.payload) {
          state.selectedAddressId = state.addresses.length > 0 
            ? state.addresses[0].id 
            : null;
          localStorage.setItem('selectedAddressId', state.selectedAddressId);
        }
        
        localStorage.setItem('addresses', JSON.stringify(state.addresses));
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Select Address
      .addCase(selectAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(selectAddress.fulfilled, (state, action) => {
        state.loading = false;
        const addressExists = state.addresses.some(
          addr => addr.id === action.payload
        );
        if (addressExists) {
          state.selectedAddressId = action.payload;
          localStorage.setItem('selectedAddressId', action.payload);
        }
      })
      .addCase(selectAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { clearAddresses } = addressSlice.actions;
export default addressSlice.reducer;

// Selectors
export const addressSelectors = {
  getAllAddresses: (state) => state.address.addresses,
  getSelectedAddress: (state) => {
    const { addresses, selectedAddressId } = state.address;
    return addresses.find(addr => addr.id === selectedAddressId) || null;
  },
  getAddressById: (state, addressId) => {
    return state.address.addresses.find(addr => addr.id === addressId) || null;
  },
  getAddressesByType: (state, type) => {
    return state.address.addresses.filter(addr => addr.type === type);
  },
  hasAddresses: (state) => state.address.addresses.length > 0,
  getAddressCount: (state) => state.address.addresses.length,
  isLoading: (state) => state.address.loading,
  getError: (state) => state.address.error,
};