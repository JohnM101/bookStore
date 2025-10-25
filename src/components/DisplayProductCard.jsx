import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

/**
 * DisplayProductCard
 * - Unified display for products that may have multiple variants (formats/offers)
 * - Shows a single representative image
 * - Displays either a single price or a range (min–max)
 * - Shows an "Offers available" badge if multiple formats
 */
const DisplayProductCard = ({ product, onClick, className = "" }) => {
  const navigate = useNavigate();

  const { repImage, minPrice, maxPrice, hasMultipleFormats, isPromotion } = useMemo(() => {
    let repImage = "/assets/placeholder-image.png";
    let minPrice = null;
    let maxPrice = null;
    let isPromotion = product.isPromotion || false;

    // If variants exist, calculate price range
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      const prices = product.variants
        .map((v) => (typeof v.price === "number" ? v.price : parseFloat(v.price) || 0))
        .filter((p) => p > 0);

      if (prices.length > 0) {
        minPrice = Math.min(...prices);
        maxPrice = Math.max(...prices);
      }

      // Use first available image
      const vWithImage = product.variants.find((v) => v.mainImage);
      repImage = (vWithImage && vWithImage.mainImage) || product.mainImage || repImage;
    } else {
      // Single product fallback
      minPrice = typeof product.price === "number" ? product.price : parseFloat(product.price) || null;
      maxPrice = minPrice;
      repImage = product.mainImage || repImage;
    }

    const hasMultipleFormats =
      Array.isArray(product.variants) && product.variants.length > 1;

    return { repImage, minPrice, maxPrice, hasMultipleFormats, isPromotion };
  }, [product]);

  const handleClick = () => {
    if (onClick) return onClick();
    const slug = product.slug || product.parentId || product._id;
    navigate(`/product/${slug}`);
  };

  const displayPrice =
    minPrice && maxPrice && minPrice !== maxPrice
      ? `₱${minPrice.toFixed(2)} – ₱${maxPrice.toFixed(2)}`
      : minPrice
      ? `₱${minPrice.toFixed(2)}`
      : "N/A";

  return (
    <div
      className={`product-card ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleClick();
      }}
    >
      <div className="product-image-wrap">
        <img
          src={repImage}
          alt={product.name || "Product image"}
          loading="lazy"
          onError={(e) => (e.target.src = "/assets/placeholder-image.png")}
        />
        {isPromotion && <span className="offer-badge">🔥 On Sale</span>}
      </div>

      <div className="product-info">
        <p className="product-name">{product.name}</p>

        {product.description && (
          <p className="product-subtitle">
            {product.description.substring(0, 70)}
            {product.description.length > 70 ? "…" : ""}
          </p>
        )}

        <p className="price">{displayPrice}</p>

        {hasMultipleFormats && (
          <p className="multi-format-note">Multiple formats available</p>
        )}
      </div>
    </div>
  );
};

DisplayProductCard.propTypes = {
  product: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default DisplayProductCard;
