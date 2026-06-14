import Header from "./components/Header";

import Footer from "./components/Footer";

import Cart from "./pages/Cart";

import OrderHistory from "./pages/OrderHistory";

import OrderSuccess from "./pages/OrderSuccess";

import Login from "./pages/Login";

import Register from "./pages/Register";

import Profile from "./pages/Profile";

import Address from "./pages/Address";

import Checkout from "./pages/Checkout";

import "./styles/pages/Home.scss"

import ProtectedRoute from "./components/ProtectedRoute";

import PublicRoute from "./components/PublicRoute";

import { Routes, Route, useParams, useNavigate, useLocation } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import { useEffect, useMemo, useState, useRef } from "react";

import { getCatalogueModels } from "./redux/catalogueModels/catalogueModels.reducer";

import { getCatalogueItems } from "./redux/catalogueItems/catalogueItems.reducer";

import { getMainCatalogues } from "./redux/mainCatalogues/mainCatalogues.reducer";

import { addToCart, getCart, removeFromCart } from "./redux/cart/cart.reducer";

import { homePageData, getCatalogBannerData, getHomeBannerData, getNewArrivals } from "./redux/Home/home.reducer";

import "./styles/pages/Categories.scss";

import "./styles/pages/Menu.scss";

import "./styles/pages/ProductDetail.scss";

import { getMerchantNameFromUrl, findMerchantByName, setMerchantId } from "./api/apiClient";

import PrivacyPolicy from "./pages/PrivacyPolicy";

import TermsOfService from "./pages/TermsOfService";

import RefundPolicy from "./pages/RefundPolicy";

import ShippingPolicy from "./pages/ShippingPolicy";

import ContactUs from "./pages/ContactUs";

// import LaunchCounter from "./components/LaunchCounter";

// import React, {  useState } from "react";



// Import icons (you can use react-icons or SVG)

import {

  FaShoppingCart,

  FaStar,

  FaArrowLeft,

  FaArrowRight,

  FaArrowUp,

  FaFacebookF,

  FaInstagram,

  FaYoutube,

  FaGlobe,

  FaHeart,

  FaShareAlt,

  FaTruck,

  FaRulerCombined,

} from "react-icons/fa";


const normalizeToArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);

const APP_DOWNLOAD_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c";

const RESTORE_STORAGE_KEY = "rmtech_restore_target";

const RESTORE_TOP_GAP = 70;


const readRestoreTarget = () => {

  if (typeof window === "undefined") {

    return null;

  }


  try {

    const raw = window.sessionStorage.getItem(RESTORE_STORAGE_KEY);

    if (!raw) {

      return null;

    }


    const parsed = JSON.parse(raw);

    return parsed && typeof parsed === "object" ? parsed : null;

  } catch {

    return null;

  }

};


const writeRestoreTarget = (payload) => {

  if (typeof window === "undefined") {

    return;

  }


  try {

    window.sessionStorage.setItem(RESTORE_STORAGE_KEY, JSON.stringify(payload));

  } catch {

    // Ignore storage quota/unavailable errors.

  }

};


const clearRestoreTarget = () => {

  if (typeof window === "undefined") {

    return;

  }


  try {

    window.sessionStorage.removeItem(RESTORE_STORAGE_KEY);

  } catch {

    // Ignore storage errors.

  }

};


const makeRestoreToken = (sectionId, itemId, index) => `${String(sectionId || "root")}:${String(itemId)}:${String(index)}`;


const toScreenshotList = (value) => {

  if (Array.isArray(value)) {

    return value.map((entry) => String(entry || "").trim()).filter(Boolean);

  }


  if (!value) {

    return [];

  }


  const raw = String(value).trim();


  if (!raw) {

    return [];

  }


  // Supports a single URL and comma/newline separated screenshot URLs.

  return raw

    .split(/[\n,]+/)

    .map((entry) => entry.trim())

    .filter(Boolean);

};


const ROUTE_MAP = {

  home: "/",

  order: "/categories",

  menu: "/categories",

  categories: "/categories",

  catalogue: "/categories",

  checkout: "/checkout",

  cart: "/cart",

  profile: "/profile",

  account: "/profile",

  orders: "/orders",

  orderhistory: "/orders",

  address: "/address",

  login: "/login",

  register: "/register",

  signup: "/register",

  auth: "/login",

};


const resolveRedirectPath = (input) => {

  if (!input) {

    return null;

  }


  const text = String(input).trim();

  const lower = text.toLowerCase().replace(/\s+/g, "");


  const categoryMatch = text.match(/^\/?categories-\{?(\d+)\}?$/i);

  if (categoryMatch?.[1]) {

    return `/menu/${categoryMatch[1]}`;

  }


  if (lower.startsWith("http://") || lower.startsWith("https://")) {

    return text;

  }


  if (text.startsWith("/")) {

    return text;

  }


  return ROUTE_MAP[lower] || null;

};


const getReadableTextColor = (background, dark = "#111827", light = "#ffffff") => {

  if (!background) {

    return dark;

  }


  const value = String(background).trim();

  const hex = value.startsWith("#") ? value.slice(1) : value;


  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(hex)) {

    return dark;

  }


  const normalized =

    hex.length === 3

      ? hex

        .split("")

        .map((char) => char + char)

        .join("")

      : hex;


  const r = parseInt(normalized.slice(0, 2), 16);

  const g = parseInt(normalized.slice(2, 4), 16);

  const b = parseInt(normalized.slice(4, 6), 16);


  // Relative luminance approximation for contrast-aware text color.

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance < 0.56 ? light : dark;

};


const getRgbaFromHex = (background, alpha, fallback = "rgba(245, 135, 42, 0.2)") => {

  if (!background) {

    return fallback;

  }


  const value = String(background).trim();

  const hex = value.startsWith("#") ? value.slice(1) : value;


  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(hex)) {

    return fallback;

  }


  const normalized =

    hex.length === 3

      ? hex

        .split("")

        .map((char) => char + char)

        .join("")

      : hex;


  const r = parseInt(normalized.slice(0, 2), 16);

  const g = parseInt(normalized.slice(2, 4), 16);

  const b = parseInt(normalized.slice(4, 6), 16);


  return `rgba(${r}, ${g}, ${b}, ${alpha})`;

};


const getCardRedirect = (card) =>

  card?.buttonLink ||

  card?.buttonLinks ||

  card?.redirectLink ||

  card?.redirect ||

  card?.link ||

  card?.url ||

  card?.path ||

  card?.inAppPathRedirect ||

  card?.inAppPathTitle ||

  null;


const getCatalogItemDisplayPrice = (item) => {

  const variants = Array.isArray(item?.variants)

    ? item.variants

    : Array.isArray(item?.varients)

      ? item.varients

      : [];


  if (variants.length > 0) {

    const firstVariantPrice = Number(variants[0]?.price);

    if (Number.isFinite(firstVariantPrice) && firstVariantPrice > 0) {

      return firstVariantPrice;

    }

  }


  const itemPrice = Number(item?.price);

  return Number.isFinite(itemPrice) ? itemPrice : 0;

};


const getCatalogItemDiscountInfo = (item) => {

  const currentPrice = getCatalogItemDisplayPrice(item);

  const variants = Array.isArray(item?.variants)

    ? item.variants

    : Array.isArray(item?.varients)

      ? item.varients

      : [];


  const firstVariant = variants[0] || null;

  const variantComparePrice = Number(

    firstVariant?.compare_price || firstVariant?.comparePrice || firstVariant?.originalPrice

  );

  const itemComparePrice = Number(item?.comparePrice || item?.compare_price || item?.originalPrice);

  const comparePrice =

    Number.isFinite(variantComparePrice) && variantComparePrice > 0

      ? variantComparePrice

      : itemComparePrice;


  if (!Number.isFinite(comparePrice) || comparePrice <= currentPrice) {

    return null;

  }


  const discountValue = comparePrice - currentPrice;

  const discountPercent = Math.round((discountValue / comparePrice) * 100);


  return {

    comparePrice,

    discountValue,

    discountPercent,

  };

};


function Home() {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [activeHomeBannerIndex, setActiveHomeBannerIndex] = useState(0);

  const [activeBanner, setActiveBanner] = useState(0);

  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  const [activeQuickActionIndex, setActiveQuickActionIndex] = useState(0);

  const [isMobileQuickActionsView, setIsMobileQuickActionsView] = useState(() =>

    typeof window !== "undefined" ? window.innerWidth <= 640 : false

  );

  const [appPreviewShift, setAppPreviewShift] = useState(0);


  const catalogueModels = useSelector((state) => state.catalogueModels?.list || []);

  const {

    homeBanner: homeBannerData,

    homeOrderingBanner,

    homeCtaCards,

    homeExploreCategories,

    homeSectionOffers,

    socialPages: socialPagesData,

    newArrivals,

    homeUiConfiguration,

    merchantInfo,

    themeColors,

    loading,

  } = useSelector((state) => state.homeReducer || {});


  const appDownloadTagline =

    merchantInfo?.homeDownloadAppTagline || "Real value, real speed!";

  const appDownloadDescription =

    merchantInfo?.homeDownloadAppDescription ||

    "Order faster, track deliveries live, and unlock app-only offers. A cleaner and quicker mobile experience built for everyday ordering.";

  const playStoreAppLink = merchantInfo?.playstoreAppLink || "";

  const appStoreAppLink = merchantInfo?.appstoreAppLink || "";

  const appDownloadImages = useMemo(() => {

    const images = toScreenshotList(merchantInfo?.appScreenshots);

    return images.length > 0 ? images : [APP_DOWNLOAD_FALLBACK_IMAGE];

  }, [merchantInfo?.appScreenshots]);

  const rotatingAppDownloadImages = useMemo(() => {

    if (appDownloadImages.length === 1) {

      return [appDownloadImages[0], appDownloadImages[0], appDownloadImages[0]];

    }


    return appDownloadImages;

  }, [appDownloadImages]);


  useEffect(() => {

    dispatch(getHomeBannerData());

    dispatch(getCatalogueModels());

    dispatch(getNewArrivals());

  }, [dispatch]);


  const homeBannerImages = useMemo(

    () =>

      normalizeToArray(homeBannerData)

        .map((entry) => String(entry?.image || entry?.imageUrl || "").trim())

        .filter(Boolean),

    [homeBannerData]

  );


  useEffect(() => {

    if (homeBannerImages.length <= 1) {

      return undefined;

    }


    const interval = window.setInterval(() => {

      setActiveHomeBannerIndex((prev) => (prev + 1) % homeBannerImages.length);

    }, 3600);


    return () => window.clearInterval(interval);

  }, [homeBannerImages.length]);


  useEffect(() => {

    if (activeHomeBannerIndex >= homeBannerImages.length) {

      setActiveHomeBannerIndex(0);

    }

  }, [activeHomeBannerIndex, homeBannerImages.length]);


  const heroSlides = useMemo(() => {

    const orderingSlides = normalizeToArray(homeOrderingBanner).map((slide, index) => ({

      id: slide.id || index,

      title: slide?.title || slide?.heading || "Fresh meals, ready in minutes",

      description: slide?.description || slide?.subTitle || "Choose your favorites and place your order instantly.",

      image:

        slide?.image ||

        slide?.imageUrl ||

        slide?.bannerImage ||

        "https://images.unsplash.com/photo-1504674900247-0877df9cc836",

      ctaPrimary: slide?.buttonText || slide?.ctaPrimary || "Order Now",

      ctaSecondary: slide?.buttonText2 || slide?.ctaSecondary || "Browse Menu",

    }));


    if (orderingSlides.length > 0) {

      return orderingSlides;

    }


    return [

      {

        id: "fallback",

        title:

          `${homeBannerData?.homeBannerTitle1 || "Delicious Food"} ${homeBannerData?.homeBannerTitle2 || "Delivered"

            } ${homeBannerData?.homeBannerTitle3 || "Fast"}`.trim(),

        description:

          homeBannerData?.homeBannerDescription ||

          "Discover curated dishes from your favorite kitchen and order in seconds.",

        image:

          homeBannerData?.homeBannerImage1 ||

          homeBannerData?.homeBannerImage2 ||

          homeBannerData?.homeBannerImage3 ||

          "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17",

        ctaPrimary: homeBannerData?.homeBannerCta1 || "Order Now",

        ctaSecondary: homeBannerData?.homeBannerCta2 || "Browse Menu",

      },

    ];

  }, [homeOrderingBanner, homeBannerData]);


  useEffect(() => {

    if (heroSlides.length <= 1) {

      return undefined;

    }


    const interval = window.setInterval(() => {

      setActiveBanner((prev) => (prev + 1) % heroSlides.length);

    }, 4500);


    return () => window.clearInterval(interval);

  }, [heroSlides.length]);


  useEffect(() => {

    if (activeBanner >= heroSlides.length) {

      setActiveBanner(0);

    }

  }, [activeBanner, heroSlides.length]);


  useEffect(() => {

    if (rotatingAppDownloadImages.length <= 1) {

      return undefined;

    }


    const interval = window.setInterval(() => {

      setAppPreviewShift((prev) => (prev + 1) % rotatingAppDownloadImages.length);

    }, 2200);


    return () => window.clearInterval(interval);

  }, [rotatingAppDownloadImages.length]);


  useEffect(() => {

    if (appPreviewShift >= rotatingAppDownloadImages.length) {

      setAppPreviewShift(0);

    }

  }, [appPreviewShift, rotatingAppDownloadImages.length]);


  const homeGradient = homeUiConfiguration?.homeBgColorGradient || "linear-gradient(160deg, #f9f3e5 0%, #fff7ec 45%, #f1f7ff 100%)";

  const webBackgroundColor = themeColors?.webBackgroundColor || homeGradient;

  const cardsBackgroundColor = themeColors?.cardsBackgroundColor || "#ffffff";

  const cardSectionBackgroundColor = cardsBackgroundColor;

  const cardSectionTextColor = getReadableTextColor(cardSectionBackgroundColor, "#111827", "#ffffff");

  const cardSectionMutedTextColor =

    cardSectionTextColor === "#ffffff" ? "rgba(255, 255, 255, 0.82)" : "#475569";

  const cardSectionBorderColor =

    cardSectionTextColor === "#ffffff" ? "rgba(255, 255, 255, 0.26)" : "rgba(148, 163, 184, 0.2)";

  const cardSectionShadow =

    cardSectionTextColor === "#ffffff"

      ? "0 10px 24px rgba(0, 0, 0, 0.28)"

      : "0 10px 24px rgba(15, 23, 42, 0.08)";


  const homeOrderingBannerBackgroundColor =

    themeColors?.homeOrderingBannerBackgroundColor || cardSectionBackgroundColor;

  const homeSectionOffersBackgroundColor =

    themeColors?.homeSectionOffersBackgroundColor || cardSectionBackgroundColor;

  const newArrivalsBackgroundColor =

    themeColors?.newArrivalsBackgroundColor || cardSectionBackgroundColor;

  const homeCtaCardsBackgroundColor =

    themeColors?.homeCtaCardsBackgroundColor || cardSectionBackgroundColor;

  const homeExploreCategoriesBackgroundColor =

    themeColors?.["homeExploreCategories Background Color"] ||

    themeColors?.homeExploreCategoriesBackgroundColor ||

    cardSectionBackgroundColor;

  const downloadAppSectionBackgroundColor =

    themeColors?.downloadAppSectionBackgroundColor || cardSectionBackgroundColor;

  const socialPageBackgroundColor =

    themeColors?.socialPageBackgroundColor || cardSectionBackgroundColor;

  const newArrivalsCardTextColor = getReadableTextColor(cardSectionBackgroundColor, "#111827", "#ffffff");

  const newArrivalsCardMutedTextColor =

    newArrivalsCardTextColor === "#ffffff" ? "rgba(255, 255, 255, 0.78)" : "#64748b";

  const newArrivalsButtonBgColor = cardSectionTextColor === "#ffffff" ? "#ffffff" : "#111827";

  const newArrivalsButtonTextColor = getReadableTextColor(

    newArrivalsButtonBgColor,

    "#111827",

    "#ffffff"

  );


  const isDownloadSectionDark =

    getReadableTextColor(downloadAppSectionBackgroundColor, "#111827", "#ffffff") === "#ffffff";

  const downloadPrimaryButtonBg = isDownloadSectionDark ? "#ffffff" : "#111827";

  const downloadPrimaryButtonText = isDownloadSectionDark ? "#111827" : "#ffffff";

  const downloadSecondaryButtonBg = isDownloadSectionDark ? "rgba(255, 255, 255, 0.14)" : "#ffffff";

  const downloadSecondaryButtonText = isDownloadSectionDark ? "#ffffff" : "#111827";

  const downloadSecondaryButtonBorder = isDownloadSectionDark

    ? "rgba(255, 255, 255, 0.48)"

    : "rgba(15, 23, 42, 0.2)";


  const getSectionThemeStyle = (backgroundColor) => {

    const textColor = getReadableTextColor(backgroundColor, "#111827", "#ffffff");

    const mutedTextColor = textColor === "#ffffff" ? "rgba(255, 255, 255, 0.82)" : "#475569";

    const borderColor =

      textColor === "#ffffff" ? "rgba(255, 255, 255, 0.26)" : "rgba(148, 163, 184, 0.2)";

    const shadow =

      textColor === "#ffffff"

        ? "0 10px 24px rgba(0, 0, 0, 0.28)"

        : "0 10px 24px rgba(15, 23, 42, 0.08)";


    return {

      background: backgroundColor,

      "--home-section-text": textColor,

      "--home-section-muted": mutedTextColor,

      "--home-section-border": borderColor,

      "--home-section-shadow": shadow,

    };

  };


  const quickActions = useMemo(() => normalizeToArray(homeCtaCards), [homeCtaCards]);

  const marqueeQuickActions = useMemo(() => {

    if (quickActions.length <= 1) {

      return quickActions;

    }


    return [...quickActions, ...quickActions];

  }, [quickActions]);

  const displayedNewArrivals = useMemo(() => normalizeToArray(newArrivals), [newArrivals]);

  const marqueeNewArrivals = useMemo(() => {

    if (displayedNewArrivals.length <= 1) {

      return displayedNewArrivals;

    }


    return [...displayedNewArrivals, ...displayedNewArrivals];

  }, [displayedNewArrivals]);


  const offers = useMemo(() => normalizeToArray(homeSectionOffers), [homeSectionOffers]);


  const socialPages = useMemo(() => {

    const source = normalizeToArray(socialPagesData);


    if (source.length === 0) {

      return [];

    }


    const mapped = [];


    source.forEach((entry, index) => {

      if (entry?.facebookLink) {

        mapped.push({

          id: `facebook-${index}`,

          title: "Facebook",

          description: "Follow us on Facebook",

          image: entry?.facebookLogo || entry?.facebookImage || entry?.logo || entry?.image,

          redirectLink: entry.facebookLink,

        });

      }


      if (entry?.instagramLink) {

        mapped.push({

          id: `instagram-${index}`,

          title: "Instagram",

          description: "See our latest updates on Instagram",

          image: entry?.instagramLogo || entry?.instagramImage || entry?.logo || entry?.image,

          redirectLink: entry.instagramLink,

        });

      }


      if (entry?.youtubeLink) {

        mapped.push({

          id: `youtube-${index}`,

          title: "YouTube",

          description: "Watch our latest videos on YouTube",

          image: entry?.youtubeLogo || entry?.youtubeImage || entry?.logo || entry?.image,

          redirectLink: entry.youtubeLink,

        });

      }


      // Keep compatibility if API returns pre-shaped card objects.

      if ((!entry?.facebookLink && !entry?.instagramLink && !entry?.youtubeLink) && (entry?.title || getCardRedirect(entry))) {

        mapped.push(entry);

      }

    });


    return mapped;

  }, [socialPagesData]);


  const exploreCategories = useMemo(() => {

    const cmsExploreCategories = normalizeToArray(homeExploreCategories);


    if (cmsExploreCategories.length > 0) {

      return cmsExploreCategories;

    }


    return catalogueModels.slice(0, 8).map((model) => ({

      id: model.id,

      title: model.name,

      description: model.description,

      image: model.image,

      catalogModelId: model.id,

      redirectLink: "menu",

    }));

  }, [homeExploreCategories, catalogueModels]);


  useEffect(() => {

    if (exploreCategories.length === 0) {

      return;

    }


    if (activeCategoryIndex >= exploreCategories.length) {

      setActiveCategoryIndex(0);

    }

  }, [activeCategoryIndex, exploreCategories.length]);


  useEffect(() => {

    if (exploreCategories.length <= 1) {

      return undefined;

    }


    const loopInterval = window.setInterval(() => {

      setActiveCategoryIndex((prev) => (prev + 1) % exploreCategories.length);

    }, 4200);


    return () => window.clearInterval(loopInterval);

  }, [exploreCategories.length]);


  useEffect(() => {

    if (quickActions.length === 0) {

      return;

    }


    if (activeQuickActionIndex >= quickActions.length) {

      setActiveQuickActionIndex(0);

    }

  }, [activeQuickActionIndex, quickActions.length]);


  useEffect(() => {

    if (quickActions.length <= 1) {

      return undefined;

    }


    const quickLoopInterval = window.setInterval(() => {

      setActiveQuickActionIndex((prev) => (prev + 1) % quickActions.length);

    }, 4200);


    return () => window.clearInterval(quickLoopInterval);

  }, [quickActions.length]);


  useEffect(() => {

    if (typeof window === "undefined") {

      return undefined;

    }


    const handleResize = () => {

      setIsMobileQuickActionsView(window.innerWidth <= 640);

    };


    handleResize();

    window.addEventListener("resize", handleResize);


    return () => {

      window.removeEventListener("resize", handleResize);

    };

  }, []);


  const navigateByRedirect = (redirectLink) => {

    const path = resolveRedirectPath(redirectLink);

    if (!path) {

      return;

    }


    if (path.startsWith("http://") || path.startsWith("https://")) {

      window.open(path, "_blank", "noopener,noreferrer");

      return;

    }


    navigate(path);

  };


  const handleCategoryClick = (item) => {

    const redirectLink = getCardRedirect(item);

    const categoryRedirectMatch = String(redirectLink || "").trim().match(/^\/?categories-\{?(\d+)\}?$/i);


    if (categoryRedirectMatch?.[1]) {

      const targetCatalogId = categoryRedirectMatch[1];

      const targetModel = catalogueModels.find(

        (model) => String(model?.id) === String(targetCatalogId)

      );

      const targetMainId =

        targetModel?.main_catalogue_id ||

        targetModel?.mainCatalogueId ||

        targetModel?.parentId ||

        targetModel?.catalogueId ||

        targetModel?.parentCatalogId ||

        targetModel?.mainCategoryId ||

        targetModel?.parentCategoryId ||

        null;


      dispatch(getCatalogueItems(targetCatalogId));

      navigate("/categories", {

        state: {

          selectedMainId: targetMainId,

          selectedModelId: targetCatalogId,

        },

      });

      return;

    }


    const catalogModelId = item?.catalogModelId || item?.catalogueModelId || item?.categoryId || item?.id;


    if (catalogModelId) {

      dispatch(getCatalogueItems(catalogModelId));

      navigate(`/menu/${catalogModelId}`);

      return;

    }


    navigateByRedirect(redirectLink);

  };


  const renderCardTitle = (item, fallback) => item?.title || item?.heading || item?.name || fallback;

  const renderCardDescription = (item, fallback) => item?.description || item?.discription || item?.subTitle || item?.text || fallback;

  const renderCardImage = (item, fallback) => item?.backgroundImage || item?.image || item?.imageUrl || item?.icon || fallback;

  const renderOfferHighlight = (item, fallback) => item?.offerText || item?.discountText || item?.highlight || item?.badge || fallback;

  const renderOfferButton = (item, fallback) => item?.buttonTitle || item?.buttonText || item?.ctaText || item?.linkText || fallback;

  const heroSlide = heroSlides[activeBanner] || heroSlides[0];

  const heroThumbs = heroSlides.slice(0, 6);

  const activeQuickAction = quickActions[activeQuickActionIndex] || quickActions[0];

  const activeQuickActionImage = renderCardImage(activeQuickAction, "");

  const activeQuickActionTitle = renderCardTitle(activeQuickAction, "");

  const activeQuickActionSubTitle = activeQuickAction?.subTitle || renderOfferHighlight(activeQuickAction, "");

  const activeQuickActionDescription = renderCardDescription(activeQuickAction, "");

  const activeQuickActionButton = renderOfferButton(activeQuickAction, "");

  const quickActionCardBgColor = activeQuickAction?.cardBgColor || "#f3f4f6";

  const quickActionTextColor = activeQuickAction?.cardTextColor || "#111827";

  const quickActionBorderColor = activeQuickAction?.borderColor || "rgba(203, 213, 225, 0.62)";

  const quickActionMediaBgColor = activeQuickAction?.bgColor || "#ed9a1e";

  const quickActionButtonColor = activeQuickAction?.buttonColor || "#e69321";

  const quickActionButtonTextColor = activeQuickAction?.buttonTextColor || "#111827";


  const categoryShowcaseItems = useMemo(() => {

    const total = exploreCategories.length;


    if (total === 0) {

      return [];

    }


    const toSignedOffset = (index) => {

      let diff = index - activeCategoryIndex;

      if (diff > total / 2) diff -= total;

      if (diff < -total / 2) diff += total;

      return diff;

    };


    return exploreCategories

      .map((item, index) => {

        const offset = toSignedOffset(index);

        return {

          item,

          sourceIndex: index,

          offset,

          absOffset: Math.abs(offset),

        };

      })

      .sort((a, b) => a.absOffset - b.absOffset || a.offset - b.offset)

      .slice(0, Math.min(total, 5))

      .sort((a, b) => a.offset - b.offset);

  }, [exploreCategories, activeCategoryIndex]);


  const getSocialFallbackLogo = (title = "") => {

    const lower = title.toLowerCase();

    if (lower.includes("facebook")) return <FaFacebookF />;

    if (lower.includes("instagram")) return <FaInstagram />;

    if (lower.includes("youtube")) return <FaYoutube />;

    return <FaGlobe />;

  };


  const getSocialToneClass = (title = "") => {

    const lower = title.toLowerCase();

    if (lower.includes("facebook")) return "social-card--facebook";

    if (lower.includes("instagram")) return "social-card--instagram";

    if (lower.includes("youtube")) return "social-card--youtube";

    return "social-card--generic";

  };


  const getSocialMeta = (item, title = "") => {

    const lower = title.toLowerCase();

    const followers = item?.followers || item?.stats || item?.statText;

    const subtitle = item?.subTitle || item?.subtitle || item?.description || item?.discription;

    const ctaText = item?.buttonTitle || item?.buttonText || item?.ctaText || item?.linkText;


    if (lower.includes("facebook")) {

      return {

        followers: followers || "12.5K Followers",

        subtitle: subtitle || "Latest updates, offers & news",

        ctaText: ctaText || "Visit Page",

      };

    }


    if (lower.includes("instagram")) {

      return {

        followers: followers || "28.7K Followers",

        subtitle: subtitle || "Daily inspiration & new looks",

        ctaText: ctaText || "Visit Page",

      };

    }


    if (lower.includes("youtube")) {

      return {

        followers: followers || "8.3K Subscribers",

        subtitle: subtitle || "Watch videos & style guides",

        ctaText: ctaText || "Visit Channel",

      };

    }


    return {

      followers: followers || "Official updates",

      subtitle: subtitle || "Tap to stay connected",

      ctaText: ctaText || "Visit Page",

    };

  };


  const shiftCategoryShowcase = (direction) => {

    if (exploreCategories.length === 0) {

      return;

    }


    setActiveCategoryIndex((prev) => (prev + direction + exploreCategories.length) % exploreCategories.length);

  };


  const shiftQuickAction = (direction) => {

    if (quickActions.length === 0) {

      return;

    }


    setActiveQuickActionIndex((prev) => (prev + direction + quickActions.length) % quickActions.length);

  };


  return (

    <main

      className="home"

      style={{

        background: webBackgroundColor,

        "--home-section-bg": cardSectionBackgroundColor,

        "--home-section-text": cardSectionTextColor,

        "--home-section-muted": cardSectionMutedTextColor,

        "--home-section-border": cardSectionBorderColor,

        "--home-section-shadow": cardSectionShadow,

      }}

    >

      {homeBannerImages.length > 0 && (

        <section className="home__cms-banner" aria-label="Home highlights">

          <img

            src={homeBannerImages[activeHomeBannerIndex]}

            alt={`Home banner ${activeHomeBannerIndex + 1}`}

            className="home__cms-banner-image"

          />

        </section>

      )}


      {/* <section className="home__overview" aria-label="Home insights">

        {overviewMetrics.map((metric) => (

          <article key={metric.id} className="overview-card">

            <p className="overview-card__label">{metric.label}</p>

            <h3 className="overview-card__value">{metric.value}</h3>

          </article>

        ))}

      </section> */}


      <section className="home__hero" style={getSectionThemeStyle(homeOrderingBannerBackgroundColor)}>

        <div className="home__hero-content">

          <h2 className="home__hero-title">{heroSlide?.title}</h2>

          <p className="home__hero-subtitle">{heroSlide?.description}</p>


          <div className="home__hero-actions">

            <button className="btn btn--primary btn--large" onClick={() => navigate("/categories")}>

              <span>{heroSlide?.ctaPrimary || "Order Now"}</span>

              <FaArrowRight className="icon" />

            </button>

          </div>


          {heroThumbs.length > 0 && (

            <div className="home__hero-thumbs" role="tablist" aria-label="Home banner previews">

              {heroThumbs.map((slide, index) => (

                <button

                  key={slide.id || index}

                  type="button"

                  className={`hero-thumb ${index === activeBanner ? "active" : ""}`}

                  onClick={() => setActiveBanner(index)}

                  aria-label={`Show banner ${index + 1}`}

                >

                  <img src={slide?.image} alt={slide?.title || `Preview ${index + 1}`} />

                </button>

              ))}

            </div>

          )}

        </div>


        <div className="home__hero-image">

          <div className="home__hero-image-wrap">

            <img src={heroSlide?.image} style={{ objectFit: "cover" }} alt={heroSlide?.title || "Home banner"} />

          </div>

        </div>

      </section>


      {newArrivals.length > 0 && (

        <section

          className="home__section home__section--new-arrivals"

          style={{

            ...getSectionThemeStyle(newArrivalsBackgroundColor),

            "--new-arrivals-card-bg": cardSectionBackgroundColor,

            "--new-arrivals-card-text": newArrivalsCardTextColor,

            "--new-arrivals-card-muted-text": newArrivalsCardMutedTextColor,

          }}

        >

          <div className="home__section-header" style={{ margin: 35 }}>

            <h3>New Arrivals</h3>

          </div>


          <div className="new-arrivals-marquee">

            <div

              className={`new-arrivals-grid ${displayedNewArrivals.length > 1 ? "is-animated" : ""}`}

            >

              {marqueeNewArrivals.map((item, index) => {

                const isDuplicateCard = displayedNewArrivals.length > 1 && index >= displayedNewArrivals.length;

                const itemPrice = getCatalogItemDisplayPrice(item);

                const discountInfo = getCatalogItemDiscountInfo(item);

                const comparePrice = discountInfo?.comparePrice;

                const hasDiscount = Boolean(discountInfo);


                return (

                  <button

                    key={`${item?.id || item?.name || "item"}-${index}`}

                    type="button"

                    className="cat-item-card"

                    aria-hidden={isDuplicateCard || undefined}

                    tabIndex={isDuplicateCard ? -1 : 0}

                    onClick={() => {

                      const catalogModelId = item?.catalogueModelId || item?.catalogue_model_id;

                      if (catalogModelId && item?.id) {

                        navigate(`/menu/${catalogModelId}/item/${item.id}`, {

                          state: {

                            fromPath: "/",

                          },

                        });

                      }

                    }}

                  >

                    <div className="cat-item-card__image-wrap">

                      <img

                        src={item?.images?.[0] || item?.image || "https://via.placeholder.com/200"}

                        alt={item?.name || "Product"}

                        className="cat-item-card__image"

                      />

                      {hasDiscount && (

                        <span className="cat-item-card__discount" style={{ background: "#ff6b6b" }}>

                          {discountInfo.discountPercent}% OFF

                        </span>

                      )}

                    </div>


                    <div className="cat-item-card__body">

                      <h4 className="cat-item-card__name">{item?.name || "Unnamed Product"}</h4>

                      {discountInfo && (

                        <span className="cat-item-card__discount-meta">

                          Save ₹{discountInfo.discountValue} · {discountInfo.discountPercent}% off

                        </span>

                      )}



                      {item?.brand && (

                        <p className="cat-item-card__brand">{item.brand}</p>

                      )}


                      <div className="cat-item-card__price">

                        <span className="cat-item-card__price-current">₹{itemPrice}</span>

                        {comparePrice && (

                          <span className="cat-item-card__price-original">₹{comparePrice}</span>

                        )}

                      </div>


                      <button

                        type="button"

                        className="btn btn--sm btn--primary"

                        style={{

                          background: newArrivalsButtonBgColor,

                          borderColor: newArrivalsButtonBgColor,

                          color: newArrivalsButtonTextColor,

                        }}

                        onClick={(e) => {

                          e.stopPropagation();

                          const catalogModelId = item?.catalogueModelId || item?.catalogue_model_id;

                          if (catalogModelId && item?.id) {

                            navigate(`/menu/${catalogModelId}/item/${item.id}`, {

                              state: {

                                fromPath: "/",

                              },

                            });

                          }

                        }}

                      >

                        Add to Cart

                      </button>

                    </div>

                  </button>

                );

              })}

            </div>

          </div>

        </section>

      )}


      <section

        className="home__section home__section--quick-actions"

        style={getSectionThemeStyle(homeCtaCardsBackgroundColor)}

      >

        <div className="home__section-header" style={{ margin: 35 }}>

          <h3>Quick Actions</h3>

          {/* <p>Jump to your most-used pages</p> */}

        </div>


        <div className="quick-actions-marquee">

          <div className={`home__quick-grid ${quickActions.length > 1 && !isMobileQuickActionsView ? "is-animated" : ""}`}>

            {quickActions.length > 0 ? (

              (isMobileQuickActionsView ? quickActions : marqueeQuickActions).map((item, index) => {

                const isDuplicateCard = !isMobileQuickActionsView && quickActions.length > 1 && index >= quickActions.length;

                const cardBg = item?.cardBgColor || item?.backgroundColor || ["#5b3fa6", "#c09060", "#2d4a3e"][index % 3];

                const textColor = item?.cardTextColor || getReadableTextColor(cardBg);

                const btnBg = item?.buttonBackgroundColor || "rgba(255,255,255,0.22)";

                const btnTextColor = item?.buttonTextColor || textColor;

                const mediaBg = item?.bgColor || "transparent";

                const itemImage = renderCardImage(item, "");

                const itemTitle = renderCardTitle(item, "Quick Action");

                const itemDescription = renderCardDescription(item, "");

                const itemTag = item?.tag || item?.badge || item?.offerHighlight || "";

                const itemButton = renderOfferButton(item, "Explore");


                return (

                  <button

                    key={`${item?.id || itemTitle || "quick-action"}-${index}`}

                    type="button"

                    className="promo-card"

                    aria-hidden={isDuplicateCard || undefined}

                    tabIndex={isDuplicateCard ? -1 : 0}

                    style={{ background: cardBg }}

                    onClick={() => navigateByRedirect(getCardRedirect(item))}

                  >

                    <div className="promo-card__body">

                      {itemTag && (

                        <span className="promo-card__tag" style={{ color: textColor }}>

                          {itemTag}

                        </span>

                      )}

                      <h4 className="promo-card__title" style={{ color: textColor }}>{itemTitle}</h4>

                      {itemDescription && (

                        <p className="promo-card__desc" style={{ color: textColor }}>{itemDescription}</p>

                      )}

                      <span

                        className="promo-card__cta"

                        style={{ background: btnBg, color: btnTextColor, borderColor: `${btnTextColor}44` }}

                      >

                        {itemButton} <FaArrowRight />

                      </span>

                    </div>

                    <div className="promo-card__visual" aria-hidden="true" style={{ background: mediaBg }}>

                      {itemImage

                        ? <img src={itemImage} alt={itemTitle} />

                        : <div className="promo-card__visual-placeholder" />}

                    </div>

                  </button>

                );

              })

            ) : (

              <div className="home__empty-state">Quick actions are not configured yet.</div>

            )}

          </div>

        </div>

      </section>


      <section

        className="home__section home__section--explore"

        style={getSectionThemeStyle(homeExploreCategoriesBackgroundColor)}

      >

        <div className="home__section-header" style={{ margin: 35 }}>

          <h3>Explore Categories</h3>

          {/* <p>Choose by mood and cravings</p> */}

        </div>


        <div className="category-showcase">

          <button type="button" className="showcase-nav showcase-nav--left" onClick={() => shiftCategoryShowcase(-1)} aria-label="Previous category">

            ‹

          </button>


          <div className="category-showcase__track">

            {categoryShowcaseItems.map((entry) => {

              const cardClass = entry.absOffset === 0 ? "is-center" : entry.absOffset === 1 ? "is-near" : "is-far";

              const sideClass = entry.offset < 0 ? "is-left" : entry.offset > 0 ? "is-right" : "is-middle";

              const item = entry.item;


              return (

                <div

                  key={item?.id || `${item?.title || "category"}-${entry.sourceIndex}`}

                  className={`showcase-category-card ${cardClass} ${sideClass}`}

                  role="button"

                  tabIndex={0}

                  onClick={() => {

                    if (entry.sourceIndex === activeCategoryIndex || exploreCategories.length <= 2) {

                      handleCategoryClick(item);

                      return;

                    }

                    setActiveCategoryIndex(entry.sourceIndex);

                  }}

                  onKeyDown={(event) => {

                    if (event.key === "Enter" || event.key === " ") {

                      event.preventDefault();

                      if (entry.sourceIndex === activeCategoryIndex || exploreCategories.length <= 2) {

                        handleCategoryClick(item);

                        return;

                      }

                      setActiveCategoryIndex(entry.sourceIndex);

                    }

                  }}

                >

                  <img

                    src={renderCardImage(item, "https://images.unsplash.com/photo-1512621776951-a57141f2eefd")}

                    alt={renderCardTitle(item, "Category")}

                  />

                  <div className="showcase-category-card__overlay">

                    <div className="showcase-category-card__text">

                      <h4>{renderCardTitle(item, "Curated Looks For You")}</h4>

                      <p>{renderCardDescription(item, "Discover curated outfits and categories tailored for every mood.")}</p>

                    </div>

                    <button

                      type="button"

                      className="showcase-category-card__action"

                      style={{

                        background: item?.buttonBackgroundColor || "rgba(255, 255, 255, 0.95)",

                        color: item?.buttonTextColor || "#111827",

                      }}

                      onClick={(event) => {

                        event.stopPropagation();

                        handleCategoryClick(item);

                      }}

                    >

                      {item?.buttonTitle || "Shop All"}

                    </button>

                  </div>

                </div>

              );

            })}

          </div>


          <button type="button" className="showcase-nav showcase-nav--right" onClick={() => shiftCategoryShowcase(1)} aria-label="Next category">

            ›

          </button>

        </div>


        {exploreCategories.length === 0 && (

          <div className="home__empty-state">No categories available at the moment.</div>

        )}

      </section>


      <section className="home__section" style={getSectionThemeStyle(homeSectionOffersBackgroundColor)}>

        <div className="home__section-header" style={{ margin: 35 }}>

          <h3>Offers</h3>

          <p>Current picks and promotions</p>

        </div>


        <div className="home__offer-grid">

          {offers.length > 0 ? (

            offers.map((item, index) => {

              const offerBgColor = item?.backgroundColor || "#ffffff";

              const offerButtonBg = item?.buttonBackgroundColor || "rgba(255, 255, 255, 0.74)";

              const offerTextColor = getReadableTextColor(offerBgColor);

              const offerButtonTextColor = item?.buttonTextColor || getReadableTextColor(offerButtonBg);

              const offerButtonTitle = renderOfferButton(item, "Claim offer");


              return (

                <button

                  key={item?.id || `${item?.title || "offer"}-${index}`}

                  type="button"

                  className="quick-card"

                  onClick={() => navigateByRedirect(getCardRedirect(item))}

                  style={{ background: offerBgColor }}

                >

                  <div className="quick-card__content">

                    <h4 style={{ color: offerTextColor }}>{renderCardTitle(item, "Special Offer")}</h4>

                    <p style={{ color: offerTextColor }}>{renderCardDescription(item, "Fresh deals curated for you.")}</p>

                  </div>

                  <div

                    className="quick-card__footer"

                    style={{ background: offerButtonBg, color: offerButtonTextColor }}

                  >

                    <span>{offerButtonTitle}</span>

                    <FaArrowRight />

                  </div>

                </button>

              );

            })

          ) : (

            <div className="home__empty-state">New offers will appear here soon.</div>

          )}

        </div>

      </section>


      <section

        className="home__section home__section--app-download"

        style={getSectionThemeStyle(downloadAppSectionBackgroundColor)}

      >

        <div className="app-download">

          <div className="app-download__content">

            <p className="app-download__eyebrow">Download App</p>

            <h3>{appDownloadTagline}</h3>

            <p>{appDownloadDescription}</p>

            <div className="app-download__actions">

              <button

                type="button"

                className="app-download__btn app-download__btn--primary"

                style={{ background: downloadPrimaryButtonBg, color: downloadPrimaryButtonText }}

                onClick={() => {

                  if (playStoreAppLink) {

                    window.open(playStoreAppLink, "_blank", "noopener,noreferrer");

                  }

                }}

                disabled={!playStoreAppLink}

              >

                Get it on Play Store

              </button>

              <button

                type="button"

                className="app-download__btn app-download__btn--secondary"

                style={{

                  background: downloadSecondaryButtonBg,

                  color: downloadSecondaryButtonText,

                  borderColor: downloadSecondaryButtonBorder,

                }}

                onClick={() => {

                  if (appStoreAppLink) {

                    window.open(appStoreAppLink, "_blank", "noopener,noreferrer");

                  }

                }}

                disabled={!appStoreAppLink}

              >

                Download on App Store

              </button>

            </div>

          </div>


          <div className="app-download__visual" aria-hidden="true">

            <div className="app-download__stack">

              {rotatingAppDownloadImages.map((image, index) => {

                const position = (index - appPreviewShift + rotatingAppDownloadImages.length) % rotatingAppDownloadImages.length;

                const variant = position === 0 ? "left" : position === 1 ? "center" : "right";


                return (

                  <div

                    key={`app-preview-${index}`}

                    className={`app-preview-card app-preview-card--${variant}`}

                  >

                    <img

                      src={image}

                      alt={`App preview ${index + 1}`}

                      onError={(event) => {

                        event.currentTarget.src = APP_DOWNLOAD_FALLBACK_IMAGE;

                      }}

                    />

                  </div>

                );

              })}

            </div>

          </div>

        </div>

      </section>


      <section

        className="home__section home__section--social home__section--last"

        style={getSectionThemeStyle(socialPageBackgroundColor)}

      >

        <div className="home__section-header" style={{ margin: 35 }}>

          <h3>Social Pages</h3>

          <p>Stay connected with our latest updates</p>

        </div>


        <div className="home__social-grid">

          {socialPages.length > 0 ? (

            socialPages.map((item, index) => {

              const socialTitle = renderCardTitle(item, "Social");

              const socialLogo = renderCardImage(item, "");

              const socialMeta = getSocialMeta(item, socialTitle);


              return (

                <button

                  key={item?.id || `${item?.title || "social"}-${index}`}

                  type="button"

                  className={`social-card ${getSocialToneClass(socialTitle)}`}

                  onClick={() => navigateByRedirect(getCardRedirect(item))}

                >

                  <div className="social-card__head">

                    <span className="social-card__logo" aria-hidden="true">

                      {socialLogo ? (

                        <img src={socialLogo} alt="" />

                      ) : (

                        getSocialFallbackLogo(socialTitle)

                      )}

                    </span>

                  </div>

                  <div className="social-card__body">

                    <h4>{socialTitle}</h4>

                    <p className="social-card__followers">{socialMeta.followers}</p>

                    <p className="social-card__subtitle">{socialMeta.subtitle}</p>

                  </div>

                  <span className="social-card__cta">

                    {socialMeta.ctaText} <FaArrowRight />

                  </span>

                </button>

              );

            })

          ) : (

            <div className="home__empty-state">Social links are not configured yet.</div>

          )}

        </div>

      </section>


      {loading && <div className="home__loading-indicator">Refreshing home content...</div>}

    </main>

  );

}


function Categories() {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const location = useLocation();

  const [selectedMainId, setSelectedMainId] = useState(

    () => location.state?.selectedMainId || readRestoreTarget()?.selectedMainId || null

  );

  const [selectedModelId, setSelectedModelId] = useState(

    () => location.state?.selectedModelId || readRestoreTarget()?.selectedModelId || null

  );

  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const [tabsStuck, setTabsStuck] = useState(false);

  const [showScrollTop, setShowScrollTop] = useState(false);

  const sentinelRef = useRef(null);

  const contentRef = useRef(null);

  const lastRestoredItemRef = useRef(null);


  const { list: catalogueModels, loading: modelsLoading } = useSelector((state) => state.catalogueModels);

  const { list: mainCatalogues, loading: mainCataloguesLoading } = useSelector(

    (state) => state.mainCatalogues || { list: [], loading: false }

  );

  const themeColors = useSelector((state) => state.homeReducer?.themeColors || {});

  const cardsBackgroundColor = themeColors?.cardsBackgroundColor || "#ffffff";

  const activeBackgroundColor = themeColors?.activeBackgroundColor || "#f5872a";

  const catalogReadableTextColor = getReadableTextColor(cardsBackgroundColor, "#111827", "#ffffff");

  const catalogReadableMutedColor =

    catalogReadableTextColor === "#ffffff" ? "rgba(255, 255, 255, 0.8)" : "rgba(17, 24, 39, 0.8)";

  const catalogActiveTextColor = getReadableTextColor(activeBackgroundColor, "#111827", "#ffffff");

  const catalogActiveHoverBg = getRgbaFromHex(activeBackgroundColor, 0.16, "rgba(245, 135, 42, 0.16)");

  const catalogActiveHoverBorder = getRgbaFromHex(activeBackgroundColor, 0.62, "rgba(245, 135, 42, 0.62)");

  const catalogActiveHoverShadow = getRgbaFromHex(activeBackgroundColor, 0.24, "rgba(245, 135, 42, 0.24)");

  const catalogActiveHoverGlow = getRgbaFromHex(activeBackgroundColor, 0.2, "rgba(245, 135, 42, 0.2)");

  const catalogBanner = useSelector((state) => state.homeReducer?.catalogBanner || []);

  const { items: catalogueItems, loading: itemsLoading } = useSelector((state) => state.catalogueItems);

  const cartItems = useSelector((state) => state.cart.cartItems);

  const user = useSelector((state) => state.auth?.user);


  const handleAuthAddToCart = (item, onSuccess) => {

    if (!user) {

      navigate("/login", { state: { from: location.pathname } });

      return;

    }


    dispatch(addToCart(item));

    if (typeof onSuccess === "function") {

      onSuccess();

    }

  };


  // Observe sentinel placed just above tabs.

  // When sentinel leaves viewport (scrolled past) → tabs have stuck → enable item scroll.

  // When sentinel enters viewport → tabs not stuck yet → let page scroll.

  useEffect(() => {

    const sentinel = sentinelRef.current;

    if (!sentinel) return;


    const headerOffset = window.innerWidth <= 768 ? 68 : 80;

    const observer = new IntersectionObserver(

      ([entry]) => {

        // entry.isIntersecting = sentinel is still below the fixed navbar

        setTabsStuck(!entry.isIntersecting);

      },

      { threshold: 0, rootMargin: `-${headerOffset}px 0px 0px 0px` }

    );

    observer.observe(sentinel);

    return () => observer.disconnect();

  }, []);


  useEffect(() => {

    const handleWindowScroll = () => {

      const contentScrollTop = contentRef.current?.scrollTop || 0;

      setShowScrollTop(window.scrollY > 260 || contentScrollTop > 120);

    };


    const contentNode = contentRef.current;

    window.addEventListener("scroll", handleWindowScroll, { passive: true });

    contentNode?.addEventListener("scroll", handleWindowScroll, { passive: true });

    handleWindowScroll();


    return () => {

      window.removeEventListener("scroll", handleWindowScroll);

      contentNode?.removeEventListener("scroll", handleWindowScroll);

    };

  }, [tabsStuck]);


  useEffect(() => {

    dispatch(getMainCatalogues());

    dispatch(getCatalogueModels());

    dispatch(getCatalogBannerData());

    dispatch(getCart());

  }, [dispatch]);


  const bannerSlides = useMemo(

    () =>

      normalizeToArray(catalogBanner)

        .map((entry) => String(entry?.image || entry?.imageUrl || "").trim())

        .filter(Boolean),

    [catalogBanner]

  );


  useEffect(() => {

    if (bannerSlides.length <= 1) {

      return undefined;

    }


    const interval = window.setInterval(() => {

      setActiveBannerIndex((prev) => (prev + 1) % bannerSlides.length);

    }, 3500);


    return () => window.clearInterval(interval);

  }, [bannerSlides.length]);


  useEffect(() => {

    if (activeBannerIndex >= bannerSlides.length) {

      setActiveBannerIndex(0);

    }

  }, [activeBannerIndex, bannerSlides.length]);


  // Auto-select first main catalogue once loaded

  useEffect(() => {

    if (mainCatalogues.length > 0 && !selectedMainId) {

      setSelectedMainId(mainCatalogues[0]?.id);

    }

  }, [mainCatalogues, selectedMainId]);


  const selectedMain = useMemo(

    () => mainCatalogues.find((m) => String(m?.id) === String(selectedMainId)),

    [mainCatalogues, selectedMainId]

  );


  const filteredModels = useMemo(() => {

    if (!selectedMainId || mainCatalogues.length === 0) return catalogueModels;

    return catalogueModels.filter((model) => {

      const parentId =

        model?.main_catalogue_id ||

        model?.mainCatalogueId ||

        model?.parentId ||

        model?.catalogueId ||

        model?.parentCatalogId ||

        model?.mainCategoryId ||

        model?.parentCategoryId;

      return parentId ? String(parentId) === String(selectedMainId) : false;

    });

  }, [catalogueModels, selectedMainId, mainCatalogues.length]);


  const selectedModel = useMemo(

    () => filteredModels.find((model) => String(model?.id) === String(selectedModelId)),

    [filteredModels, selectedModelId]

  );


  // Auto-select first model and fetch its items when filtered models change

  useEffect(() => {

    if (filteredModels.length > 0) {

      setSelectedModelId((current) => {

        const hasCurrent = filteredModels.some((model) => String(model?.id) === String(current));

        if (hasCurrent) {

          return current;

        }


        return filteredModels[0]?.id;

      });

    } else {

      setSelectedModelId(null);

    }

  }, [filteredModels]);


  // Fetch items whenever selected model changes

  useEffect(() => {

    if (selectedModelId) {

      dispatch(getCatalogueItems(selectedModelId));

    }

  }, [selectedModelId, dispatch]);


  // Scroll to item if coming back from PDP

  useEffect(() => {

    const restoreTarget = readRestoreTarget();

    const scrollToItemId =

      location.state?.scrollToItemId ||

      (restoreTarget?.sourcePath === location.pathname ? restoreTarget?.itemId : null);

    const scrollToItemToken =

      location.state?.scrollToItemToken ||

      (restoreTarget?.sourcePath === location.pathname ? restoreTarget?.itemToken : null);

    if (!scrollToItemId || catalogueItems.length === 0) {

      return;

    }


    const hasItemInCurrentSection = catalogueItems.some(

      (entry) => String(entry?.id) === String(scrollToItemId)

    );


    if (!hasItemInCurrentSection) {

      return;

    }


    const restoreKey = String(scrollToItemToken || scrollToItemId);

    if (lastRestoredItemRef.current === restoreKey) {

      return;

    }


    let retryTimer = null;

    let attempts = 0;

    const maxAttempts = 8;


    const tryRestoreScroll = () => {

      attempts += 1;


      const contentNode = contentRef.current;

      const itemElement =

        (scrollToItemToken

          ? contentNode?.querySelector(`[data-item-token="${scrollToItemToken}"]`) ||

          document.querySelector(`[data-item-token="${scrollToItemToken}"]`)

          : null) ||

        contentNode?.querySelector(`[data-item-id="${scrollToItemId}"]`) ||

        document.querySelector(`[data-item-id="${scrollToItemId}"]`);


      if (!itemElement) {

        if (attempts < maxAttempts) {

          retryTimer = window.setTimeout(tryRestoreScroll, 140);

        }

        return;

      }


      const canScrollContent =

        !!contentNode &&

        contentNode.classList.contains("cat-content--scrollable") &&

        contentNode.scrollHeight > contentNode.clientHeight + 1 &&

        contentNode.contains(itemElement);


      if (canScrollContent) {

        const contentRect = contentNode.getBoundingClientRect();

        const itemRect = itemElement.getBoundingClientRect();

        const nextScrollTop =

          contentNode.scrollTop + (itemRect.top - contentRect.top) - RESTORE_TOP_GAP;


        contentNode.scrollTo({

          top: Math.max(nextScrollTop, 0),

          behavior: attempts === 1 ? "smooth" : "auto",

        });

      } else {

        const headerHeight = window.innerWidth <= 768 ? 68 : 80;

        const targetTop = headerHeight + RESTORE_TOP_GAP;

        const itemRect = itemElement.getBoundingClientRect();

        const nextWindowTop = window.scrollY + itemRect.top - targetTop;


        window.scrollTo({

          top: Math.max(nextWindowTop, 0),

          behavior: attempts === 1 ? "smooth" : "auto",

        });

      }


      const itemRect = itemElement.getBoundingClientRect();

      const isVisibleInScrollablePane =

        canScrollContent &&

        !!contentNode &&

        itemRect.top >= contentNode.getBoundingClientRect().top + RESTORE_TOP_GAP - 4 &&

        itemRect.bottom <= contentNode.getBoundingClientRect().bottom - 8;


      const headerHeight = window.innerWidth <= 768 ? 68 : 80;

      const targetTop = headerHeight + RESTORE_TOP_GAP;

      const isVisibleInWindow =

        itemRect.top >= targetTop - 4 && itemRect.bottom <= window.innerHeight - 8;


      if (!isVisibleInScrollablePane && !isVisibleInWindow && attempts < maxAttempts) {

        retryTimer = window.setTimeout(tryRestoreScroll, 140);

        return;

      }


      lastRestoredItemRef.current = restoreKey;

      clearRestoreTarget();

    };


    retryTimer = window.setTimeout(tryRestoreScroll, 120);


    return () => {

      if (retryTimer) {

        window.clearTimeout(retryTimer);

      }

    };

  }, [location.state?.scrollToItemId, location.state?.scrollToItemToken, location.pathname, catalogueItems, tabsStuck, selectedModelId]);


  const handleMainTabClick = (id) => {

    setSelectedMainId(id);

    setSelectedModelId(null);

  };


  const handleScrollToTop = () => {

    if (contentRef.current) {

      contentRef.current.scrollTo({ top: 0, behavior: "smooth" });

    }


    window.scrollTo({ top: 0, behavior: "smooth" });

  };


  const handleContentWheel = (e) => {

    if (!tabsStuck || !contentRef.current) {

      return;

    }


    const container = contentRef.current;

    const { scrollTop, scrollHeight, clientHeight } = container;

    const deltaY = e.deltaY;

    const isScrollingDown = deltaY > 0;

    const isScrollingUp = deltaY < 0;

    const maxScrollTop = Math.max(scrollHeight - clientHeight, 0);

    const atTop = scrollTop <= 0;

    const atBottom = scrollTop >= maxScrollTop - 1;


    if ((isScrollingDown && !atBottom) || (isScrollingUp && !atTop)) {

      e.preventDefault();

      e.stopPropagation();

      container.scrollTop += deltaY;

    }

  };


  const getItemQty = (id) => {

    const found =

      cartItems.find((entry) => Number(entry.item_id) === Number(id)) ||

      cartItems.find((entry) => Number(entry.id) === Number(id));

    return found ? found.qty : 0;

  };


  const totalCartItems = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const totalCartAmount = cartItems.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);


  const isLoading = modelsLoading || mainCataloguesLoading;

  const activeBannerImage =

    bannerSlides[activeBannerIndex] ||

    selectedMain?.bannerImage ||

    selectedMain?.coverImage ||

    selectedMain?.banner ||

    selectedMain?.image ||

    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80";


  return (

    <div

      className="categories-v2"

      style={{

        "--cat-readable-text": catalogReadableTextColor,

        "--cat-readable-muted": catalogReadableMutedColor,

        "--cat-active-bg": activeBackgroundColor,

        "--cat-active-text": catalogActiveTextColor,

        "--cat-active-hover-bg": catalogActiveHoverBg,

        "--cat-active-hover-border": catalogActiveHoverBorder,

        "--cat-active-hover-shadow": catalogActiveHoverShadow,

        "--cat-active-hover-glow": catalogActiveHoverGlow,

      }}

    >


      {/* ── Banner ── */}

      {selectedMain && (

        <div className="cat-banner">

          <img

            src={activeBannerImage}

            alt={selectedMain?.name || ""}

            className="cat-banner__img"

          />

          <div className="cat-banner__overlay">

            <div className="cat-banner__text">

              {(selectedMain?.bannerSubtitle || selectedMain?.description) && (

                <p>{selectedMain?.bannerSubtitle || selectedMain?.description}</p>

              )}

            </div>

          </div>

        </div>

      )}


      {/* ── Sentinel: 1px invisible div sitting just above the tabs.

           When this scrolls out of view the tabs have reached navbar. ── */}

      <div ref={sentinelRef} className="cat-tabs-sentinel" aria-hidden="true" />


      {/* ── Main-catalogue tabs below banner ── */}

      {mainCatalogues.length > 0 && (

        <div className="cat-tabs-wrap">

          <div className="cat-tabs" role="tablist">

            {mainCatalogues.map((main) => {

              const id = main?.id;

              const isActive = String(id) === String(selectedMainId);

              return (

                <button

                  key={id}

                  type="button"

                  role="tab"

                  aria-selected={isActive}

                  className={`cat-tab ${isActive ? "cat-tab--active" : ""}`}

                  onClick={() => handleMainTabClick(id)}

                >

                  <div className="cat-tab__circle">

                    <img

                      src={main?.image || main?.icon || main?.imageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=120&q=80"}

                      alt={main?.name || ""}

                    />

                  </div>

                  <span className="cat-tab__label">{main?.name}</span>

                </button>

              );

            })}

          </div>

        </div>

      )}


      {/* ── Body: sidebar 30% + content 70% ── */}

      {isLoading ? (

        <div className="cat-loading">

          <div className="spinner" />

          <p>Loading categories...</p>

        </div>

      ) : filteredModels.length === 0 ? (

        <div className="cat-empty">

          <h3>No categories found</h3>

          <p>Check back soon for new arrivals.</p>

        </div>

      ) : (

        <div className="cat-body">


          {/* ── Left sidebar: catalogue models ── */}

          <nav className="cat-sidebar" aria-label="Sub-categories">

            {filteredModels.map((model) => {

              const id = model?.id;

              const isActive = String(id) === String(selectedModelId);

              const name = model?.name || model?.title || "";

              const image = model?.image || model?.icon || model?.imageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=120&q=80";

              return (

                <button

                  key={id}

                  type="button"

                  className={`cat-sidebar__item ${isActive ? "cat-sidebar__item--active" : ""}`}

                  onClick={() => setSelectedModelId(id)}

                >

                  <div className="cat-sidebar__img-wrap">

                    <img src={image} alt={name} />

                  </div>

                  <span className="cat-sidebar__label">{name}</span>

                </button>

              );

            })}

          </nav>


          {/* ── Right content: items ── */}

          <div

            ref={contentRef}

            className={`cat-content${tabsStuck ? " cat-content--scrollable" : ""}`}

            onWheel={handleContentWheel}

          >

            {itemsLoading ? (

              <div className="cat-loading">

                <div className="spinner" />

                <p>Loading items...</p>

              </div>

            ) : catalogueItems.length > 0 ? (

              <div className="cat-items-grid">

                {catalogueItems.map((item, index) => {

                  const qty = getItemQty(item.id);

                  const discountInfo = getCatalogItemDiscountInfo(item);

                  const image = item.images?.[0] || item.image || "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38";

                  const itemToken = makeRestoreToken(selectedModelId, item.id, index);

                  const catalogCardBackground = cardsBackgroundColor;

                  const catalogCardTextColor = getReadableTextColor(catalogCardBackground, "#111827", "#ffffff");

                  const catalogCardMutedColor =

                    catalogCardTextColor === "#ffffff" ? "rgba(255, 255, 255, 0.76)" : "rgba(17, 24, 39, 0.76)";

                  const catalogCardBorderColor =

                    catalogCardTextColor === "#ffffff" ? "rgba(255, 255, 255, 0.2)" : "rgba(15, 23, 42, 0.14)";

                  return (

                    <div

                      key={item.id}

                      className="cat-item-card"

                      data-item-id={item.id}

                      data-item-token={itemToken}

                      style={{

                        "--cat-item-card-bg": catalogCardBackground,

                        "--cat-item-card-text": catalogCardTextColor,

                        "--cat-item-card-muted": catalogCardMutedColor,

                        "--cat-item-card-border": catalogCardBorderColor,

                      }}

                    >

                      <button

                        type="button"

                        className="cat-item-card__img-wrap"

                        onClick={() =>

                        (writeRestoreTarget({

                          sourcePath: location.pathname,

                          itemId: item.id,

                          itemToken,

                          selectedMainId,

                          selectedModelId,

                        }),

                          navigate(`/menu/${selectedModelId}/item/${item.id}`, {

                            state: {

                              fromPath: location.pathname,

                              breadcrumbMain: selectedMain?.name || "",

                              breadcrumbSub: selectedModel?.name || "",

                              scrollToItemToken: itemToken,

                              selectedMainId,

                              selectedModelId,

                            },

                          }))

                        }

                        aria-label={`View ${item.name}`}

                      >

                        <img src={image} alt={item.name} />

                        {discountInfo && (

                          <span className="cat-item-card__discount">{discountInfo.discountPercent}% OFF</span>

                        )}

                      </button>

                      <div className="cat-item-card__body">

                        <p className="cat-item-card__name">{item.name}</p>

                        {item.description && (

                          <p className="cat-item-card__desc">{item.description}</p>

                        )}

                        <div className="cat-item-card__footer">

                          <span className="cat-item-card__price">₹{getCatalogItemDisplayPrice(item)}</span>

                          {qty === 0 ? (

                            <button

                              type="button"

                              className="cat-item-card__add"

                              style={{

                                background: catalogCardBackground,

                                color: catalogCardTextColor,

                                borderColor: catalogCardBorderColor,

                              }}

                              onClick={(event) => {

                                event.stopPropagation();

                                handleAuthAddToCart(item, () => {

                                  writeRestoreTarget({

                                    sourcePath: location.pathname,

                                    itemId: item.id,

                                    itemToken,

                                    selectedMainId,

                                    selectedModelId,

                                  });

                                  navigate(`/menu/${selectedModelId}/item/${item.id}`, {

                                    state: {

                                      fromPath: location.pathname,

                                      breadcrumbMain: selectedMain?.name || "",

                                      breadcrumbSub: selectedModel?.name || "",

                                      scrollToItemToken: itemToken,

                                      selectedMainId,

                                      selectedModelId,

                                    },

                                  });

                                });

                              }}

                            >

                              ADD

                            </button>

                          ) : (

                            <div className="cat-item-card__qty">

                              <button type="button" onClick={() => dispatch(removeFromCart(item))}>−</button>

                              <span>{qty}</span>

                              <button type="button" onClick={() => handleAuthAddToCart(item)}>+</button>

                            </div>

                          )}

                        </div>

                      </div>

                    </div>

                  );

                })}

              </div>

            ) : (

              <div className="cat-empty">

                <h3>No items available</h3>

                <p>Select another category.</p>

              </div>

            )}

          </div>

        </div>

      )}


      {/* ── Floating cart bar ── */}

      {totalCartItems > 0 && (

        <div className="cat-floating-cart">

          <div className="cat-floating-cart__info">

            <FaShoppingCart />

            <span>{totalCartItems} item{totalCartItems > 1 ? "s" : ""}</span>

            <span className="cat-floating-cart__sep">·</span>

            <span>₹{totalCartAmount}</span>

          </div>

          <button type="button" className="cat-floating-cart__btn" onClick={() => navigate("/cart")}>

            View Cart <FaArrowRight />

          </button>

        </div>

      )}


      {showScrollTop && (

        <button

          type="button"

          className="cat-scroll-top"

          onClick={handleScrollToTop}

          aria-label="Scroll to top"

        >

          <FaArrowUp />

        </button>

      )}


    </div>

  );

}


function Menu() {

  const { categoryId } = useParams();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");

  const lastRestoredItemRef = useRef(null);

  const themeColors = useSelector((state) => state.homeReducer?.themeColors || {});

  const cardsBackgroundColor = themeColors?.cardsBackgroundColor || "#ffffff";


  const { items, loading } = useSelector(

    (state) => state.catalogueItems

  );


  const cartItems = useSelector(

    (state) => state.cart.cartItems

  );

  const user = useSelector((state) => state.auth?.user);


  const handleAuthAddToCart = (item, onSuccess) => {

    if (!user) {

      navigate("/login", { state: { from: location.pathname } });

      return;

    }


    dispatch(addToCart(item));

    if (typeof onSuccess === "function") {

      onSuccess();

    }

  };


  useEffect(() => {

    dispatch(getCatalogueItems(categoryId));

    dispatch(getCart());

  }, [dispatch, categoryId]);


  useEffect(() => {

    const restoreTarget = readRestoreTarget();

    const scrollToItemId =

      location.state?.scrollToItemId ||

      (restoreTarget?.sourcePath === location.pathname ? restoreTarget?.itemId : null);

    const scrollToItemToken =

      location.state?.scrollToItemToken ||

      (restoreTarget?.sourcePath === location.pathname ? restoreTarget?.itemToken : null);

    if (!scrollToItemId || items.length === 0) {

      return;

    }


    const restoreKey = String(scrollToItemToken || scrollToItemId);

    if (lastRestoredItemRef.current === restoreKey) {

      return;

    }


    let retryTimer = null;

    let attempts = 0;

    const maxAttempts = 8;


    const tryRestoreScroll = () => {

      attempts += 1;


      const itemElement =

        (scrollToItemToken ? document.querySelector(`[data-item-token="${scrollToItemToken}"]`) : null) ||

        document.querySelector(`[data-item-id="${scrollToItemId}"]`);

      if (!itemElement) {

        if (attempts < maxAttempts) {

          retryTimer = window.setTimeout(tryRestoreScroll, 140);

        }

        return;

      }


      const headerHeight = window.innerWidth <= 768 ? 68 : 80;

      const targetTop = headerHeight + RESTORE_TOP_GAP;

      const itemRect = itemElement.getBoundingClientRect();

      const nextWindowTop = window.scrollY + itemRect.top - targetTop;


      window.scrollTo({

        top: Math.max(nextWindowTop, 0),

        behavior: attempts === 1 ? "smooth" : "auto",

      });


      const updatedRect = itemElement.getBoundingClientRect();

      const isVisibleInWindow =

        updatedRect.top >= targetTop - 4 && updatedRect.bottom <= window.innerHeight - 8;


      if (!isVisibleInWindow && attempts < maxAttempts) {

        retryTimer = window.setTimeout(tryRestoreScroll, 140);

        return;

      }


      lastRestoredItemRef.current = restoreKey;

      clearRestoreTarget();

    };


    retryTimer = window.setTimeout(tryRestoreScroll, 120);


    return () => {

      if (retryTimer) {

        window.clearTimeout(retryTimer);

      }

    };

  }, [location.state?.scrollToItemId, location.state?.scrollToItemToken, location.pathname, items]);


  const getItemQty = (id) => {

    const item =

      cartItems.find((entry) => Number(entry.item_id) === Number(id)) ||

      cartItems.find((entry) => Number(entry.id) === Number(id));

    return item ? item.qty : 0;

  };


  const filteredItems = useMemo(() => {

    const query = searchTerm.trim().toLowerCase();


    if (!query) {

      return items;

    }


    return items.filter((item) => {

      const name = String(item?.name || "").toLowerCase();

      const description = String(item?.description || "").toLowerCase();

      return name.includes(query) || description.includes(query);

    });

  }, [items, searchTerm]);


  const totalAmount = cartItems.reduce(

    (sum, item) => sum + Number(item.price) * item.qty,

    0

  );


  const totalItems = cartItems.reduce(

    (sum, item) => sum + item.qty,

    0

  );


  const breadcrumbMainFromState = location.state?.breadcrumbMain || "";

  const breadcrumbSubFromState =

    location.state?.breadcrumbSub ||

    location.state?.categoryName ||

    "";


  const openItemDetail = (itemId, itemToken) => {

    writeRestoreTarget({

      sourcePath: location.pathname,

      itemId,

      itemToken,

    });


    navigate(`/menu/${categoryId}/item/${itemId}`, {

      state: {

        fromPath: location.pathname,

        breadcrumbMain: breadcrumbMainFromState,

        breadcrumbSub: breadcrumbSubFromState,

        scrollToItemToken: itemToken,

      },

    });

  };


  return (

    <div className="menu">

      <div className="menu__header">

        <button

          className="menu__back-btn"

          onClick={() => navigate("/categories")}

        >

          Back to categories

        </button>

        <div className="menu__eyebrow">Category Menu</div>

        <p className="menu__subtitle">{items.length} items available in this category. Tap any card to view full product detail.</p>

        <div className="menu__search">

          <input

            type="text"

            placeholder="Search menu items"

            value={searchTerm}

            onChange={(event) => setSearchTerm(event.target.value)}

          />

        </div>

      </div>


      {loading ? (

        <div className="menu__loading">

          <div className="spinner"></div>

          <p>Loading menu items...</p>

        </div>

      ) : (

        <>

          <div className="menu__grid">

            {filteredItems.map((item, index) => {

              const qty = getItemQty(item.id);

              const discountInfo = getCatalogItemDiscountInfo(item);

              const itemToken = makeRestoreToken(categoryId, item.id, index);


              return (

                <div

                  key={item.id}

                  className="menu-card"

                  data-item-id={item.id}

                  data-item-token={itemToken}

                  role="button"

                  tabIndex={0}

                  onClick={() => openItemDetail(item.id, itemToken)}

                  onKeyDown={(event) => {

                    if (event.key === "Enter" || event.key === " ") {

                      event.preventDefault();

                      openItemDetail(item.id, itemToken);

                    }

                  }}

                >

                  <button

                    type="button"

                    className="menu-card__image"

                    onClick={(event) => {

                      event.stopPropagation();

                      openItemDetail(item.id, itemToken);

                    }}

                  >

                    <img

                      src={item.images?.[0] || "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"}

                      alt={item.name}

                      className="item-image"

                    />

                    {discountInfo && (

                      <span className="menu-card__discount">{discountInfo.discountPercent}% OFF</span>

                    )}

                    <div className="menu-card__labels">

                      <span className="menu-card__label">Top pick</span>

                      <span className="menu-card__label menu-card__label--muted">Fast prep</span>

                    </div>

                  </button>


                  <div className="menu-card__content">

                    <button

                      type="button"

                      className="menu-card__title-wrap"

                      onClick={(event) => {

                        event.stopPropagation();

                        openItemDetail(item.id, itemToken);

                      }}

                    >

                      <h3 className="item-name">{item.name}</h3>

                      <div className="item-rating">

                        <FaStar className="icon" />

                        <span>4.5</span>

                      </div>

                    </button>


                    <p className="item-description">

                      {item.description || "Delicious dish made with fresh ingredients"}

                    </p>


                    <div className="item-footer">

                      <div className="price-container">

                        <span className="item-price">₹{getCatalogItemDisplayPrice(item)}</span>

                        {discountInfo && (

                          <span className="original-price">₹{discountInfo.comparePrice}</span>

                        )}

                      </div>


                      {discountInfo && (

                        <span className="menu-card__discount-meta">

                          Save ₹{discountInfo.discountValue} · {discountInfo.discountPercent}% off

                        </span>

                      )}


                      {qty === 0 ? (

                        <button

                          className="add-btn"

                          style={{

                            background: item?.buttonBackgroundColor || item?.backgroundColor || item?.cardBgColor || cardsBackgroundColor,

                            color:

                              item?.buttonTextColor ||

                              item?.cardTextColor ||

                              getReadableTextColor(

                                item?.buttonBackgroundColor || item?.backgroundColor || item?.cardBgColor || cardsBackgroundColor,

                                "#111827",

                                "#ffffff"

                              ),

                            borderColor:

                              item?.buttonTextColor ||

                                item?.cardTextColor ||

                                getReadableTextColor(

                                  item?.buttonBackgroundColor || item?.backgroundColor || item?.cardBgColor || cardsBackgroundColor,

                                  "#111827",

                                  "#ffffff"

                                ) === "#ffffff"

                                ? "rgba(255, 255, 255, 0.24)"

                                : "rgba(15, 23, 42, 0.16)",

                          }}

                          onClick={(event) => {

                            event.stopPropagation();

                            handleAuthAddToCart(item, () => openItemDetail(item.id, itemToken));

                          }}

                        >

                          <FaShoppingCart className="icon" />

                          <span>Add</span>

                        </button>

                      ) : (

                        <div className="quantity-controls">

                          <button

                            className="qty-btn minus"

                            onClick={(event) => {

                              event.stopPropagation();

                              dispatch(removeFromCart(item));

                            }}

                          >

                            -

                          </button>

                          <span className="qty-display">{qty}</span>

                          <button

                            className="qty-btn plus"

                            onClick={(event) => {

                              event.stopPropagation();

                              handleAuthAddToCart(item);

                            }}

                          >

                            +

                          </button>

                        </div>

                      )}

                    </div>


                    <button

                      type="button"

                      className="menu-card__details-btn"

                      onClick={() => openItemDetail(item.id, itemToken)}

                    >

                      View details <FaArrowRight />

                    </button>

                  </div>

                </div>

              );

            })}

          </div>


          {filteredItems.length === 0 && (

            <div className="menu__empty">

              <h3>No menu items found</h3>

              <p>Adjust your search and try again.</p>

            </div>

          )}


          {cartItems.length > 0 && (

            <div className="floating-cart">

              <div className="cart-summary">

                <div className="cart-info">

                  <div className="cart-count">

                    <FaShoppingCart className="icon" />

                    <span>{totalItems} items</span>

                  </div>

                  <div className="cart-total">

                    <span className="total-label">Total:</span>

                    <span className="total-amount">₹{totalAmount}</span>

                  </div>

                </div>

                <button

                  className="view-cart-btn"

                  onClick={() => navigate("/cart")}

                >

                  View Cart

                </button>

              </div>

            </div>

          )}

        </>

      )}

    </div>

  );

}

function ProductDetail() {

  const { categoryId, itemId } = useParams();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const location = useLocation();

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [selectedColor, setSelectedColor] = useState(null);

  const [selectedSize, setSelectedSize] = useState(null);

  const [activeInfoSection, setActiveInfoSection] = useState("description");


  const { items, loading } = useSelector((state) => state.catalogueItems);

  const cartItems = useSelector((state) => state.cart.cartItems);

  const user = useSelector((state) => state.auth?.user);

  const themeColors = useSelector((state) => state.homeReducer?.themeColors || {});

  const pdpBackgroundColor = themeColors?.webBackgroundColor || "var(--app-page-bg, #050505)";

  const pdpTextColor = getReadableTextColor(pdpBackgroundColor, "#111827", "#ffffff");

  const isPdpDark = pdpTextColor === "#ffffff";

  const pdpMutedText = isPdpDark ? "rgba(255, 255, 255, 0.78)" : "rgba(17, 24, 39, 0.78)";

  const pdpSubtleText = isPdpDark ? "rgba(255, 255, 255, 0.62)" : "rgba(17, 24, 39, 0.62)";

  const pdpBorderColor = isPdpDark ? "rgba(255, 255, 255, 0.24)" : "rgba(17, 24, 39, 0.2)";

  const pdpSurfaceColor = isPdpDark ? "#1d2636" : "#ffffff";

  const pdpRaisedSurfaceColor = isPdpDark ? "#0b162d" : "#f3f4f6";

  const pdpSizeButtonBg = isPdpDark ? "#253247" : "#e5e7eb";

  const pdpSizeButtonText = getReadableTextColor(pdpSizeButtonBg, "#111827", "#ffffff");

  const pdpSizeButtonActiveBg = isPdpDark ? "#f9fafb" : "#111827";

  const pdpSizeButtonActiveText = getReadableTextColor(pdpSizeButtonActiveBg, "#111827", "#ffffff");

  const pdpAddButtonBg =

    themeColors?.primaryButtonBackgroundColor ||

    themeColors?.["Primary Button Background Color"] ||

    (isPdpDark ? "#e5e7eb" : "#111827");

  const pdpAddButtonText = getReadableTextColor(pdpAddButtonBg, "#111827", "#ffffff");

  const pdpSecondaryButtonBg =

    themeColors?.["Secondary Button Background Color"] ||

    themeColors?.secondaryButtonBackgroundColor ||

    (isPdpDark ? "#ef4444" : "#b91c1c");

  const pdpSecondaryButtonText = getReadableTextColor(pdpSecondaryButtonBg, "#111827", "#ffffff");

  const pdpInfoBackgroundColor = themeColors?.webBackgroundColor || pdpBackgroundColor;

  const pdpInfoTextColor = getReadableTextColor(pdpInfoBackgroundColor, "#111827", "#ffffff");

  const pdpInfoMutedTextColor =

    pdpInfoTextColor === "#ffffff" ? "rgba(255, 255, 255, 0.78)" : "rgba(17, 24, 39, 0.78)";

  const pdpInfoBorderColor =

    pdpInfoTextColor === "#ffffff" ? "rgba(255, 255, 255, 0.26)" : "rgba(17, 24, 39, 0.22)";

  const similarCardBackgroundColor = themeColors?.cardsBackgroundColor || pdpSurfaceColor;

  const similarCardTextColor = getReadableTextColor(similarCardBackgroundColor, "#111827", "#ffffff");

  const similarCardMutedTextColor =

    similarCardTextColor === "#ffffff" ? "rgba(255, 255, 255, 0.72)" : "rgba(17, 24, 39, 0.72)";

  const similarCardSubtleTextColor =

    similarCardTextColor === "#ffffff" ? "rgba(255, 255, 255, 0.58)" : "rgba(17, 24, 39, 0.58)";

  const similarCardBorderColor =

    similarCardTextColor === "#ffffff" ? "rgba(255, 255, 255, 0.22)" : "rgba(17, 24, 39, 0.2)";

  const similarCardRaisedSurfaceColor =

    similarCardTextColor === "#ffffff" ? "rgba(255, 255, 255, 0.08)" : "rgba(17, 24, 39, 0.08)";

  const pdpThemeStyle = {

    background: pdpBackgroundColor,

    color: pdpTextColor,

    "--pdp-text": pdpTextColor,

    "--pdp-muted-text": pdpMutedText,

    "--pdp-subtle-text": pdpSubtleText,

    "--pdp-border": pdpBorderColor,

    "--pdp-surface": pdpSurfaceColor,

    "--pdp-raised-surface": pdpRaisedSurfaceColor,

    "--pdp-size-btn-bg": pdpSizeButtonBg,

    "--pdp-size-btn-text": pdpSizeButtonText,

    "--pdp-size-btn-active-bg": pdpSizeButtonActiveBg,

    "--pdp-size-btn-active-text": pdpSizeButtonActiveText,

    "--pdp-add-btn-bg": pdpAddButtonBg,

    "--pdp-add-btn-text": pdpAddButtonText,

    "--pdp-secondary-btn-bg": pdpSecondaryButtonBg,

    "--pdp-secondary-btn-text": pdpSecondaryButtonText,

    "--pdp-info-bg": pdpInfoBackgroundColor,

    "--pdp-info-text": pdpInfoTextColor,

    "--pdp-info-muted": pdpInfoMutedTextColor,

    "--pdp-info-border": pdpInfoBorderColor,

    "--pdp-similar-card-bg": similarCardBackgroundColor,

    "--pdp-similar-card-text": similarCardTextColor,

    "--pdp-similar-card-muted": similarCardMutedTextColor,

    "--pdp-similar-card-subtle": similarCardSubtleTextColor,

    "--pdp-similar-card-border": similarCardBorderColor,

    "--pdp-similar-card-raised": similarCardRaisedSurfaceColor,

  };


  useEffect(() => {

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

  }, [categoryId, itemId]);


  useEffect(() => {

    dispatch(getCatalogueItems(categoryId));

    dispatch(getCart());

  }, [dispatch, categoryId]);


  const product = useMemo(

    () => items.find((entry) => String(entry?.id) === String(itemId)),

    [items, itemId]

  );


  useEffect(() => {

    setActiveImageIndex(0);

  }, [itemId]);


  useEffect(() => {

    setSelectedColor(null);

    setSelectedSize(null);

    setActiveInfoSection("description");

  }, [itemId]);


  const productImages = useMemo(() => {

    if (!product) {

      return ["https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"];

    }


    if (Array.isArray(product.images) && product.images.length > 0) {

      return product.images;

    }


    return [product.image || "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"];

  }, [product]);


  const qtyInCart = useMemo(() => {

    const found =

      cartItems.find((entry) => Number(entry.item_id) === Number(product?.id)) ||

      cartItems.find((entry) => Number(entry.id) === Number(product?.id));

    return found ? found.qty : 0;

  }, [cartItems, product]);


  const productColors = useMemo(() => {

    const colorMap = {

      black: "#111111",

      white: "#f5f5f5",

      beige: "#d6cbb6",

      cream: "#ece2cc",

      offwhite: "#efece1",

      ivory: "#f2efe3",

      grey: "#777b83",

      gray: "#777b83",

      blue: "#3d5ea6",

      navy: "#243b6b",

      red: "#be2026",

      maroon: "#6d1a21",

      green: "#3e6d47",

      olive: "#5f6a3d",

      yellow: "#d6a317",

      mustard: "#b48115",

      orange: "#d97706",

      pink: "#d97797",

      purple: "#7d5ca5",

      brown: "#7a5537",

      khaki: "#8a7a52",

      gold: "#b6902d",

      silver: "#a7abb3",

    };


    const normalizeColor = (name, value) => {

      const cleanedName = String(name || "").trim();

      const cleanedValue = String(value || "").trim();


      if (!cleanedName && !cleanedValue) {

        return null;

      }


      if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(cleanedValue)) {

        return { name: cleanedName || "Color", value: cleanedValue };

      }


      const lookupKey = (cleanedName || cleanedValue).toLowerCase().replace(/[^a-z]/g, "");

      if (lookupKey && colorMap[lookupKey]) {

        return { name: cleanedName || cleanedValue, value: colorMap[lookupKey] };

      }


      return { name: cleanedName || cleanedValue || "Color", value: "#d7d2c7" };

    };


    const colorsFromApi =

      product?.colors ||

      product?.colourOptions ||

      product?.colorOptions ||

      product?.color ||

      [];


    const fromApi = Array.isArray(colorsFromApi)

      ? colorsFromApi

        .map((entry) => {

          if (typeof entry === "string") {

            return normalizeColor(entry, entry);

          }


          return normalizeColor(entry?.name || entry?.label, entry?.hex || entry?.code || entry?.value);

        })

        .filter(Boolean)

      : [normalizeColor(colorsFromApi, colorsFromApi)].filter(Boolean);


    if (fromApi.length > 0) {

      return fromApi;

    }


    const colorTokens = Object.keys(colorMap);

    const sourceText = `${product?.name || ""} ${(product?.tags || []).join(" ")}`.toLowerCase();

    const matchedToken = colorTokens.find((token) => sourceText.includes(token));


    if (!matchedToken) {

      return [];

    }


    const readableName = matchedToken.charAt(0).toUpperCase() + matchedToken.slice(1);

    return [{ name: readableName, value: colorMap[matchedToken] }];

  }, [product]);


  useEffect(() => {

    if (productColors.length === 0) {

      return;

    }


    setSelectedColor((current) => {

      if (current !== null && productColors[current]) {

        return current;

      }


      return 0;

    });

  }, [productColors]);


  const productVariants = useMemo(() => {

    if (!Array.isArray(product?.variants)) {

      return [];

    }


    return product.variants.filter((variant) => variant?.status !== "inactive");

  }, [product]);


  useEffect(() => {

    if (productVariants.length === 0) {

      return;

    }


    setSelectedSize((current) => {

      if (current !== null && productVariants[current]) {

        return current;

      }


      const firstInStockIndex = productVariants.findIndex((variant) => Number(variant?.stock) > 0);

      return firstInStockIndex >= 0 ? firstInStockIndex : 0;

    });

  }, [productVariants]);


  const productSizes = useMemo(() => {

    if (productVariants.length > 0) {

      return productVariants.map((variant) => ({

        label: String(variant?.variant_name || "Default"),

        stock: Number(variant?.stock || 0),

      }));

    }


    const sizes = product?.sizes || product?.sizeOptions;


    if (Array.isArray(sizes) && sizes.length > 0) {

      return sizes.map((entry) => ({ label: String(entry), stock: Number(product?.stock || 0) }));

    }


    return [];

  }, [product, productVariants]);


  const selectedVariant = useMemo(() => {

    if (productVariants.length === 0) {

      return null;

    }


    return productVariants[selectedSize ?? 0] || productVariants[0];

  }, [productVariants, selectedSize]);


  const resolvedPrice = useMemo(() => {

    const variantPrice = Number(selectedVariant?.price);

    const productPrice = Number(product?.price);


    if (variantPrice > 0) {

      return variantPrice;

    }


    if (productPrice > 0) {

      return productPrice;

    }


    return 0;

  }, [product, selectedVariant]);


  const resolvedComparePrice = useMemo(() => {

    const variantComparePrice = Number(selectedVariant?.compare_price);

    const productComparePrice = Number(product?.compare_price || product?.originalPrice);


    if (variantComparePrice > resolvedPrice) {

      return variantComparePrice;

    }


    if (productComparePrice > resolvedPrice) {

      return productComparePrice;

    }


    return 0;

  }, [product, resolvedPrice, selectedVariant]);


  const discountPercent = useMemo(() => {

    const current = Number(resolvedPrice);

    const original = Number(resolvedComparePrice);


    if (!current || !original || original <= current) {

      return 0;

    }


    return Math.round(((original - current) / original) * 100);

  }, [resolvedComparePrice, resolvedPrice]);


  const productMeta = useMemo(() => {

    const meta = [];


    if (product?.specifications) {

      meta.push({ title: "Specifications", value: product.specifications });

    }


    if (product?.features) {

      meta.push({ title: "Features", value: product.features });

    }


    const dimensionParts = [product?.dimensions, product?.weight].filter(Boolean);

    if (dimensionParts.length > 0) {

      meta.push({ title: "Dimensions", value: dimensionParts.join(" | ") });

    }


    if (product?.warranty) {

      meta.push({ title: "Warranty", value: product.warranty });

    }


    if (product?.sku) {

      meta.push({ title: "SKU", value: product.sku });

    }


    return meta;

  }, [product]);


  const productForCart = useMemo(() => {

    if (!product) {

      return null;

    }


    return {

      ...product,

      price: resolvedPrice,

      compare_price: resolvedComparePrice || null,

      originalPrice: resolvedComparePrice || null,

      color: productColors[selectedColor ?? 0]?.name || null,

      variant: selectedVariant || undefined,

      variant_id: selectedVariant?.id || null,

      variant_name: selectedVariant?.variant_name || null,

    };

  }, [product, productColors, resolvedComparePrice, resolvedPrice, selectedColor, selectedVariant]);


  const isOutOfStock = useMemo(() => {

    if (selectedVariant) {

      return Number(selectedVariant?.stock || 0) <= 0;

    }


    return Number(product?.stock || 0) <= 0;

  }, [product, selectedVariant]);


  const specificationEntries = useMemo(

    () =>

      productMeta.length > 0

        ? productMeta

        : [{ title: "Availability", value: isOutOfStock ? "Currently out of stock" : "Available to order" }],

    [productMeta, isOutOfStock]

  );


  const formatPrice = (value) => {

    const amount = Number(value);


    if (!Number.isFinite(amount)) {

      return "0";

    }


    return amount.toFixed(2).replace(/\.00$/, "");

  };


  const onBuyNow = () => {

    if (!productForCart || isOutOfStock) {

      return;

    }


    if (!user) {

      navigate("/login", { state: { from: location.pathname } });

      return;

    }


    dispatch(addToCart(productForCart));

    navigate("/cart");

  };


  const similarItems = useMemo(() => {

    const currentBrand = String(product?.brand || "").trim().toLowerCase();


    const ranked = items

      .filter((entry) => String(entry?.id) !== String(itemId))

      .map((entry, index) => {

        const brand = String(entry?.brand || "").trim().toLowerCase();

        const brandScore = currentBrand && brand === currentBrand ? 1 : 0;

        return { entry, brandScore, index };

      })

      .sort((a, b) => b.brandScore - a.brandScore || a.index - b.index)

      .slice(0, 5)

      .map((row) => row.entry);


    return ranked;

  }, [items, itemId, product?.brand]);


  if (loading && !product) {

    return (

      <div className="pdp pdp--loading" style={pdpThemeStyle}>

        <div className="spinner"></div>

        <p>Loading product details...</p>

      </div>

    );

  }


  if (!product) {

    return (

      <div className="pdp pdp--empty" style={pdpThemeStyle}>

        <h2>Product not found</h2>

        <p>This item is unavailable right now.</p>

        <button type="button" onClick={() => navigate(`/menu/${categoryId}`)}>Back to menu</button>

      </div>

    );

  }


  const activeImage = productImages[Math.min(activeImageIndex, productImages.length - 1)];

  const selectedColorOption = productColors[selectedColor ?? 0] || null;

  const sourcePath = location.state?.fromPath || `/menu/${categoryId}`;

  const sourceMainId = location.state?.selectedMainId || null;

  const sourceModelId = location.state?.selectedModelId || null;

  const sourceItemToken = location.state?.scrollToItemToken || null;


  const openSimilarItem = (nextItemId) => {

    const nextIndex = items.findIndex((entry) => String(entry?.id) === String(nextItemId));

    const nextToken = makeRestoreToken(categoryId, nextItemId, nextIndex >= 0 ? nextIndex : 0);


    navigate(`/menu/${categoryId}/item/${nextItemId}`, {

      state: {

        fromPath: sourcePath,

        breadcrumbMain: location.state?.breadcrumbMain || "",

        breadcrumbSub: location.state?.breadcrumbSub || "",

        selectedMainId: sourceMainId,

        selectedModelId: sourceModelId,

        scrollToItemToken: nextToken,

      },

    });

  };


  const handleBackToSource = () => {

    writeRestoreTarget({

      sourcePath,

      itemId,

      itemToken: sourceItemToken,

      selectedMainId: sourceMainId,

      selectedModelId: sourceModelId,

    });


    if (sourcePath === "/categories") {

      navigate(sourcePath, {

        state: {

          selectedMainId: sourceMainId,

          selectedModelId: sourceModelId,

          scrollToItemId: itemId,

          scrollToItemToken: sourceItemToken,

        },

      });

      return;

    }


    navigate(sourcePath, {

      state: {

        scrollToItemId: itemId,

        scrollToItemToken: sourceItemToken,

      },

    });

  };


  return (

    <div className="pdp" style={pdpThemeStyle}>

      <div className="pdp__breadcrumbs">

        <button type="button" onClick={handleBackToSource}>

          <FaArrowLeft aria-hidden="true" />

          <span>Back</span>

        </button>

      </div>


      <div className="pdp__layout">

        <div className="pdp__gallery">

          <div className="pdp__thumbs-rail">

            {productImages.map((image, index) => (

              <button

                key={`${product.id}-thumb-${index}`}

                type="button"

                className={`pdp__thumb ${index === activeImageIndex ? "active" : ""}`}

                onClick={() => setActiveImageIndex(index)}

              >

                <img src={image} alt={`${product.name} ${index + 1}`} />

              </button>

            ))}

          </div>


          <div className="pdp__main-image">

            <img src={activeImage} alt={product.name} />

            {discountPercent > 0 && <span className="pdp__discount-tag">{discountPercent}% OFF</span>}


            <div className="pdp__floating-actions">

              <button type="button" aria-label="Wishlist">

                <FaHeart />

              </button>

              <button type="button" aria-label="Share">

                <FaShareAlt />

              </button>

            </div>

          </div>

        </div>


        <div className="pdp__details">

          {product?.brand && <p className="pdp__brand">{product.brand}</p>}

          <h2>{product.name}</h2>

          <div className="pdp__price-row">

            <span className="pdp__mrp">MRP</span>

            <span className="pdp__price">₹{formatPrice(resolvedPrice)}</span>

            {resolvedComparePrice > 0 && <span className="pdp__original">₹{formatPrice(resolvedComparePrice)}</span>}

            {discountPercent > 0 && <span className="pdp__off-pill">{discountPercent}% OFF</span>}

          </div>

          <p className="pdp__tax-text">Inclusive of all taxes</p>


          {productColors.length > 0 && (

            <div className="pdp__selector-block">

              <h3>Select Color</h3>

              <div className="pdp__colors">

                {productColors.map((color, index) => (

                  <button

                    key={`${color.name}-${index}`}

                    type="button"

                    className={`pdp__color-btn ${index === (selectedColor ?? 0) ? "active" : ""}`}

                    onClick={() => setSelectedColor(index)}

                    title={color.name}

                  >

                    <span style={{ background: color.value }} />

                  </button>

                ))}

                <p>{selectedColorOption?.name || "-"}</p>

              </div>

            </div>

          )}


          {productSizes.length > 0 && (

            <div className="pdp__selector-block">

              <div className="pdp__selector-head">

                <h3>Select Variant</h3>

                {/* <span><FaRulerCombined /> Size Guide</span> */}

              </div>

              <div className="pdp__sizes">

                {productSizes.map((size, index) => (

                  <button

                    key={`${size.label}-${index}`}

                    type="button"

                    className={`pdp__size-btn ${index === (selectedSize ?? 0) ? "active" : ""}`}

                    onClick={() => setSelectedSize(index)}

                    disabled={size.stock <= 0}

                    title={size.stock <= 0 ? `${size.label} - out of stock` : size.label}

                  >

                    {size.label}

                  </button>

                ))}

              </div>

            </div>

          )}


          {selectedVariant && (

            <p className="pdp__variant-meta">

              Selected Variant: <strong>{selectedVariant.variant_name}</strong>

              <span>{Number(selectedVariant.stock || 0) > 0 ? `${selectedVariant.stock} in stock` : "Out of stock"}</span>

            </p>

          )}


          <div className="pdp__actions">

            {qtyInCart === 0 ? (

              <button

                type="button"

                className="pdp__add-btn"

                onClick={() => {

                  if (!productForCart) {

                    return;

                  }


                  if (!user) {

                    navigate("/login", { state: { from: location.pathname } });

                    return;

                  }


                  dispatch(addToCart(productForCart));

                }}

                disabled={isOutOfStock}

              >

                {isOutOfStock ? "Out of Stock" : "Add to Bag"}

              </button>

            ) : (

              <div className="pdp__qty-controls">

                <button type="button" onClick={() => dispatch(removeFromCart(productForCart || product))}>-</button>

                <span>{qtyInCart}</span>

                <button

                  type="button"

                  onClick={() => {

                    if (!productForCart) {

                      return;

                    }


                    if (!user) {

                      navigate("/login", { state: { from: location.pathname } });

                      return;

                    }


                    dispatch(addToCart(productForCart));

                  }}

                >

                  +

                </button>

              </div>

            )}


            <button type="button" className="pdp__secondary-btn" onClick={onBuyNow} disabled={isOutOfStock}>

              Buy Now

            </button>

          </div>


          <div className="pdp__info-accordion">

            <div className={`pdp__info-item ${activeInfoSection === "description" ? "is-open" : ""}`}>

              <button

                type="button"

                className="pdp__info-trigger"

                onClick={() => setActiveInfoSection((prev) => (prev === "description" ? "specifications" : "description"))}

                aria-expanded={activeInfoSection === "description"}

              >

                <span>Description</span>

              </button>


              {activeInfoSection === "description" && (

                <div className="pdp__info-body">

                  <p>{product.description || product.specifications || "No description available."}</p>

                </div>

              )}

            </div>


            <div className={`pdp__info-item ${activeInfoSection === "specifications" ? "is-open" : ""}`}>

              <button

                type="button"

                className="pdp__info-trigger"

                onClick={() => setActiveInfoSection((prev) => (prev === "specifications" ? "description" : "specifications"))}

                aria-expanded={activeInfoSection === "specifications"}

              >

                <span>Specifications</span>

              </button>


              {activeInfoSection === "specifications" && (

                <div className="pdp__info-body pdp__info-body--specs">

                  {specificationEntries.map((entry) => (

                    <p key={entry.title}>

                      <strong>{entry.title}:</strong>{" "}

                      {entry.title === "Availability" ? <><FaTruck /> {entry.value}</> : entry.value}

                    </p>

                  ))}

                </div>

              )}

            </div>

          </div>

        </div>

      </div>


      {similarItems.length > 0 && (

        <section className="pdp__similar" aria-label="Similar items">

          <div className="pdp__similar-head">

            <h3>Similar Items</h3>

            <p>You may also like these picks</p>

          </div>


          <div className="pdp__similar-grid">

            {similarItems.map((entry) => {

              const discountInfo = getCatalogItemDiscountInfo(entry);

              const brandLabel = String(entry?.brand || "").trim();


              return (

                <article

                  key={entry.id}

                  className="pdp__similar-card"

                  role="button"

                  tabIndex={0}

                  onClick={() => openSimilarItem(entry.id)}

                  onKeyDown={(event) => {

                    if (event.key === "Enter" || event.key === " ") {

                      event.preventDefault();

                      openSimilarItem(entry.id);

                    }

                  }}

                >

                  <div className="pdp__similar-image-wrap">

                    <img

                      src={entry.images?.[0] || entry.image || "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"}

                      alt={entry.name}

                    />

                  </div>

                  <div className="pdp__similar-body">

                    <div className="pdp__similar-meta">

                      <span className={`pdp__similar-brand${brandLabel ? "" : " is-empty"}`}>

                        {brandLabel || "Brand"}

                      </span>

                      <span className={`pdp__similar-off${discountInfo ? "" : " is-empty"}`}>

                        {discountInfo ? `${discountInfo.discountPercent}% OFF` : "0% OFF"}

                      </span>

                    </div>


                    <h4>{entry.name}</h4>


                    <div className="pdp__similar-price-row">

                      <p className="pdp__similar-price">₹{getCatalogItemDisplayPrice(entry)}</p>

                      {discountInfo && <span className="pdp__similar-original">₹{discountInfo.comparePrice}</span>}

                    </div>


                    <button

                      type="button"

                      className="pdp__similar-btn"

                      onClick={(event) => {

                        event.stopPropagation();

                        openSimilarItem(entry.id);

                      }}

                    >

                      View Item

                    </button>

                  </div>

                </article>

              );

            })}

          </div>

        </section>

      )}

    </div>

  );

}


function App() {

  //  const [showLaunch, setShowLaunch] = useState(true);

  const [isLoadingMerchant, setIsLoadingMerchant] = useState(true);

  const [merchantStatus, setMerchantStatus] = useState("active"); // "active", "inactive", "error"

  const dispatch = useDispatch();

  const location = useLocation();


  useEffect(() => {

    // Load merchant data from URL on app initialization

    const initializeMerchant = async () => {

      try {

        const merchantName = getMerchantNameFromUrl();



        if (merchantName) {

          // Merchant name found in URL, fetch merchant data

          const merchantData = await findMerchantByName(merchantName);



          if (merchantData && merchantData.merchantId) {

            // Check merchant status

            if (merchantData.status && merchantData.status.toLowerCase() !== "active") {

              setMerchantStatus("inactive");

              console.warn(`Merchant is ${merchantData.status}: ${merchantData.name}`);

            } else {

              setMerchantStatus("active");

              setMerchantId(parseInt(merchantData.merchantId, 10));

              console.log(`Merchant initialized: ${merchantData.name} (ID: ${merchantData.merchantId})`);

            }

          } else {

            console.warn(`Merchant not found for name: ${merchantName}, using default`);

            setMerchantStatus("active");

          }

        } else {

          console.log("Using default merchant ID");

          setMerchantStatus("active");

        }

      } catch (error) {

        console.error("Error initializing merchant:", error);

        setMerchantStatus("error");

      } finally {

        setIsLoadingMerchant(false);

      }

    };


    initializeMerchant();

  }, []);


  const themeColors = useSelector((state) => state.homeReducer?.themeColors || {});

  const isThemeLoaded = Object.keys(themeColors).length > 0;


  useEffect(() => {

    // Preload CMS on initial app render so themed/configured UI is ready across routes.

    if (!isLoadingMerchant) {

      dispatch(homePageData());

    }

  }, [dispatch, isLoadingMerchant]);

  const appWebBackgroundColor =

    themeColors?.webBackgroundColor ||

    "linear-gradient(160deg, #f9f3e5 0%, #fff7ec 45%, #f1f7ff 100%)";

  const appSectionBackgroundColor = themeColors?.cardsBackgroundColor || "#ffffff";

  const hideFooter =

    location.pathname === "/categories" ||

    location.pathname.startsWith("/menu/") ||

    location.pathname === "/menu" ||

    location.pathname === "/checkout";


  // Show loader while merchant is loading OR theme colors haven't loaded yet

  const isLoadingApp = isLoadingMerchant || !isThemeLoaded;


  // if (showLaunch) {

  //   return <LaunchCounter onFinish={() => setShowLaunch(false)} />;

  // }


  // Show inactive UI if merchant is not active

  if (!isLoadingMerchant && merchantStatus === "inactive") {

    return (

      <div

        className="app-shell"

        style={{

          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)",

          minHeight: "100vh",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          position: "relative",

          overflow: "hidden"

        }}

      >

        {/* Ambient particles */}

        <div style={{

          position: "absolute",

          width: "2px",

          height: "2px",

          background: "rgba(255, 255, 255, 0.85)",

          borderRadius: "50%",

          top: "18%",

          left: "14%",

          animation: "maintenanceParticle 9s ease-in-out infinite"

        }}></div>

        <div style={{

          position: "absolute",

          width: "3px",

          height: "3px",

          background: "rgba(120, 200, 255, 0.65)",

          borderRadius: "50%",

          top: "62%",

          right: "18%",

          animation: "maintenanceParticle 12s ease-in-out infinite 1.4s"

        }}></div>

        <div style={{

          position: "absolute",

          width: "2px",

          height: "2px",

          background: "rgba(167, 139, 250, 0.7)",

          borderRadius: "50%",

          bottom: "22%",

          left: "24%",

          animation: "maintenanceParticle 11s ease-in-out infinite 0.6s"

        }}></div>


        {/* Maintenance card */}

        <div style={{

          background: "rgba(15, 23, 42, 0.74)",

          backdropFilter: "blur(22px)",

          borderRadius: "24px",

          padding: "72px 64px",

          boxShadow: "0 30px 80px rgba(0, 0, 0, 0.42), 0 0 90px rgba(79, 172, 254, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.09)",

          textAlign: "center",

          position: "relative",

          zIndex: 10,

          maxWidth: "520px",

          border: "1px solid rgba(79, 172, 254, 0.22)",

          overflow: "hidden"

        }}>

          <div style={{

            position: "absolute",

            top: 0,

            left: "-40%",

            width: "40%",

            height: "100%",

            background: "linear-gradient(90deg, rgba(79, 172, 254, 0), rgba(79, 172, 254, 0.15), rgba(79, 172, 254, 0))",

            animation: "maintenanceSweep 3.8s linear infinite"

          }}></div>


          {/* Status beacon */}

          <div style={{

            width: "112px",

            height: "112px",

            margin: "0 auto 26px",

            position: "relative"

          }}>

            <div style={{

              position: "absolute",

              inset: 0,

              borderRadius: "50%",

              border: "2px solid rgba(248, 113, 113, 0.55)",

              animation: "maintenanceRing 2.2s ease-out infinite"

            }}></div>

            <div style={{

              position: "absolute",

              inset: "16px",

              borderRadius: "50%",

              border: "2px solid rgba(79, 172, 254, 0.4)",

              animation: "maintenanceRing 2.2s ease-out infinite 0.8s"

            }}></div>

            <div style={{

              position: "absolute",

              inset: "34px",

              borderRadius: "50%",

              background: "linear-gradient(135deg, #fb7185 0%, #8b5cf6 100%)",

              boxShadow: "0 0 20px rgba(244, 114, 182, 0.65)",

              animation: "maintenanceCore 2.4s ease-in-out infinite"

            }}></div>

          </div>


          {/* Heading */}

          <h1 style={{

            fontSize: "34px",

            fontWeight: "800",

            color: "#e0f2fe",

            margin: "0 0 10px 0",

            letterSpacing: "-0.6px"

          }}>

            Store Maintenance

          </h1>


          {/* Status badge */}

          <div style={{

            display: "inline-block",

            background: "linear-gradient(135deg, #fb7185 0%, #f59e0b 100%)",

            color: "white",

            padding: "8px 18px",

            borderRadius: "50px",

            fontSize: "13px",

            fontWeight: "700",

            marginBottom: "24px",

            letterSpacing: "0.5px",

            textTransform: "uppercase"

          }}>

            Currently Inactive

          </div>


          {/* Main message */}

          <p style={{

            fontSize: "18px",

            color: "rgba(224, 242, 254, 0.92)",

            lineHeight: "1.75",

            margin: "0 0 26px 0",

            fontWeight: "500"

          }}>

            Your website is inactive now. Stay tuned.

          </p>


          {/* Timeline */}

          <div style={{

            background: "rgba(30, 41, 59, 0.72)",

            padding: "18px",

            borderRadius: "14px",

            border: "1px solid rgba(96, 165, 250, 0.3)"

          }}>

            <p style={{

              fontSize: "13px",

              color: "rgba(186, 230, 253, 0.85)",

              margin: "0 0 10px 0",

              fontWeight: "600"

            }}>

              STATUS UPDATE

            </p>

            <p style={{

              fontSize: "16px",

              color: "#e0f2fe",

              margin: "0",

              fontWeight: "700"

            }}>

              Coming Very Soon

            </p>

          </div>

        </div>


        <style>{`

          @keyframes maintenanceCore {

            0%, 100% {

              transform: scale(1);

              opacity: 0.88;

            }

            50% {

              transform: scale(1.18);

              opacity: 1;

            }

          }

          

          @keyframes maintenanceRing {

            0% {

              transform: scale(0.84);

              opacity: 0.8;

            }

            100% {

              transform: scale(1.3);

              opacity: 0;

            }

          }


          @keyframes maintenanceParticle {

            0%, 100% {

              transform: translateY(0) translateX(0);

              opacity: 0;

            }

            12% { opacity: 1; }

            88% { opacity: 1; }

            100% {

              transform: translateY(-120px) translateX(45px);

              opacity: 0;

            }

          }


          @keyframes maintenanceSweep {

            0% { left: -45%; }

            100% { left: 115%; }

          }

        `}</style>

      </div>

    );

  }


  if (isLoadingApp) {

    return (

      <div

        className="app-shell"

        style={{

          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)",

          minHeight: "100vh",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          position: "relative",

          overflow: "hidden"

        }}

      >

        {/* Animated particles */}

        <div style={{

          position: "absolute",

          width: "2px",

          height: "2px",

          background: "rgba(255, 255, 255, 0.8)",

          borderRadius: "50%",

          top: "20%",

          left: "15%",

          animation: "particle 8s ease-in-out infinite"

        }}></div>

        <div style={{

          position: "absolute",

          width: "3px",

          height: "3px",

          background: "rgba(120, 200, 255, 0.6)",

          borderRadius: "50%",

          top: "60%",

          right: "20%",

          animation: "particle 10s ease-in-out infinite 1s"

        }}></div>

        <div style={{

          position: "absolute",

          width: "2px",

          height: "2px",

          background: "rgba(255, 255, 255, 0.7)",

          borderRadius: "50%",

          top: "30%",

          right: "25%",

          animation: "particle 12s ease-in-out infinite 2s"

        }}></div>

        <div style={{

          position: "absolute",

          width: "2px",

          height: "2px",

          background: "rgba(147, 112, 219, 0.5)",

          borderRadius: "50%",

          bottom: "25%",

          left: "20%",

          animation: "particle 14s ease-in-out infinite 0.5s"

        }}></div>


        {/* Main loader card */}

        <div style={{

          background: "rgba(15, 23, 42, 0.7)",

          backdropFilter: "blur(20px)",

          borderRadius: "24px",

          padding: "70px 90px",

          boxShadow: "0 30px 80px rgba(0, 0, 0, 0.4), 0 0 100px rgba(79, 172, 254, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)",

          textAlign: "center",

          position: "relative",

          zIndex: 10,

          maxWidth: "480px",

          border: "1px solid rgba(79, 172, 254, 0.2)"

        }}>

          {/* Animated ring loader */}

          <div style={{

            width: "100px",

            height: "100px",

            margin: "0 auto 40px",

            position: "relative"

          }}>

            {/* Outer ring */}

            <div style={{

              position: "absolute",

              inset: 0,

              borderRadius: "50%",

              border: "3px solid transparent",

              borderTopColor: "rgba(79, 172, 254, 0.8)",

              borderRightColor: "rgba(79, 172, 254, 0.3)",

              animation: "spin 1.5s linear infinite"

            }}></div>



            {/* Middle ring */}

            <div style={{

              position: "absolute",

              inset: "12px",

              borderRadius: "50%",

              border: "2px solid transparent",

              borderLeftColor: "rgba(139, 92, 246, 0.6)",

              borderBottomColor: "rgba(139, 92, 246, 0.2)",

              animation: "spin 2.5s linear infinite reverse"

            }}></div>


            {/* Inner dot */}

            <div style={{

              position: "absolute",

              inset: "35px",

              borderRadius: "50%",

              background: "linear-gradient(135deg, #4facfe 0%, #8b5cf6 100%)",

              animation: "pulse 2s ease-in-out infinite"

            }}></div>

          </div>


          {/* Loading text */}

          <h2 style={{

            fontSize: "32px",

            fontWeight: "800",

            color: "#f0f9ff",

            margin: "0 0 8px 0",

            letterSpacing: "-0.5px"

          }}>

            Loading Store

          </h2>


          {/* Animated line under text */}

          <div style={{

            height: "2px",

            width: "60px",

            margin: "16px auto 0",

            background: "linear-gradient(90deg, transparent, #4facfe, transparent)",

            animation: "shimmer 2s infinite"

          }}></div>

        </div>


        <style>{`

          @keyframes spin {

            from { transform: rotate(0deg); }

            to { transform: rotate(360deg); }

          }

          

          @keyframes pulse {

            0%, 100% { 

              transform: scale(1);

              opacity: 0.8;

            }

            50% { 

              transform: scale(1.2);

              opacity: 1;

            }

          }

          

          @keyframes particle {

            0%, 100% { 

              transform: translateY(0) translateX(0);

              opacity: 0;

            }

            10% { opacity: 1; }

            90% { opacity: 1; }

            100% { 

              transform: translateY(-100px) translateX(50px);

              opacity: 0;

            }

          }

          

          @keyframes shimmer {

            0%, 100% { width: 0; }

            50% { width: 60px; }

          }

        `}</style>

      </div>

    );

  }



  return (

    <div

      className="app-shell"

      style={{

        background: appWebBackgroundColor,

        minHeight: "100vh",

        "--app-page-bg": appWebBackgroundColor,

        "--app-section-bg": appSectionBackgroundColor,

      }}

    >

      <Header />


      <Routes>

        <Route

          path="/login"

          element={

            <PublicRoute>

              <Login />

            </PublicRoute>

          }

        />


        <Route

          path="/register"

          element={

            <PublicRoute>

              <Register />

            </PublicRoute>

          }

        />


        <Route

          path="/"

          element={<Home />}

        />


        <Route

          path="/categories"

          element={<Categories />}

        />


        <Route

          path="/menu/:categoryId"

          element={<Menu />}

        />


        <Route

          path="/menu/:categoryId/item/:itemId"

          element={<ProductDetail />}

        />


        <Route

          path="/cart"

          element={

            <ProtectedRoute>

              <Cart />

            </ProtectedRoute>

          }

        />


        <Route

          path="/checkout"

          element={

            <ProtectedRoute>

              <Checkout />

            </ProtectedRoute>

          }

        />


        <Route

          path="/orders"

          element={

            <ProtectedRoute>

              <OrderHistory />

            </ProtectedRoute>

          }

        />

        <Route

          path="/profile"

          element={

            <ProtectedRoute>

              <Profile />

            </ProtectedRoute>

          }

        />

        <Route

          path="/address"

          element={

            <ProtectedRoute>

              <Address />

            </ProtectedRoute>

          }

        />

        <Route path="/order-success" element={<OrderSuccess />} />

        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        <Route path="/terms" element={<TermsOfService />} />

        <Route path="/refund-policy" element={<RefundPolicy />} />

        <Route path="/shipping" element={<ShippingPolicy />} />

        <Route path="/contact" element={<ContactUs />} />

      </Routes>


      {!hideFooter && <Footer />}

    </div>

  );

}


export default App;

