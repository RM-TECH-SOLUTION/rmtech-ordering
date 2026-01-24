import Header from "./components/Header";
import Footer from "./components/Footer";
import Cart from "./pages/Cart";
import OrderHistory from "./pages/OrderHistory";
import OrderSuccess from "./pages/OrderSuccess";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Address from "./pages/Address";
import "./styles/pages/Home.scss"
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import HomeCtaComponent from "./components/HomeCtaComponent"
import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getCatalogueModels } from "./redux/catalogueModels/catalogueModels.reducer";
import { getCatalogueItems } from "./redux/catalogueItems/catalogueItems.reducer";
import { addToCart, removeFromCart } from "./redux/cart/cart.reducer";
import "./styles/pages/Categories.scss";
import "./styles/pages/Menu.scss";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import ContactUs from "./pages/ContactUs";
// import LaunchCounter from "./components/LaunchCounter";
// import React, {  useState } from "react";


// Import icons (you can use react-icons or SVG)
import { FaShoppingCart, FaStar, FaFire, FaLeaf, FaBolt, FaArrowRight } from "react-icons/fa";

function Home() {
  const navigate = useNavigate();
   const homeBannerData = useSelector((state) => state.homeReducer?.homeBanner);
   console.log(homeBannerData,"homeBannerData")

  return (
    <div className="home">
      {/* Hero Section */}
      <div className="home__hero">
        <div className="home__hero-content">
          <h1 className="home__hero-title">
            {homeBannerData.homeBannerTitle1 || "Delicious Food "}<span style={{marginLeft:2}} className="highlight">{homeBannerData.homeBannerTitle2 || "Delivered"}</span> {homeBannerData.homeBannerTitle3 ||"to Your Door"}
          </h1>
          <p className="home__hero-subtitle">
            {homeBannerData.homeBannerDescription || "Discover amazing dishes from top restaurants. Order food online and get it delivered fast."}
          </p>
          <div className="home__hero-actions">
            <button 
              className="btn btn--primary btn--large"
              onClick={() => navigate("/categories")}
            >
              <span>{homeBannerData.homeBannerCta1 || "Order Now"}</span>
              <FaArrowRight className="icon" />
            </button>
            <button 
              className="btn btn--outline btn--large"
              onClick={() => navigate("/categories")}
            >
              {homeBannerData.homeBannerCta2 || "Browse Menu"}
            </button>
          </div>
        </div>
        <div className="home__hero-image">
          <div className="floating-card card-1">
            <img src={homeBannerData.homeBannerImage1 || "https://images.unsplash.com/photo-1565958011703-44f9829ba187"} alt="Dish" />
            <div className="card-badge">
              <FaStar className="icon" /> Popular
            </div>
          </div>
          <div className="floating-card card-2">
            <img src={ homeBannerData.homeBannerImage3 || "https://images.unsplash.com/photo-1481070555726-e2fe8357725c"} alt="Dish" />
            <div className="card-badge">
              <FaFire className="icon" /> Trending
            </div>
          </div>
          <div className="floating-card card-3">
            <img src={homeBannerData.homeBannerImage2 ||"https://images.unsplash.com/photo-1490818387583-1baba5e638af"} alt="Dish" />
            <div className="card-badge">
              <FaLeaf className="icon" /> Healthy
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="home__features">
        <div className="feature-card">
          <div className="feature-icon">
            <FaBolt className="icon" />
          </div>
          <h3 className="feature-title">Fast Delivery</h3>
          <p className="feature-desc">Get your food delivered in under 30 minutes</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <FaStar className="icon" />
          </div>
          <h3 className="feature-title">Top Rated</h3>
          <p className="feature-desc">4.8/5 rating from 10K+ customers</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <FaLeaf className="icon" />
          </div>
          <h3 className="feature-title">Fresh Ingredients</h3>
          <p className="feature-desc">100% fresh ingredients daily</p>
        </div>
      </div>

      {/* CTA Section */}
      <HomeCtaComponent />
    </div>
  );
}

function Categories() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list, loading } = useSelector(
    (state) => state.catalogueModels
  );

  useEffect(() => {
    dispatch(getCatalogueModels(1));
  }, [dispatch]);

  return (
    <div className="categories">
      {/* Page Header */}
      <div className="categories__header">
        <h1 className="categories__title">
          Explore <span className="highlight">Categories</span>
        </h1>
        <p className="categories__subtitle">
          Discover your favorite dishes from our curated categories
        </p>
      </div>

      {/* Search Bar */}
      <div className="categories__search">
        <input 
          type="text" 
          placeholder="Search categories..." 
          className="search-input"
        />
        <button className="search-btn">
          🔍
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="categories__loading">
          <div className="spinner"></div>
          <p>Loading categories...</p>
        </div>
      ) : (
        <>
          {/* Categories Grid */}
          <div className="categories__grid">
            {list.map((cat) => (
              <div
                key={cat.id}
                className="category-card"
                onClick={() => navigate(`/menu/${cat.id}`)}
              >
                <div className="category-card__image">
                  <img
                    src={cat.image || "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"}
                    alt={cat.name}
                    className="category-image"
                  />
                  <div className="category-overlay">
                    <div className="category-badge">
                      <FaFire className="icon" />
                    </div>
                  </div>
                </div>
                
                <div className="category-card__content">
                  <h3 className="category-name">{cat.name}</h3>
                  <p className="category-description">
                    {cat.description || "Explore delicious items"}
                  </p>
                  <div className="category-footer">
                    <span className="category-count">50+ Items</span>
                    <span className="category-arrow">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Popular Tags */}
          <div className="categories__tags">
            <h3 className="tags-title">Popular Tags</h3>
            <div className="tags-container">
              {["Vegetarian", "Spicy", "Healthy", "Quick", "Premium", "Family", "Desserts", "Beverages"].map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Menu() {
  const { categoryId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getItemQty = (id) => {
    const item = cartItems.find((i) => i.id === id);
    return item ? item.qty : 0;
  };

  const { items, loading } = useSelector(
    (state) => state.catalogueItems
  );

  const cartItems = useSelector(
    (state) => state.cart.cartItems
  );

  useEffect(() => {
    dispatch(getCatalogueItems(categoryId, 1));
  }, [dispatch, categoryId]);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0
  );

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  return (
    <div className="menu">
      {/* Menu Header */}
      <div className="menu__header">
        <button 
          className="back-btn"
          onClick={() => navigate("/categories")}
        >
          ← Back to Categories
        </button>
        <h1 className="menu__title">
          Menu <span className="highlight">Items</span>
        </h1>
        <p className="menu__subtitle">
          {items.length} delicious items to choose from
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="menu__loading">
          <div className="spinner"></div>
          <p>Loading menu items...</p>
        </div>
      ) : (
        <>
          {/* Menu Items Grid */}
          <div className="menu__grid">
            {items.map((item) => {
              const qty = getItemQty(item.id);

              return (
                <div key={item.id} className="menu-card">
                  {/* Card Image */}
                  <div className="menu-card__image">
                    <img
                      src={item.images?.[0] || "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"}
                      alt={item.name}
                      className="item-image"
                    />
                    {item.isVeg && (
                      <div className="veg-badge">🌱 Veg</div>
                    )}
                    {item.isSpicy && (
                      <div className="spicy-badge">🌶️ Spicy</div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="menu-card__content">
                    <div className="item-header">
                      <h3 className="item-name">{item.name}</h3>
                      <div className="item-rating">
                        <FaStar className="icon" />
                        <span>4.5</span>
                      </div>
                    </div>
                    
                    <p className="item-description">
                      {item.description || "Delicious dish made with fresh ingredients"}
                    </p>
                    
                    <div className="item-footer">
                      <div className="price-container">
                        <span className="item-price">₹{item.price}</span>
                        {item.originalPrice && (
                          <span className="original-price">₹{item.originalPrice}</span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      {qty === 0 ? (
                        <button
                          className="add-btn"
                          onClick={() => dispatch(addToCart(item))}
                        >
                          <FaShoppingCart className="icon" />
                          <span>Add</span>
                        </button>
                      ) : (
                        <div className="quantity-controls">
                          <button
                            className="qty-btn minus"
                            onClick={() => dispatch(removeFromCart(item))}
                          >
                            −
                          </button>
                          <span className="qty-display">{qty}</span>
                          <button
                            className="qty-btn plus"
                            onClick={() => dispatch(addToCart(item))}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Cart Summary */}
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
                  View Cart →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function App() {
  //  const [showLaunch, setShowLaunch] = useState(true);

  // if (showLaunch) {
  //   return <LaunchCounter onFinish={() => setShowLaunch(false)} />;
  // }
  
  return (
    <>
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
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          }
        />

        <Route
          path="/menu/:categoryId"
          element={
            <ProtectedRoute>
              <Menu />
            </ProtectedRoute>
          }
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

      <Footer />
    </>
  );
}

export default App;