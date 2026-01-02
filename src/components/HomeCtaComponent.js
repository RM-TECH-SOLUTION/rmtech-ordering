import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import '../styles/components/HomeCtaComponent.scss';
import { Link } from "react-router-dom";
import { homeCtaCardsData, homeCtaCardsConfigData} from "../redux/Home/home.reducer";

const Card = ({ image, linkText, subTitle, title, path, authToken, homeCtaBackgroundColor, buttonText, disableButton }) => {
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  return (
    <div className="cta-card" style={{ backgroundColor: homeCtaBackgroundColor ? homeCtaBackgroundColor : "#D7AB53" }}>
      <div className="cta-card-image-container">
        {!imageError ? (
          <img
            src={image}
            alt={title}
            onLoad={() => setLoading(true)}
            onError={() => setImageError(true)}
            className={`cta-card-image ${loading ? 'loaded' : 'loading'}`}
          />
        ) : (
          <div className="cta-card-image-fallback">
            <span className="fallback-icon">📷</span>
          </div>
        )}
        
        {/* Image overlay gradient */}
        <div className="image-overlay"></div>
      </div>
      
      <div className="cta-card-content">
        <div className="cta-card-text">
          <h3 className="cta-card-title">{title}</h3>
          <p className="cta-card-subTitle">{subTitle}</p>
        </div>
        
        {authToken ? (
          <Link
            to={disableButton && disableButton === "1" ? "#" : "/order/takeAway"}
            className={`cta-button ${disableButton && disableButton === "1" ? 'disabled' : ''}`}
            onClick={(e) => disableButton && disableButton === "1" && e.preventDefault()}
          >
            <span className="button-text">
              {buttonText ? buttonText : "Order Now"}
            </span>
            <span className="button-icon">→</span>
          </Link>
        ) : (
          <Link
            to={path && path ? path : "/auth"}
            className="cta-button"
          >
            <span className="button-text">{linkText}</span>
            <span className="button-icon">→</span>
          </Link>
        )}
      </div>
    </div>
  );
};

const HomeCtaComponent2 = ({ homeCtaCardsData, homeCtaCardsConfigData, authToken, navbar, homeCtaCards, homeCtaCardsConfig }) => {
  const containerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    homeCtaCardsData();
    homeCtaCardsConfigData();
  }, []);

  useEffect(() => {
    const scrollContainer = containerRef.current;
    
    if (!scrollContainer || isPaused) return;

    const scrollSpeed = 1.5;
    let scrollInterval;
    let animationId;

    const startScrolling = () => {
      scrollInterval = setInterval(() => {
        if (scrollContainer.scrollLeft >= (scrollContainer.scrollWidth - scrollContainer.clientWidth)) {
          scrollContainer.scrollLeft = 0;
        } else {
          scrollContainer.scrollLeft += scrollSpeed;
        }
      }, 20);
    };

    const smoothScroll = () => {
      if (scrollContainer.scrollLeft >= (scrollContainer.scrollWidth - scrollContainer.clientWidth)) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += scrollSpeed;
      }
      animationId = requestAnimationFrame(smoothScroll);
    };

  
    startScrolling();
  

    return () => {
      clearInterval(scrollInterval);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isPaused]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);


  const duplicateCards = homeCtaCards && homeCtaCards.length > 0 
    ? [...homeCtaCards, ...homeCtaCards] 
    : [];

  return (
    <div className="home-cta-container">
 
      <div className="cta-header">
        {homeCtaCardsConfig?.title && (
          <div 
            className="cta-main-title"
            dangerouslySetInnerHTML={{ __html: homeCtaCardsConfig.title }}
          />
        )}
        
        {homeCtaCardsConfig?.subTitle && (
          <div 
            className="cta-subtitle"
            dangerouslySetInnerHTML={{ __html: homeCtaCardsConfig.subTitle }}
          />
        )}
      </div>


      <div className="cta-scroll-container">
        <div 
          ref={containerRef}
          className="cta-cards-wrapper"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {duplicateCards.length > 0 ? (
            duplicateCards.map((card, index) => (
              <Card 
                key={`${card.title || 'card'}-${index}`}
                {...card} 
                authToken={authToken}
                navbar={navbar}
              />
            ))
          ) : (

            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="cta-card-skeleton">
                <div className="skeleton-image"></div>
                <div className="skeleton-content">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-button"></div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="scroll-indicators">
          <span className="scroll-hint">← Scroll →</span>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  homeCtaCards: state.homeReducer.homeCtaCards,
  homeCtaCardsConfig: state.homeReducer.homeCtaCardsConfig,
});

const mapDispatchToProps = {
  homeCtaCardsData,
  homeCtaCardsConfigData
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeCtaComponent2);