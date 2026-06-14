
import apiClient from "../../api/apiClient";

const loadCartFromStorage = () => {
  try {
    const data = localStorage.getItem("cart");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (cartItems) => {
  localStorage.setItem("cart", JSON.stringify(cartItems));
};

const normalizeCartItem = (item) => {
  const id = Number(item?.item_id ?? item?.id);
  const qty = Number(item?.quantity ?? item?.qty ?? 1);
  const price = Number(item?.price ?? item?.finalPrice ?? 0);

  return {
    ...item,
    id,
    item_id: id,
    cart_id: item?.cart_id ?? item?.cartId ?? item?.id,
    name: item?.item_name || item?.name || "Item",
    description: item?.description || "",
    image: item?.image || item?.images?.[0] || null,
    images: item?.images || (item?.image ? [item.image] : []),
    price,
    qty,
    quantity: qty,
    total: Number(item?.total ?? price * qty)
  };
};

const getItemIdentity = (item) => {
  const raw = item?.item_id ?? item?.id;
  return Number(raw);
};

const findCartEntry = (cartItems, item) => {
  const itemIdentity = getItemIdentity(item);
  if (!Number.isFinite(itemIdentity)) {
    return null;
  }

  return (
    cartItems.find((entry) => Number(entry?.item_id) === itemIdentity) ||
    cartItems.find((entry) => Number(entry?.id) === itemIdentity) ||
    null
  );
};

const initialState = {
  cartItems: loadCartFromStorage(),
  loading: false,
  error: null
};

const ADD_TO_CART = "cart/ADD_TO_CART";
const REMOVE_FROM_CART = "cart/REMOVE_FROM_CART";
const CLEAR_CART = "cart/CLEAR_CART";
const SET_CART = "cart/SET_CART";
const SET_LOADING = "cart/SET_LOADING";
const SET_ERROR = "cart/SET_ERROR";

const getRequestContext = (state) => ({
  user_id: state?.auth?.user?.id || null
});

export const getCart = () => async (dispatch, getState) => {
  dispatch({ type: SET_LOADING, loading: true });
  dispatch({ type: SET_ERROR, error: null });

  try {
    const context = getRequestContext(getState());
    const res = await apiClient.get(apiClient.Urls.getCart, apiClient.withContext(context));

    const source = res?.cart || res?.data || [];
    const items = Array.isArray(source) ? source.map(normalizeCartItem) : [];

    saveCartToStorage(items);
    dispatch({ type: SET_CART, cartItems: items });
  } catch (error) {
    dispatch({ type: SET_ERROR, error: error?.message || "Failed to load cart" });
  } finally {
    dispatch({ type: SET_LOADING, loading: false });
  }
};

export const clearCart = () => async (dispatch, getState) => {
  dispatch({ type: SET_LOADING, loading: true });
  dispatch({ type: SET_ERROR, error: null });

  try {
    const context = getRequestContext(getState());
    const response = await apiClient.post(apiClient.Urls.clearCart, apiClient.withContext(context));

    if (!response?.success) {
      dispatch({ type: SET_ERROR, error: response?.message || "Failed to clear cart" });
      return;
    }

    await dispatch(getCart());
  } catch (error) {
    dispatch({ type: SET_ERROR, error: error?.message || "Failed to clear cart" });
  } finally {
    dispatch({ type: SET_LOADING, loading: false });
  }
};

export const addToCart = (item) => async (dispatch, getState) => {
  dispatch({ type: SET_LOADING, loading: true });
  dispatch({ type: SET_ERROR, error: null });

  try {
    const state = getState();
    const context = getRequestContext(state);
    const existing = findCartEntry(state.cart.cartItems, item);
    const itemIdentity = getItemIdentity(item);

    const variantId = item?.variant_id ?? item?.variant?.id ?? null;
    const variantName = item?.variant_name ?? item?.variant?.variant_name ?? item?.variant?.name ?? null;

    if (existing?.cart_id) {
      await apiClient.post(
        apiClient.Urls.updateCartQty,
        apiClient.withContext({
          ...context,
          cart_id: existing.cart_id,
          type: "inc"
        })
      );
    } else {
      await apiClient.post(
        apiClient.Urls.getAddCart,
        apiClient.withContext({
          ...context,
          item_id: itemIdentity,
          item_name: item?.name,
          description: item?.description || "",
          price: item?.variant?.price ?? item?.price,
          compare_price: item?.originalPrice || item?.compare_price || null,
          quantity: 1,
          image: item?.images?.[0] || item?.image || null,
          variant_id: variantId,
          variant_name: variantName
        })
      );
    }

    await dispatch(getCart());
    dispatch({ type: ADD_TO_CART, item });
  } catch (error) {
    dispatch({ type: SET_ERROR, error: error?.message || "Failed to add to cart" });
  } finally {
    dispatch({ type: SET_LOADING, loading: false });
  }
};

export const removeFromCart = (item) => async (dispatch, getState) => {
  dispatch({ type: SET_LOADING, loading: true });
  dispatch({ type: SET_ERROR, error: null });

  try {
    const state = getState();
    const context = getRequestContext(state);
    const existing = findCartEntry(state.cart.cartItems, item);

    if (!existing) {
      return;
    }

    if (Number(existing.qty) <= 1) {
      await apiClient.post(
        apiClient.Urls.deleteCartItem,
        apiClient.withContext({
          ...context,
          cart_id: existing.cart_id,
          item_id: existing.item_id || existing.id
        })
      );
    } else {
      await apiClient.post(
        apiClient.Urls.updateCartQty,
        apiClient.withContext({
          ...context,
          cart_id: existing.cart_id,
          type: "dec"
        })
      );
    }

    await dispatch(getCart());
    dispatch({ type: REMOVE_FROM_CART, item });
  } catch (error) {
    dispatch({ type: SET_ERROR, error: error?.message || "Failed to update cart" });
  } finally {
    dispatch({ type: SET_LOADING, loading: false });
  }
};

export const removeItemCompletely = (item) => async (dispatch, getState) => {
  dispatch({ type: SET_LOADING, loading: true });
  dispatch({ type: SET_ERROR, error: null });

  try {
    const state = getState();
    const context = getRequestContext(state);
    const existing = findCartEntry(state.cart.cartItems, item);

    if (!existing) {
      return;
    }

    await apiClient.post(
      apiClient.Urls.deleteCartItem,
      apiClient.withContext({
        ...context,
        cart_id: existing.cart_id,
        item_id: existing.item_id || existing.id
      })
    );

    await dispatch(getCart());
  } catch (error) {
    dispatch({ type: SET_ERROR, error: error?.message || "Failed to remove item" });
  } finally {
    dispatch({ type: SET_LOADING, loading: false });
  }
};

export const updateQty = (item, type) => async (dispatch, getState) => {
  dispatch({ type: SET_LOADING, loading: true });
  dispatch({ type: SET_ERROR, error: null });

  try {
    const state = getState();
    const context = getRequestContext(state);
    const existing = findCartEntry(state.cart.cartItems, item);

    if (!existing?.cart_id) {
      return;
    }

    await apiClient.post(
      apiClient.Urls.updateCartQty,
      apiClient.withContext({
        ...context,
        cart_id: existing.cart_id,
        type,
      })
    );

    await dispatch(getCart());
  } catch (error) {
    dispatch({ type: SET_ERROR, error: error?.message || "Failed to update cart qty" });
  } finally {
    dispatch({ type: SET_LOADING, loading: false });
  }
};

export const deleteCartItem = (item) => async (dispatch, getState) => {
  dispatch({ type: SET_LOADING, loading: true });
  dispatch({ type: SET_ERROR, error: null });

  try {
    const state = getState();
    const context = getRequestContext(state);
    const existing = findCartEntry(state.cart.cartItems, item);

    if (!existing?.cart_id) {
      return;
    }

    await apiClient.post(
      apiClient.Urls.deleteCartItem,
      apiClient.withContext({
        ...context,
        cart_id: existing.cart_id,
        item_id: existing.item_id || existing.id,
      })
    );

    await dispatch(getCart());
  } catch (error) {
    dispatch({ type: SET_ERROR, error: error?.message || "Failed to delete cart item" });
  } finally {
    dispatch({ type: SET_LOADING, loading: false });
  }
};

const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOADING:
      return {
        ...state,
        loading: action.loading
      };

    case SET_ERROR:
      return {
        ...state,
        error: action.error
      };

    case SET_CART:
      return {
        ...state,
        cartItems: action.cartItems
      };

    case ADD_TO_CART:
    case REMOVE_FROM_CART:
      return state;

    case CLEAR_CART:
      return {
        ...state,
        cartItems: []
      };

    default:
      return state;
    }
};

export default cartReducer;
