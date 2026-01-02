import { combineReducers } from "redux";
import testReducer from "./test.reducer";
import catalogueModelsReducer from "./catalogueModels/catalogueModels.reducer";
import catalogueItemsReducer from "./catalogueItems/catalogueItems.reducer";
import cartReducer from "./cart/cart.reducer";
import ordersReducer from "./orders/orders.reducer";
import authReducer from "./auth/auth.reducer";
import addressReducer from "./address/address.reducer";
import homeReducer from "./Home/home.reducer"

const rootReducer = combineReducers({
    auth: authReducer,
    test: testReducer,
    catalogueModels: catalogueModelsReducer,
    catalogueItems: catalogueItemsReducer,
    cart: cartReducer,
    orders: ordersReducer,
    address: addressReducer,
    homeReducer:homeReducer
});

export default rootReducer;
