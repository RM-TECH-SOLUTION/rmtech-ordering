import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { addToCart, removeFromCart, clearCart, getCart, removeItemCompletely } from "../redux/cart/cart.reducer";
import { useNavigate } from "react-router-dom";
import "../styles/pages/Cart.scss";
import { FaTrash, FaPlus, FaMinus, FaShoppingBag, FaMapMarkerAlt, FaCreditCard, FaLock, FaTruck, FaWallet } from "react-icons/fa";

function Cart() {
 const dispatch = useDispatch();
 const navigate = useNavigate();
 const [paymentMethod, setPaymentMethod] = useState("COD");
 const [couponCode, setCouponCode] = useState("");
 const [discount, setDiscount] = useState(0);

 const { addresses, selectedAddressId } = useSelector(
 (state) => state.address
 );

 const cartItems = useSelector((state) => state.cart.cartItems);
 const user = useSelector((state) => state.auth.user);

 const selectedAddress = addresses.find(
 (a) => a.id === selectedAddressId
 );

 useEffect(() => {
 dispatch(getCart());
 }, [dispatch]);

 // Calculate totals
 const subtotal = cartItems.reduce(
 (sum, item) => sum + Number(item.price) * item.qty,
 0
 );

 const deliveryFee = subtotal > 499 ? 0 : 49;
 const tax = subtotal * 0.05; // 5% tax
 const grandTotal = subtotal + deliveryFee + tax - discount;

 // Apply coupon logic
 const applyCoupon = () => {
 if (couponCode === "SAVE50") {
 setDiscount(50);
 } else if (couponCode === "SAVE100") {
 setDiscount(100);
 } else if (couponCode === "FREEDELIVERY") {
 setDiscount(deliveryFee);
 } else {
 alert("Invalid coupon code");
 }
 };

 // Clear coupon
 const clearCoupon = () => {
 setCouponCode("");
 setDiscount(0);
 };

 // Empty cart state
 if (cartItems.length === 0) {
 return (
 <div className="cart-empty">
 <div className="empty-icon">
 <FaShoppingBag />
 </div>
 <h2 className="empty-title">Your Cart is Empty</h2>
 <p className="empty-description">
 Looks like you haven't added anything to your cart yet.
 </p>
 <button 
 className="btn btn--primary"
 onClick={() => navigate("/categories")}
 >
 Start Shopping
 </button>
 <div className="empty-suggestions">
 <h4>Popular Categories</h4>
 <div className="suggestion-chips">
 <span onClick={() => navigate("/categories")}>🍕 Pizza</span>
 <span onClick={() => navigate("/categories")}>🍔 Burgers</span>
 <span onClick={() => navigate("/categories")}>🍣 Sushi</span>
 <span onClick={() => navigate("/categories")}>☕ Coffee</span>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="cart">
 <div className="cart__container">
 {/* Header */}
 <div className="cart__header">
 <h1 className="cart__title">Shopping Cart</h1>
 <div className="cart__item-count">
 <FaShoppingBag className="icon" />
 <span>{cartItems.reduce((sum, item) => sum + item.qty, 0)} items</span>
 </div>
 </div>

 <div className="cart__content">
 {/* Left Column - Cart Items */}
 <div className="cart__items-section">
 <div className="cart__items-header">
 <h3 className="section-title">Order Items</h3>
 <button 
 className="btn btn--text"
 onClick={() => dispatch(clearCart())}
 >
 <FaTrash className="icon" />
 Clear All
 </button>
 </div>

 <div className="cart__items-list">
 {cartItems.map((item) => (
 <div key={item.id} className="cart-item">
 <div className="cart-item__image">
 <img 
 src={item.images?.[0] || "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"} 
 alt={item.name}
 />
 </div>
 
 <div className="cart-item__details">
 <div className="cart-item__header">
 <h4 className="cart-item__name">{item.name}</h4>
 <button 
 className="cart-item__remove"
 onClick={() => dispatch(removeItemCompletely(item))}
 >
 <FaTrash className="icon" />
 </button>
 </div>
 
 <p className="cart-item__description">
 {item.description || "Delicious item prepared with fresh ingredients"}
 </p>
 
 <div className="cart-item__footer">
 <div className="cart-item__price">
 <span className="current-price">₹{item.price}</span>
 {item.originalPrice && (
 <span className="original-price">₹{item.originalPrice}</span>
 )}
 </div>
 
 <div className="cart-item__controls">
 <button 
 className="qty-btn qty-btn--minus"
 onClick={() => dispatch(removeFromCart(item))}
 >
 <FaMinus className="icon" />
 </button>
 <span className="qty-display">{item.qty}</span>
 <button 
 className="qty-btn qty-btn--plus"
 onClick={() => dispatch(addToCart(item))}
 >
 <FaPlus className="icon" />
 </button>
 </div>
 </div>
 
 <div className="cart-item__total">
 Total: <span>₹{Number(item.price) * item.qty}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Right Column - Order Summary */}
 <div className="cart__summary-section">
 {/* Delivery Address */}
 <div className="summary-card">
 <div className="summary-card__header">
 <FaMapMarkerAlt className="icon" />
 <h3 className="section-title">Delivery Address</h3>
 </div>
 
 {selectedAddress ? (
 <div className="address-selected">
 <div className="address-details">
 <div className="address-name">
 <strong>{selectedAddress.name}</strong>
 <span className="address-type">{selectedAddress.type || "Home"}</span>
 </div>
 <p className="address-text">{selectedAddress.addressLine}</p>
 <p className="address-contact">{selectedAddress.phone}</p>
 <p className="address-instructions">
 {selectedAddress.instructions || "No special instructions"}
 </p>
 </div>
 <button
 className="btn btn--outline btn--small"
 onClick={() => navigate("/address?from=cart")}
 >
 Change Address
 </button>
 </div>
 ) : (
 <div className="address-empty">
 <div className="address-empty__content">
 <FaMapMarkerAlt className="icon" />
 <div>
 <p>No address selected</p>
 <small>Add a delivery address to continue</small>
 </div>
 </div>
 <button
 className="btn btn--primary btn--small"
 onClick={() => navigate("/address?from=cart")}
 >
 Add Address
 </button>
 </div>
 )}
 </div>

 {/* Payment Method */}
 <div className="summary-card">
 <div className="summary-card__header">
 <FaCreditCard className="icon" />
 <h3 className="section-title">Payment Method</h3>
 </div>
 
 <div className="payment-methods">
 <div 
 className={`payment-method ${paymentMethod === "COD" ? "active" : ""}`}
 onClick={() => setPaymentMethod("COD")}
 >
 <div className="payment-method__content">
 <div className="payment-method__icon">
 <FaWallet className="icon" />
 </div>
 <div className="payment-method__info">
 <h4>Cash on Delivery</h4>
 <p>Pay when you receive your order</p>
 </div>
 </div>
 <div className="payment-method__radio">
 <input 
 type="radio" 
 name="payment" 
 checked={paymentMethod === "COD"}
 readOnly
 />
 </div>
 </div>
 
 <div 
 className={`payment-method ${paymentMethod === "ONLINE" ? "active" : ""}`}
 onClick={() => setPaymentMethod("ONLINE")}
 >
 <div className="payment-method__content">
 <div className="payment-method__icon">
 <FaLock className="icon" />
 </div>
 <div className="payment-method__info">
 <h4>Online Payment</h4>
 <p>Pay securely with card/UPI</p>
 </div>
 </div>
 <div className="payment-method__radio">
 <input 
 type="radio" 
 name="payment" 
 checked={paymentMethod === "ONLINE"}
 readOnly
 />
 </div>
 </div>
 </div>
 </div>

 {/* Coupon Code */}
 <div className="summary-card">
 <div className="summary-card__header">
 <h3 className="section-title">Apply Coupon</h3>
 </div>
 
 <div className="coupon-section">
 <div className="coupon-input-group">
 <input 
 type="text" 
 placeholder="Enter coupon code" 
 className="coupon-input"
 value={couponCode}
 onChange={(e) => setCouponCode(e.target.value)}
 />
 {discount > 0 ? (
 <button 
 className="btn btn--danger btn--small"
 onClick={clearCoupon}
 >
 Remove
 </button>
 ) : (
 <button 
 className="btn btn--primary btn--small"
 onClick={applyCoupon}
 >
 Apply
 </button>
 )}
 </div>
 
 {discount > 0 && (
 <div className="coupon-applied">
 <span className="coupon-success">🎉 Coupon applied!</span>
 <span className="coupon-savings">You saved ₹{discount}</span>
 </div>
 )}
 
 <div className="coupon-suggestions">
 <span className="coupon-tag" onClick={() => setCouponCode("SAVE50")}>
 SAVE50
 </span>
 <span className="coupon-tag" onClick={() => setCouponCode("SAVE100")}>
 SAVE100
 </span>
 <span className="coupon-tag" onClick={() => setCouponCode("FREEDELIVERY")}>
 FREEDELIVERY
 </span>
 </div>
 </div>
 </div>

 {/* Order Summary */}
 <div className="summary-card">
 <h3 className="section-title">Order Summary</h3>
 
 <div className="order-summary">
 <div className="summary-row">
 <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.qty, 0)} items)</span>
 <span>₹{subtotal.toFixed(2)}</span>
 </div>
 
 <div className="summary-row">
 <span>Delivery Fee</span>
 <span className={deliveryFee === 0 ? "free" : ""}>
 {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
 </span>
 </div>
 
 <div className="summary-row">
 <span>Tax (5%)</span>
 <span>₹{tax.toFixed(2)}</span>
 </div>
 
 {discount > 0 && (
 <div className="summary-row discount">
 <span>Discount</span>
 <span className="discount-amount">-₹{discount}</span>
 </div>
 )}
 
 <div className="summary-row total">
 <span>Total Amount</span>
 <span className="total-amount">₹{grandTotal.toFixed(2)}</span>
 </div>
 </div>
 </div>

 {/* Checkout Button */}
 <button
 className={`btn btn--order ${!selectedAddress ? "disabled" : ""}`}
 onClick={() => navigate("/checkout")}
 disabled={!selectedAddress}
 >
 <div className="order-btn__content">
 <div className="order-btn__text">
 <span className="order-btn__title">Proceed To Checkout</span>
 <span className="order-btn__subtitle">₹{grandTotal.toFixed(2)} • {paymentMethod === "COD" ? "Cash on Delivery" : "Pay Online"}</span>
 </div>
 <div className="order-btn__icon">
 <FaTruck className="icon" />
 </div>
 </div>
 </button>

 {/* Security Note */}
 <div className="security-note">
 <FaLock className="icon" />
 <span>Your payment is secured with 256-bit SSL encryption</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

export default Cart;