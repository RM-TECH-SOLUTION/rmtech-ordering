import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
 FaArrowLeft,
 FaCheckCircle,
 FaCreditCard,
 FaLock,
 FaMapMarkerAlt,
 FaShoppingBag,
 FaTruck,
 FaWallet,
} from "react-icons/fa";
import apiClient from "../api/apiClient";
import { clearCart, getCart } from "../redux/cart/cart.reducer";
import { placeOrder } from "../redux/orders/orders.reducer";
import "../styles/pages/Checkout.scss";

function Checkout() {
 const dispatch = useDispatch();
 const navigate = useNavigate();

 const cartItems = useSelector((state) => state.cart.cartItems || []);
 const user = useSelector((state) => state.auth?.user || null);
 const { addresses = [], selectedAddressId } = useSelector((state) => state.address || {});

 const [paymentMethod, setPaymentMethod] = useState("COD");
 const [couponCode, setCouponCode] = useState("");
 const [discount, setDiscount] = useState(0);
 const [errorMessage, setErrorMessage] = useState("");
 const [placingOrder, setPlacingOrder] = useState(false);

 useEffect(() => {
 dispatch(getCart());
 }, [dispatch]);

 const selectedAddress = useMemo(
 () => addresses.find((entry) => String(entry.id) === String(selectedAddressId)),
 [addresses, selectedAddressId]
 );

 const subtotal = useMemo(
 () => cartItems.reduce((sum, item) => sum + Number(item.price) * item.qty, 0),
 [cartItems]
 );
 const deliveryFee = subtotal > 499 ? 0 : 49;
 const tax = subtotal * 0.05;
 const grandTotal = subtotal + deliveryFee + tax - discount;
 const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);

 const applyCoupon = () => {
 const code = couponCode.trim().toUpperCase();

 if (!code) {
 setErrorMessage("Enter a coupon code first.");
 return;
 }

 if (code === "SAVE50") {
 setDiscount(50);
 setErrorMessage("");
 return;
 }

 if (code === "SAVE100") {
 setDiscount(100);
 setErrorMessage("");
 return;
 }

 if (code === "FREEDELIVERY") {
 setDiscount(deliveryFee);
 setErrorMessage("");
 return;
 }

 setDiscount(0);
 setErrorMessage("Invalid coupon code.");
 };

 const removeCoupon = () => {
 setCouponCode("");
 setDiscount(0);
 setErrorMessage("");
 };

 const handlePlaceOrder = async () => {
 if (cartItems.length === 0) {
 setErrorMessage("Your cart is empty.");
 return;
 }

 if (!selectedAddress) {
 setErrorMessage("Please select a delivery address.");
 return;
 }

 setPlacingOrder(true);
 setErrorMessage("");

 try {
 const normalizedItems = cartItems.map((item) => {
 const qty = Number(item?.quantity ?? item?.qty ?? 1);
 const price = Number(item?.price ?? 0);

 return {
 cart_id: item?.cart_id,
 item_id: Number(item?.item_id ?? item?.id),
 item_name: item?.item_name || item?.name || "Item",
 description: item?.description || "",
 price,
 quantity: qty,
 total: Number(item?.total ?? price * qty),
 variant_id: item?.variant_id || null,
 variant_name: item?.variant_name || null,
 images: item?.images || (item?.image ? [item.image] : []),
 };
 });

 const orderType = paymentMethod === "COD" ? "COD" : "online";

 const orderResponse = await apiClient.post(
 apiClient.Urls.createOrder,
 apiClient.withContext({
 amount: Number(grandTotal.toFixed(2)),
 user_id: user?.id || null,
 phone: user?.phone || "",
 items: normalizedItems,
 orderType,
 couponDiscount: Number(discount || 0),
 pointsDiscount: 0,
 address: JSON.stringify(selectedAddress || {}),
 status: paymentMethod === "COD" ? "success" : "initiated",
 })
 );

 if (orderResponse?.success === false) {
 setErrorMessage(orderResponse?.message || "Failed to place order.");
 return;
 }

 dispatch(
 placeOrder({
 items: cartItems,
 address: selectedAddress,
 paymentMethod,
 total: grandTotal,
 discount,
 })
 );

 await dispatch(clearCart());
 await dispatch(getCart());
 navigate("/order-success");
 } catch (error) {
 setErrorMessage(error?.message || "Failed to place order.");
 } finally {
 setPlacingOrder(false);
 }
 };

 if (cartItems.length === 0) {
 return (
 <div className="checkout-empty">
 <div className="checkout-empty__card">
 <FaShoppingBag className="checkout-empty__icon" />
 <h2>Your cart is empty</h2>
 <p>Add products before checking out.</p>
 <button type="button" className="checkout-btn checkout-btn--primary" onClick={() => navigate("/categories")}>
 Go To Categories
 </button>
 </div>
 </div>
 );
 }

 return (
 <div className="checkout-page">
 <div className="checkout-page__header">
 <button type="button" className="checkout-back" onClick={() => navigate("/cart")}>
 <FaArrowLeft />
 <span>Back To Cart</span>
 </button>
 <h1>Checkout</h1>
 </div>

 <div className="checkout-layout">
 <section className="checkout-panel">
 <div className="checkout-card">
 <div className="checkout-card__head">
 <FaMapMarkerAlt className="icon" />
 <h3>Delivery Address</h3>
 </div>

 {selectedAddress ? (
 <div className="checkout-address">
 <div>
 <p className="checkout-address__name">{selectedAddress.name}</p>
 <p>{selectedAddress.addressLine}</p>
 <p>{selectedAddress.phone}</p>
 </div>
 <button
 type="button"
 className="checkout-btn checkout-btn--outline"
 onClick={() => navigate("/address?from=checkout")}
 >
 Change
 </button>
 </div>
 ) : (
 <div className="checkout-address checkout-address--empty">
 <p>No address selected</p>
 <button
 type="button"
 className="checkout-btn checkout-btn--primary"
 onClick={() => navigate("/address?from=checkout")}
 >
 Add Address
 </button>
 </div>
 )}
 </div>

 <div className="checkout-card">
 <div className="checkout-card__head">
 <FaCreditCard className="icon" />
 <h3>Payment Method</h3>
 </div>

 <div className="checkout-payment-options">
 <button
 type="button"
 className={`checkout-payment ${paymentMethod === "COD" ? "active" : ""}`}
 onClick={() => setPaymentMethod("COD")}
 >
 <FaWallet />
 <div>
 <p>Cash On Delivery</p>
 <small>Pay when the order arrives</small>
 </div>
 {paymentMethod === "COD" && <FaCheckCircle className="check" />}
 </button>

 <button
 type="button"
 className={`checkout-payment ${paymentMethod === "ONLINE" ? "active" : ""}`}
 onClick={() => setPaymentMethod("ONLINE")}
 >
 <FaLock />
 <div>
 <p>Online Payment</p>
 <small>Cards, UPI and wallets</small>
 </div>
 {paymentMethod === "ONLINE" && <FaCheckCircle className="check" />}
 </button>
 </div>
 </div>

 <div className="checkout-card">
 <div className="checkout-card__head">
 <FaTruck className="icon" />
 <h3>Order Items</h3>
 <span className="checkout-items-count">{totalItems} items</span>
 </div>

 <div className="checkout-items">
 {cartItems.map((item) => (
 <div className="checkout-item" key={item.id}>
 <img src={item.images?.[0] || item.image} alt={item.name} />
 <div>
 <p className="checkout-item__name">{item.name}</p>
 <p className="checkout-item__meta">Qty: {item.qty}</p>
 </div>
 <p className="checkout-item__price">₹{Number(item.price) * item.qty}</p>
 </div>
 ))}
 </div>
 </div>
 </section>

 <aside className="checkout-summary">
 <div className="checkout-card">
 <h3>Coupon</h3>
 <div className="checkout-coupon">
 <input
 type="text"
 placeholder="Enter coupon code"
 value={couponCode}
 onChange={(event) => setCouponCode(event.target.value)}
 />
 {discount > 0 ? (
 <button type="button" className="checkout-btn checkout-btn--danger" onClick={removeCoupon}>
 Remove
 </button>
 ) : (
 <button type="button" className="checkout-btn checkout-btn--primary" onClick={applyCoupon}>
 Apply
 </button>
 )}
 </div>
 <div className="checkout-coupons-row">
 <button type="button" onClick={() => setCouponCode("SAVE50")}>SAVE50</button>
 <button type="button" onClick={() => setCouponCode("SAVE100")}>SAVE100</button>
 <button type="button" onClick={() => setCouponCode("FREEDELIVERY")}>FREEDELIVERY</button>
 </div>
 </div>

 <div className="checkout-card">
 <h3>Bill Details</h3>
 <div className="checkout-bill-row">
 <span>Subtotal</span>
 <span>₹{subtotal.toFixed(2)}</span>
 </div>
 <div className="checkout-bill-row">
 <span>Delivery Fee</span>
 <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
 </div>
 <div className="checkout-bill-row">
 <span>Tax (5%)</span>
 <span>₹{tax.toFixed(2)}</span>
 </div>
 {discount > 0 && (
 <div className="checkout-bill-row checkout-bill-row--discount">
 <span>Discount</span>
 <span>-₹{discount}</span>
 </div>
 )}
 <div className="checkout-bill-row checkout-bill-row--total">
 <span>Total</span>
 <span>₹{grandTotal.toFixed(2)}</span>
 </div>
 </div>

 {errorMessage && <p className="checkout-error">{errorMessage}</p>}

 <button
 type="button"
 className="checkout-btn checkout-btn--place-order"
 onClick={handlePlaceOrder}
 disabled={!selectedAddress || placingOrder}
 >
 {placingOrder ? "Placing..." : "Place Order"}
 <span>₹{grandTotal.toFixed(2)}</span>
 </button>
 </aside>
 </div>
 </div>
 );
}

export default Checkout;
