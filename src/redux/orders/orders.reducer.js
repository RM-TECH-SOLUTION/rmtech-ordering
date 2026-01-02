const loadOrdersFromStorage = () => {
  try {
    const data = localStorage.getItem("orders");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveOrdersToStorage = (orders) => {
  localStorage.setItem("orders", JSON.stringify(orders));
};

const initialState = {
  orders: loadOrdersFromStorage()
};

const PLACE_ORDER = "orders/PLACE_ORDER";

export const placeOrder = ({ items, address ,paymentMethod }) => (dispatch, getState) => {
  const order = {
    id: Date.now(),
    items,
    address, 
     paymentMethod,
    total: items.reduce(
      (sum, item) => sum + Number(item.price) * item.qty,
      0
    ),
    status: paymentMethod === "COD" ? "Confirmed" : "Paid",
    date: new Date().toLocaleString()
  };

  dispatch({
    type: PLACE_ORDER,
    order
  });
};

const ordersReducer = (state = initialState, action) => {
  switch (action.type) {
    case PLACE_ORDER: {
      const updatedOrders = [action.order, ...state.orders];
      saveOrdersToStorage(updatedOrders);

      return {
        ...state,
        orders: updatedOrders
      };
    }

    default:
      return state;
  }
};

export default ordersReducer;
