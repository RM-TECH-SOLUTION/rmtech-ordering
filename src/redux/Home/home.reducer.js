
import apiClient from "../../api/apiClient";

const initialState = {
  homeCtaCards: [],
  catalogBanner: [],
  homeExploreCategories: [],
  homeSectionOffers: [],
  socialPages: [],
  newArrivals: [],
  merchantInfo: {},
  themeColors: {},
  homeCtaCardsConfig: {},
  homeBanner: [],
  homeOrderingBanner: [],
  homeUiConfiguration: {},
  appWelcomeMessage: {},
  loading: false,
};

const HOME_CTA_CARDS = "homeReducer/HOME_CTA_CARDS";
const CATALOG_BANNER = "homeReducer/CATALOG_BANNER";
const HOME_CTA_CARDS_CONFIG = "homeReducer/HOME_CTA_CARDS_CONFIG";
const HOME_BANNER = "homeReducer/HOME_BANNER";
const HOME_ORDERING_BANNER = "homeReducer/HOME_ORDERING_BANNER";
const HOME_UI_CONFIGURATION = "homeReducer/HOME_UI_CONFIGURATION";
const APP_WELCOME_MESSAGE = "homeReducer/APP_WELCOME_MESSAGE";
const HOME_EXPLORE_CATEGORIES = "homeReducer/HOME_EXPLORE_CATEGORIES";
const HOME_SECTION_OFFERS = "homeReducer/HOME_SECTION_OFFERS";
const SOCIAL_PAGES = "homeReducer/SOCIAL_PAGES";
const MERCHANT_INFO = "homeReducer/MERCHANT_INFO";
const THEME_COLORS = "homeReducer/THEME_COLORS";
const HOME_LOADING = "homeReducer/HOME_LOADING";
const NEW_ARRIVALS = "homeReducer/NEW_ARRIVALS";

export const getHomeBannerData = () => async (dispatch) => {
  const params = apiClient.withContext({
    modelSlug: "homeBanner",
  });

  try {
    const response = await apiClient.get(apiClient.Urls.getContentModel, params);
    dispatch({
      type: HOME_BANNER,
      homeBanner: response?.success && Array.isArray(response.data) ? response.data : [],
    });
  } catch (error) {
    console.log(error, "homeBanner");
    dispatch({
      type: HOME_BANNER,
      homeBanner: [],
    });
  }
};

export const homeBannerData = getHomeBannerData;

export const homeCtaCardsData = () => async (dispatch, getState) => {
  dispatch({
    type: HOME_CTA_CARDS,
    homeCtaCards: [],
  });

  const params = apiClient.withContext({
    modelSlug: 'homeCtaCards',
  });

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

export const getCatalogBannerData = () => async (dispatch) => {
  const params = apiClient.withContext({
    modelSlug: "banner",
  });

  try {
    const response = await apiClient.get("/getContentModel", params);
    if (response?.success) {
      dispatch({
        type: CATALOG_BANNER,
        catalogBanner: Array.isArray(response.data) ? response.data : [],
      });
    } else {
      dispatch({
        type: CATALOG_BANNER,
        catalogBanner: [],
      });
    }
  } catch (error) {
    console.log(error, "catalogBanner");
    dispatch({
      type: CATALOG_BANNER,
      catalogBanner: [],
    });
  }
};

export const getNewArrivals = () => async (dispatch) => {
  try {
    // Fetch from getAllCatalogueItems endpoint
    const response = await apiClient.get(apiClient.Urls.getAllCatalogueItems, {});
    
    if (response?.success && Array.isArray(response.data)) {
      // Filter items that have "New Arrivals" tag
      const newArrivalsItems = response.data.filter(item => {
        const tags = Array.isArray(item?.tags) ? item.tags : [];
        return tags.includes("New Arrivals");
      });

      console.log(newArrivalsItems,"newArrivalsItems")
      
      console.log(`New Arrivals: Found ${newArrivalsItems.length} items with 'New Arrivals' tag`);
      
      dispatch({
        type: NEW_ARRIVALS,
        newArrivals: newArrivalsItems,
      });
    } else {
      console.warn("getAllCatalogueItems API returned empty or invalid data:", response);
      dispatch({
        type: NEW_ARRIVALS,
        newArrivals: [],
      });
    }
  } catch (error) {
    // Log detailed error information
    console.error("getAllCatalogueItems API Error:");
    console.error("  Status:", error?.response?.status);
    console.error("  Message:", error?.message);
    console.error("  Response Data:", error?.response?.data);
    console.error("  URL Attempted:", `${error?.config?.baseURL}${error?.config?.url}`);
    console.error("  Params Sent:", error?.config?.params);
    
    // Fallback: Set empty array
    dispatch({
      type: NEW_ARRIVALS,
      newArrivals: [],
    });
  }
};

export const homeCtaCardsConfigData = () => async (dispatch, getState) => {
  dispatch({
    type: HOME_CTA_CARDS_CONFIG,
    homeCtaCardsConfig: {},
  });
 
  const params = apiClient.withContext({
    modelSlug: 'homeCtaCardsConfig',
  });

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

export const homePageData = () => async (dispatch) => {
  dispatch({ type: HOME_LOADING, loading: true });

  const fetchBySlug = async (modelSlug) => {
    try {
      const response = await apiClient.get("/getContentModel", apiClient.withContext({ modelSlug }));
      if (response?.success) {
        return response.data;
      }
    } catch (error) {
      console.log("homePageData error", modelSlug, error);
    }
    return null;
  };

  const [
    homeOrderingBanner,
    homeCtaCards,
    homeExploreCategories,
    homeSectionOffers,
    socialPages,
    homeUiConfiguration,
    appWelcomeMessage,
    merchantInfo,
    themeColors,
  ] = await Promise.all([
    fetchBySlug("homeOrderingBanner"),
    fetchBySlug("homeCtaCards"),
    fetchBySlug("HomeExploreCategories"),
    fetchBySlug("homeSectionOffers"),
    fetchBySlug("socialPages"),
    fetchBySlug("homeUiConfiguration"),
    fetchBySlug("appWelcomeMessage"),
    fetchBySlug("merchantInfo"),
    fetchBySlug("themeColors"),
  ]);

  dispatch({
    type: HOME_ORDERING_BANNER,
    homeOrderingBanner: Array.isArray(homeOrderingBanner) ? homeOrderingBanner : [],
  });

  dispatch({
    type: HOME_CTA_CARDS,
    homeCtaCards: Array.isArray(homeCtaCards) ? homeCtaCards : [],
  });

  dispatch({
    type: HOME_EXPLORE_CATEGORIES,
    homeExploreCategories: Array.isArray(homeExploreCategories) ? homeExploreCategories : [],
  });

  dispatch({
    type: HOME_SECTION_OFFERS,
    homeSectionOffers: Array.isArray(homeSectionOffers) ? homeSectionOffers : [],
  });

  dispatch({
    type: SOCIAL_PAGES,
    socialPages: Array.isArray(socialPages) ? socialPages : [],
  });

  dispatch({
    type: HOME_UI_CONFIGURATION,
    homeUiConfiguration: homeUiConfiguration || {},
  });

  dispatch({
    type: APP_WELCOME_MESSAGE,
    appWelcomeMessage: appWelcomeMessage || {},
  });

  dispatch({
    type: MERCHANT_INFO,
    merchantInfo: merchantInfo || {},
  });

  dispatch({
    type: THEME_COLORS,
    themeColors: themeColors || {},
  });

  dispatch({ type: HOME_LOADING, loading: false });
};

const homeReducer = (state = initialState, action) => {
  switch (action.type) {
    case HOME_LOADING: {
      return {
        ...state,
        loading: action.loading,
      };
    }
    case HOME_CTA_CARDS: {
      return {
        ...state,
        homeCtaCards: action.homeCtaCards,
      };
    }
    case CATALOG_BANNER: {
      return {
        ...state,
        catalogBanner: action.catalogBanner,
      };
    }
    case HOME_EXPLORE_CATEGORIES: {
      return {
        ...state,
        homeExploreCategories: action.homeExploreCategories,
      };
    }
    case HOME_SECTION_OFFERS: {
      return {
        ...state,
        homeSectionOffers: action.homeSectionOffers,
      };
    }
    case SOCIAL_PAGES: {
      return {
        ...state,
        socialPages: action.socialPages,
      };
    }
    case NEW_ARRIVALS: {
      return {
        ...state,
        newArrivals: action.newArrivals,
      };
    }
    case MERCHANT_INFO: {
      return {
        ...state,
        merchantInfo: action.merchantInfo,
      };
    }
    case THEME_COLORS: {
      return {
        ...state,
        themeColors: action.themeColors,
      };
    }
    case HOME_CTA_CARDS_CONFIG: {
      return {
        ...state,
        homeCtaCardsConfig: action.homeCtaCardsConfig,
      };
    }
    case HOME_BANNER: {
      return {
        ...state,
        homeBanner: action.homeBanner,
      };
    }
    case HOME_ORDERING_BANNER: {
      return {
        ...state,
        homeOrderingBanner: action.homeOrderingBanner,
      };
    }
    case HOME_UI_CONFIGURATION: {
      return {
        ...state,
        homeUiConfiguration: action.homeUiConfiguration,
      };
    }
    case APP_WELCOME_MESSAGE: {
      return {
        ...state,
        appWelcomeMessage: action.appWelcomeMessage,
      };
    }

    default:
      return state;
  }
};

export default homeReducer;
