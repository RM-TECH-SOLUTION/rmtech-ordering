
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

const initialState = {
    cartItems: loadCartFromStorage()
};

const ADD_TO_CART = "cart/ADD_TO_CART";
const REMOVE_FROM_CART = "cart/REMOVE_FROM_CART";
const CLEAR_CART = "cart/CLEAR_CART";




export const clearCart = () => (dispatch) => {
  dispatch({ type: CLEAR_CART });
};

export const addToCart = (item) => (dispatch) => {
    dispatch({
        type: ADD_TO_CART,
        item
    });
};

export const removeFromCart = (item) => (dispatch) => {
    dispatch({
        type: REMOVE_FROM_CART,
        item
    });
};

const cartReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_TO_CART: {
            const existing = state.cartItems.find(
                (i) => i.id === action.item.id
            );

            if (existing) {
                return {
                    ...state,
                    cartItems: state.cartItems.map((i) =>
                        i.id === action.item.id
                            ? { ...i, qty: i.qty + 1 }
                            : i
                    )
                };
            }

            return {
                ...state,
                cartItems: [...state.cartItems, { ...action.item, qty: 1 }]
            };
        }

       case REMOVE_FROM_CART: {
  const existing = state.cartItems.find(i => i.id === action.item.id);
  if (!existing) return state;

  let updatedCart;

  if (existing.qty === 1) {
    updatedCart = state.cartItems.filter(i => i.id !== action.item.id);
  } else {
    updatedCart = state.cartItems.map(i =>
      i.id === action.item.id ? { ...i, qty: i.qty - 1 } : i
    );
  }

  saveCartToStorage(updatedCart);

  return {
    ...state,
    cartItems: updatedCart
  };
}


       case CLEAR_CART:
  localStorage.removeItem("cart");
  return initialState;


        default:
            return state;
    }
};

export default cartReducer;
