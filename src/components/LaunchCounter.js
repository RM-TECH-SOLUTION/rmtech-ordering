import React, { useEffect, useState } from "react";
import "../styles/LaunchCounter.scss";

const LaunchCounter = ({ onFinish }) => {
  const [count, setCount] = useState(10);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (count === 0) {
      setTimeout(() => {
        onFinish?.();
      }, 1200);
      return;
    }

    const timer = setTimeout(() => {
      setAnimate(true);

      setTimeout(() => {
        setCount((prev) => prev - 1);
        setAnimate(false);
      }, 200);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onFinish]);

  return (
    <div className="launch-overlay">
      <div className="launch-center">
        <h3 className="launch-brand">RM TECH PRESENTS</h3>

        <div className={`launch-number ${animate ? "pop" : ""}`}>
          {count === 0 ? "🚀 Launching" : count}
        </div>

        <p className="launch-subtitle">Preparing launch...</p>
      </div>
    </div>
  );
};

export default LaunchCounter;
