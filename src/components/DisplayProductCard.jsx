// src/components/DisplayProductCard.jsx
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

/**
 * DisplayProductCard
 * - Expects a product object that may already be an "expanded variant entry" OR a grouped product
 * - Tries to be flexible: accepts either:
 *    - product.variants (array)  OR
 *    - product.price / product.format (single-variant expanded entry)
 *
 * Behavior:
 * - Shows a single representative image (prefer variant with mainImage)
 * - Calculates minPrice across variants (if variants exist)
 * - Shows a small badge with number of formats if multiple variants
 * - Image uses loading="lazy" and onError fallback
 */
const DisplayProductCard = ({ product, onClick, className = "" }) => {
  const navigate = useNavigate();

  const { repImage, minPrice, formatsCount, formatLabel } = useMemo(() => {
    let repImage = "/assets/placeholder-image.png";
    let minPrice = null;
    let formatsCount = 0;
    let formatLabel = "";

    if (Array.isArray(product.variants) && product.variants.length > 0) {
      formatsCount = product.variants.length;
      // pick first variant with image, else first variant, else placeholder
      const vWithImage = product.variants.find((v) => v.mainImage);
      repImage = (vWithImage && vWithImage.mainImage) || product.variants[0].mainImage || repImage;
      const prices = product.variants
        .map((v) => (typeof v.price === "number" ? v.price : parseFloat(v.price) || Infinity))
        .filter((p) => Number.isFinite(p));
      minPrice = prices.length ? Math.min(...prices) : null;
      formatLabel = product.variants[0]?.format || "";
    } else if (product.mainImage || product.price) {
      repImage = product.mainImage || repImage;
      minPrice = typeof product.price === "number" ? product.price : parseFloat(product.price) || null;
      formatLabel = product.format || "";
      formatsCount = product.variantsCount || (product.format ? 1 : 0);
    } else {
      // fallback
      repImage = "/assets/placeholder-image.png";
      minPrice = null;
    }

    return { repImage, minPrice, formatsCount, formatLabel };
  }, [product]);

  const handleClick = () => {
    if (onClick) return onClick();
    const slug = product.slug || product.parentId || product._id;
    navigate(`/product/${slug}`);
  };

  return (
    <div className={`product-card ${className}`} onClick={handleClick} role="button" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter') handleClick(); }}>
      <div className="product-image-wrap">
        <img
          src={repImage}
          alt={product.name || "Product image"}
          loading="lazy"
          onError={(e) => (e.target.src = "/assets/placeholder-image.png")}
        />
        {formatsCount > 1 && <span className="variant-count">{formatsCount} formats</span>}
      </div>
      <div className="product-info">
        <p className="product-name" data-format={formatLabel}>{product.name}</p>
        {product.description && <p className="product-subtitle">{product.description?.substring(0, 80)}{product.description?.length > 80 ? "…" : ""}</p>}
        <div className="product-meta">
          <p className="price">{minPrice !== null ? `₱${Number(minPrice).toFixed(2)}` : "N/A"}</p>
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
