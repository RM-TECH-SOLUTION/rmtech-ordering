import axios from "axios";

const apiClient = axios.create({
    baseURL: "https://api.rmtechsolution.com",
    headers: {
        "Content-Type": "application/json"
    }
});

export let DEFAULT_MERCHANT_ID = 11;

export const setMerchantId = (id) => {
    DEFAULT_MERCHANT_ID = id;
};

export const API_URLS = {
    register: "/register.php",
    login: "/login.php",
    updateOrAddUser: "/registration-update.php",
    loginVerification: "/loginVerification.php",
    getContentModel: "/getContentModel",
    getCatalogueModels: "/getCatalogueModels",
    getCatalogueItems: "/getCatalogueItems",
    getAllCatalogueItems: "/getAllCatalogueItems",
    getMainCatalogues: "/getMainCatalogues",
    createOrder: "/create_order.php",
    getAddCart: "/add_to_cart.php",
    getCart: "/get_cart.php",
    updateCartQty: "/update_cart_qty.php",
    deleteCartItem: "/delete_cart_item.php",
    clearCart: "/clear_cart.php",
    findMerchant: "/findMerchant.php"
};

const getStoredUserId = () => {
    try {
        const raw = localStorage.getItem("user");
        if (!raw) {
            return null;
        }

        const user = JSON.parse(raw);
        return user?.id || null;
    } catch {
        return null;
    }
};

apiClient.Urls = API_URLS;

apiClient.withContext = (params = {}) => {
    const {
        forceMerchantId,
        merchant_id: _merchant_id,
        merchantId: _merchantId,
        user_id,
        userId,
        ...rest
    } = params;

    const merchantValue = forceMerchantId ?? DEFAULT_MERCHANT_ID;

    return {
        ...rest,
        merchantId: merchantValue,
        merchant_id: merchantValue,
        user_id: user_id ?? userId ?? getStoredUserId()
    };
};

apiClient.get = async (url, params = {}) => {
    try {
        const contextParams = apiClient.withContext(params);
        const response = await apiClient.request({
            method: "get",
            url,
            params: contextParams
        });
        return response.data;
    } catch (error) {
        console.error(`API GET Error [${error?.response?.status}] ${url}:`, {
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
            message: error?.message,
        });
        throw error;
    }
};

apiClient.post = async (url, body = {}) => {
    try {
        const contextBody = apiClient.withContext(body);
        const response = await apiClient.request({
            method: "post",
            url,
            data: contextBody,
            headers: apiClient.defaults.headers
        });
        return response.data;
    } catch (error) {
        console.error(`API POST Error [${error?.response?.status}] ${url}:`, {
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
            message: error?.message,
        });
        throw error;
    }
};

export const getMerchantNameFromUrl = () => {
    try {
        // Check for query parameter first (for localhost development)
        const urlParams = new URLSearchParams(window.location.search);
        const merchantParam = urlParams.get('merchant');
        if (merchantParam) {
            return merchantParam.toLowerCase().trim();
        }

        // Fall back to subdomain extraction (for production)
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        if (parts.length >= 4 && parts[parts.length - 3] === 'storehub' && parts[parts.length - 2] === 'co' && parts[parts.length - 1] === 'in') {
            return parts[0];
        }
        return null;
    } catch {
        return null;
    }
};

export const findMerchantByName = async (merchantName) => {
    try {
        const response = await axios.get(
            `${apiClient.defaults.baseURL}${API_URLS.findMerchant}`,
            {
                params: { name: merchantName }
            }
        );
        // API returns { success: true, data: { merchantId, ... } }
        return response.data?.data || response.data;
    } catch (error) {
        const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || "Failed to find merchant";
        console.error(`Merchant lookup failed for "${merchantName}":`, errorMessage);
        return { error: true, message: errorMessage };
    }
};

export default apiClient;
