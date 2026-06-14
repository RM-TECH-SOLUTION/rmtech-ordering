import apiClient from "../../api/apiClient";

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
const REGISTER_START = "auth/REGISTER_START";
const REGISTER_SUCCESS = "auth/REGISTER_SUCCESS";
const REGISTER_FAILURE = "auth/REGISTER_FAILURE";
const LOGOUT = "auth/LOGOUT";
const CLEAR_ERROR = "auth/CLEAR_ERROR";
const REFRESH_TOKEN = "auth/REFRESH_TOKEN";

const resolveUserFromResponse = (response, fallback = {}) => {
  return response?.user || response?.data?.user || response?.data || fallback;
};

const resolveTokenFromResponse = (response) => {
  return response?.token || response?.access_token || `session_${Date.now()}`;
};

const persistSession = ({ user, token, tokenExpiry }) => {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
  localStorage.setItem("token_expiry", String(tokenExpiry));
};

const clearSessionStorage = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("token_expiry");
};

// Action Creators
export const login = ({ identity, password }) => async (dispatch) => {
  dispatch({ type: LOGIN_START });

  try {
    const result = await apiClient.post(apiClient.Urls.login, {
      identity,
      password
    });

    if (!result?.success) {
      throw new Error(result?.message || "Invalid credentials");
    }

    const fallbackUser = {
      id: identity,
      phone: /^\d+$/.test(String(identity || "")) ? String(identity) : undefined,
      email: String(identity || "").includes("@") ? String(identity) : undefined,
    };

    const user = resolveUserFromResponse(result, fallbackUser);
    const token = resolveTokenFromResponse(result);
    const tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

    persistSession({ user, token, tokenExpiry });

    dispatch({
      type: LOGIN_SUCCESS,
      payload: {
        user,
        token,
        tokenExpiry,
      }
    });

    return { success: true, message: result?.message || "Login successful" };
  } catch (error) {
    clearSessionStorage();
    dispatch({
      type: LOGIN_FAILURE,
      payload: error?.message || "Something went wrong"
    });

    return { success: false, message: error?.message || "Something went wrong" };
  }
};

export const register = ({
  name,
  email,
  phone,
  password,
  referralCode = null,
  gender = null,
}) => async (dispatch) => {
  dispatch({ type: REGISTER_START });

  try {
    const result = await apiClient.post(apiClient.Urls.register, {
      name,
      email,
      phone,
      password,
      referral_code: referralCode,
      gender,
    });

    if (!result?.success) {
      throw new Error(result?.message || "Registration failed");
    }

    const fallbackUser = {
      id: Date.now(),
      name,
      email,
      phone,
    };

    const user = resolveUserFromResponse(result, fallbackUser);
    const token = resolveTokenFromResponse(result);
    const tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

    persistSession({ user, token, tokenExpiry });

    dispatch({
      type: REGISTER_SUCCESS,
      payload: {
        user,
        token,
        tokenExpiry,
      }
    });

    return { success: true, message: result?.message || "Registered successfully" };
  } catch (error) {
    clearSessionStorage();

    dispatch({
      type: REGISTER_FAILURE,
      payload: error?.message || "Registration failed",
    });

    return { success: false, message: error?.message || "Registration failed" };
  }
};

export const logout = () => (dispatch) => {
  clearSessionStorage();

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
    case REGISTER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        tokenExpiry: action.payload.tokenExpiry,
        error: null
      };

    case LOGIN_FAILURE:
    case REGISTER_FAILURE:
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

    case REGISTER_START:
      return {
        ...state,
        isLoading: true,
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