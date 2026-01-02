
import apiClient from "../../api/apiClient";

const initialState = {
  homeCtaCards:[],
  homeCtaCardsConfig:{},
  homeBanner:{}
};

const HOME_CTA_CARDS = "homeReducer/HOME_CTA_CARDS";
const HOME_CTA_CARDS_CONFIG = "homeReducer/HOME_CTA_CARDS_CONFIG";
const HOME_BANNER = "homeReducer/HOME_BANNER";

export const homeBannerData = () => async (dispatch, getState) => {

  const params = {
    modelSlug: 'homeBanner',
    merchantId: 1,
  };

  try {
    const response = await apiClient.get("/getContentModel", params);
    console.log(response,"homeBanner")
    if (response.success) {
      dispatch({
        type: HOME_BANNER,
        homeBanner: response.data,
      });
    } else {
    }
  } catch (error) { 
     console.log(error,"homeBanner")
  }
};

export const homeCtaCardsData = () => async (dispatch, getState) => {
  dispatch({
    type: HOME_CTA_CARDS,
    homeCtaCards: [],
  });

  const params = {
    modelSlug: 'homeCtaCards',
    merchantId: 1,
  };

  try {
    const response = await apiClient.get("/getContentModel", params);
    console.log(response,"response")
    if (response.success) {
      dispatch({
        type: HOME_CTA_CARDS,
        homeCtaCards: response.data,
      });
    } else {
    }
  } catch (error) { 
     console.log(error,"homeCtaCards")
  }
};

export const homeCtaCardsConfigData = () => async (dispatch, getState) => {
  dispatch({
    type: HOME_CTA_CARDS_CONFIG,
    homeCtaCardsConfig: {},
  });
 
  const params = {
    modelSlug: 'homeCtaCardsConfig',
     merchantId: 1,

  };

  try {
    const response = await apiClient.get("/getContentModel", params);
    console.log(response,"response")
    if (response.success) {
      dispatch({
        type: HOME_CTA_CARDS_CONFIG,
        homeCtaCardsConfig: response.data,
      });
    } else {
    }
  } catch (error) {
     console.log(error,"homeCtaCardsConfig")
   }
};

const homeReducer = (state = initialState, action) => {
  switch (action.type) {
    case HOME_CTA_CARDS: {
      return {
        ...state,
        loader: false,
        homeCtaCards: action.homeCtaCards,
      };
    }
    case HOME_CTA_CARDS_CONFIG: {
      return {
        ...state,
        loader: false,
        homeCtaCardsConfig: action.homeCtaCardsConfig,
      };
    }
     case HOME_BANNER: {
      return {
        ...state,
        loader: false,
        homeBanner: action.homeBanner,
      };
    }

    default:
      return state;
  }
};

export default homeReducer;
