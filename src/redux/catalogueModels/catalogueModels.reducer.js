import apiClient from "../../api/apiClient";

const initialState = {
    list: [],
    loading: false
};

const GET_CATALOGUE_MODELS = "catalogue/GET_CATALOGUE_MODELS";
const SET_LOADING = "catalogue/SET_LOADING";

export const getCatalogueModels = (merchantId) => async (dispatch) => {
    try {
        dispatch({ type: SET_LOADING, loading: true });

        const response = await apiClient.get(
            "/getCatalogueModels",
            { merchantId }
        );

        if (response?.success) {
            dispatch({
                type: GET_CATALOGUE_MODELS,
                list: response.data
            });
        }
    } catch (error) {
        console.log("getCatalogueModels error", error);
    } finally {
        dispatch({ type: SET_LOADING, loading: false });
    }
};

const catalogueModelsReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_LOADING:
            return {
                ...state,
                loading: action.loading
            };

        case GET_CATALOGUE_MODELS:
            return {
                ...state,
                list: action.list
            };

        default:
            return state;
    }
};

export default catalogueModelsReducer;
