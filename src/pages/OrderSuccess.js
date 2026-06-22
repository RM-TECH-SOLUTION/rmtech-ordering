import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { clearCart } from "../redux/cart/cart.reducer";
import { useNavigate } from "react-router-dom";

function OrderSuccess() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(clearCart());
  }, [dispatch]);

  return (
    <div
      style={{
        flex: "1 0 auto",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        boxSizing: "border-box",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 520, width: "100%" }}>
      <h2>🎉 Order Placed Successfully!</h2>
      <p>Your order has been placed.</p>

      <button
        className="btn btn--primary"
        onClick={() => navigate("/profile?tab=orders")}
        style={{
          marginTop: 20,
        }}
      >
        Order History
      </button>
      </div>
    </div>
  );
}

export default OrderSuccess;