// src/components/DisplayProductCard.jsx
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

/**
 * DisplayProductCard
 * Unified product display for grouped variants.
 *
 * ✅ Features:
 * - Displays representative image
 * - Shows lowest–highest price range if multiple variants
 * - Shows “Available in X formats” badge
 * - Automatically handles placeholder fallback
 * - Works for both grouped and single-variant products
 */
const DisplayProductCard = ({ product, onClick, className = "" }) => {
  const navigate = useNavigate();

  const { repImage, priceText, formatsCount, mainFormatLabel } = useMemo(() => {
    let repImage = "/assets/placeholder-image.png";
    let priceText = "N/A";
    let formatsCount = 0;
    let mainFormatLabel = "";

    if (Array.isArray(product.variants) && product.variants.length > 0) {
      const variants = product.variants.filter(
        (v) => typeof v.price === "number" || parseFloat(v.price)
      );
      formatsCount = variants.length;

      const allPrices = variants
        .map((v) =>
          typeof v.price === "number" ? v.price : parseFloat(v.price) || 0
        )
        .filter((p) => p > 0);

      if (allPrices.length > 0) {
        const min = Math.min(...allPrices);
        const max = Math.max(...allPrices);
        priceText =
          min === max
            ? `₱${min.toFixed(2)}`
            : `₱${min.toFixed(2)} – ₱${max.toFixed(2)}`;
      }

      // pick representative image
      const vWithImage = variants.find((v) => v.mainImage);
      repImage =
        (vWithImage && vWithImage.mainImage) ||
        product.mainImage ||
        "/assets/placeholder-image.png";

      mainFormatLabel = variants[0]?.format || "";
    } else {
      // fallback: single variant
      repImage = product.mainImage || "/assets/placeholder-image.png";
      const price =
        typeof product.price === "number"
          ? product.price
          : parseFloat(product.price);
      priceText = price ? `₱${price.toFixed(2)}` : "N/A";
      formatsCount = product.variantsCount || (product.format ? 1 : 0);
      mainFormatLabel = product.format || "";
    }

    return { repImage, priceText, formatsCount, mainFormatLabel };
  }, [product]);

  const handleClick = () => {
    if (onClick) return onClick();
    const slug = product.slug || product.parentId || product._id;
    navigate(`/product/${slug}`);
  };

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
        {formatsCount > 1 && (
          <span className="variant-count">
            {formatsCount} formats available
          </span>
        )}
      </div>

      <div className="product-info">
        <p className="product-name" data-format={mainFormatLabel}>
          {product.name}
        </p>
        {product.description && (
          <p className="product-subtitle">
            {product.description?.substring(0, 80)}
            {product.description?.length > 80 ? "…" : ""}
          </p>
        )}
        <div className="product-meta">
          <p className="price">{priceText}</p>
        </div>
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
