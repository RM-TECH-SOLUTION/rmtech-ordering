// auth.reducer.js

// Load user from localStorage on initial state
const loadUserFromStorage = () => {
  try {
    const data = localStorage.getItem("user");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Load token from localStorage on initial state
const loadTokenFromStorage = () => {
  try {
    return localStorage.getItem("token") || null;
  } catch {
    return null;
  }
};

// Load expiry from localStorage on initial state
const loadExpiryFromStorage = () => {
  try {
    return localStorage.getItem("token_expiry") || null;
  } catch {
    return null;
  }
};

const initialState = {
  user: loadUserFromStorage(),
  token: loadTokenFromStorage(),
  tokenExpiry: loadExpiryFromStorage(),
  isLoading: false,
  error: null
};

// Action Types
const LOGIN_START = "auth/LOGIN_START";
const LOGIN_SUCCESS = "auth/LOGIN_SUCCESS";
const LOGIN_FAILURE = "auth/LOGIN_FAILURE";
const LOGOUT = "auth/LOGOUT";
const CLEAR_ERROR = "auth/CLEAR_ERROR";
const REFRESH_TOKEN = "auth/REFRESH_TOKEN";

// Action Creators
export const login = (userData) => (dispatch) => {
  dispatch({ type: LOGIN_START });
  
  try {
    // Simulate API call
    setTimeout(() => {
      // Generate mock token (in real app, this comes from API)
      const mockToken = `mock_jwt_token_${Date.now()}`;
      const tokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
      
      // Store in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", mockToken);
      localStorage.setItem("token_expiry", tokenExpiry.toString());
      
      dispatch({
        type: LOGIN_SUCCESS,
        payload: {
          user: userData,
          token: mockToken,
          tokenExpiry: tokenExpiry
        }
      });
    }, 1000);
  } catch (error) {
    dispatch({
      type: LOGIN_FAILURE,
      payload: error.message
    });
  }
};

export const logout = () => (dispatch) => {
  // Clear localStorage
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("token_expiry");
  
  dispatch({ type: LOGOUT });
};

export const clearError = () => ({
  type: CLEAR_ERROR
});

export const refreshToken = (newToken, newExpiry) => (dispatch) => {
  localStorage.setItem("token", newToken);
  localStorage.setItem("token_expiry", newExpiry.toString());
  
  dispatch({
    type: REFRESH_TOKEN,
    payload: {
      token: newToken,
      tokenExpiry: newExpiry
    }
  });
};

// Helper function to check if token is expired
export const isTokenValid = (expiry) => {
  return expiry && Date.now() < expiry;
};

// Reducer
const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        tokenExpiry: action.payload.tokenExpiry,
        error: null
      };

    case LOGIN_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        user: null,
        token: null,
        tokenExpiry: null
      };

    case LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        tokenExpiry: null,
        error: null
      };

    case CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case REFRESH_TOKEN:
      return {
        ...state,
        token: action.payload.token,
        tokenExpiry: action.payload.tokenExpiry
      };

    default:
      return state;
  }
};

export default authReducer;