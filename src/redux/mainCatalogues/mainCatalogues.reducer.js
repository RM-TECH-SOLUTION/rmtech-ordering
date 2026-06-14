import apiClient from "../../api/apiClient";

const initialState = {
  list: [],
  loading: false,
  error: null,
};

const SET_MAIN_CATALOGUES_LOADING = "mainCatalogues/SET_LOADING";
const SET_MAIN_CATALOGUES = "mainCatalogues/SET_LIST";
const SET_MAIN_CATALOGUES_ERROR = "mainCatalogues/SET_ERROR";

export const getMainCatalogues = () => async (dispatch) => {
  try {
    dispatch({ type: SET_MAIN_CATALOGUES_LOADING, loading: true });
    dispatch({ type: SET_MAIN_CATALOGUES_ERROR, error: null });

    const response = await apiClient.get(
      apiClient.Urls.getMainCatalogues,
      apiClient.withContext()
    );

    if (response?.success) {
      dispatch({
        type: SET_MAIN_CATALOGUES,
        list: Array.isArray(response.data) ? response.data : [],
      });
    } else {
      dispatch({ type: SET_MAIN_CATALOGUES, list: [] });
      dispatch({
        type: SET_MAIN_CATALOGUES_ERROR,
        error: response?.message || "Failed to load main catalogues",
      });
    }
  } catch (error) {
    dispatch({
      type: SET_MAIN_CATALOGUES_ERROR,
      error: error?.message || "Failed to load main catalogues",
    });
  } finally {
    dispatch({ type: SET_MAIN_CATALOGUES_LOADING, loading: false });
  }
};

const mainCataloguesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_MAIN_CATALOGUES_LOADING:
      return {
        ...state,
        loading: action.loading,
      };

    case SET_MAIN_CATALOGUES:
      return {
        ...state,
        list: action.list,
      };

    case SET_MAIN_CATALOGUES_ERROR:
      return {
        ...state,
        error: action.error,
      };

    default:
      return state;
  }
};

export default mainCataloguesReducer;