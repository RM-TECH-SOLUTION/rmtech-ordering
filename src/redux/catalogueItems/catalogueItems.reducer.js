import apiClient from "../../api/apiClient";

const initialState = {
    items: [],
    loading: false
};

const GET_CATALOGUE_ITEMS = "items/GET_CATALOGUE_ITEMS";
const SET_LOADING = "items/SET_LOADING";

export const getCatalogueItems = (catalogueModelId, merchantId) => async (dispatch) => {
    try {
        dispatch({ type: SET_LOADING, loading: true });

        const response = await apiClient.get(
            "/getCatalogueItems",
            { catalogueModelId, merchantId }
        );

        if (response?.success) {
            dispatch({
                type: GET_CATALOGUE_ITEMS,
                items: response.data
            });
        }
    } catch (error) {
        console.log("getCatalogueItems error", error);
    } finally {
        dispatch({ type: SET_LOADING, loading: false });
    }
};

const catalogueItemsReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_LOADING:
            return {
                ...state,
                loading: action.loading
            };

        case GET_CATALOGUE_ITEMS:
            return {
                ...state,
                items: action.items
            };

        default:
            return state;
    }
};

export default catalogueItemsReducer;
