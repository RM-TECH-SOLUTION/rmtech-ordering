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
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>🎉 Order Placed Successfully!</h2>
      <p>Your order has been placed.</p>

      <button
        onClick={() => navigate("/categories")}
        style={{
          background: "#ff7a18",
          color: "#fff",
          border: "none",
          padding: "12px 18px",
          borderRadius: 8,
          marginTop: 20,
          cursor: "pointer"
        }}
      >
        Order More
      </button>
    </div>
  );
}

export default OrderSuccess;
