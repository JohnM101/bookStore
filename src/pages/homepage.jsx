// ============================================================
// ✅ Homepage.jsx — Unified Variant Product Cards with Auto Switch
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./homepage.css";

const CATEGORY_COLORS = {
  "kids-manga": { bg: "#f87171", text: "#fff" },
  "young-boys-manga": { bg: "#60a5fa", text: "#fff" },
  "young-girls-manga": { bg: "#34d399", text: "#fff" },
};

const normalizeSlug = (str) => str?.toLowerCase().replace(/\s+/g, "-").trim();

const Homepage = () => {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [mergedProducts, setMergedProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState({
    promotions: [],
    newArrivals: [],
    popular: [],
  });
  const navigate = useNavigate();

  const API_URL =
    process.env.REACT_APP_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://bookstore-0hqj.onrender.com";

  // ============================
  // 🔹 Fetch CMS Banners
  // ============================
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${API_URL}/api/cms/banners?active=true`);
        const data = await res.json();
        const active = data
          .filter((b) => b.isActive)
          .sort((a, b) => a.order - b.order);
        setBanners(active);
      } catch (err) {
        console.error("❌ Error fetching banners:", err);
      }
    };
    fetchBanners();
  }, [API_URL]);

  // ============================
  // 🔹 Fetch & Merge Products by Slug
  // ============================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const allProducts = await res.json();

        // Group by slug and merge variants
        const grouped = allProducts.reduce((acc, p) => {
          const key = p.slug || p._id;
          const catSlug = normalizeSlug(p.category);
          if (!acc[catSlug]) acc[catSlug] = {};
          if (!acc[catSlug][key]) {
            acc[catSlug][key] = {
              ...p,
              variants: [],
            };
          }
          acc[catSlug][key].variants.push({
            format: p.format,
            price: p.price,
            mainImage: p.mainImage,
          });
          return acc;
        }, {});

        // Convert nested objects to arrays
        const final = {};
        Object.entries(grouped).forEach(([cat, items]) => {
          final[cat] = Object.values(items);
        });

        setMergedProducts(final);
      } catch (err) {
        console.error("❌ Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [API_URL]);

  // ============================
  // 🔹 Fetch Featured Products
  // ============================
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/featured`);
        if (!res.ok) throw new Error("Failed to fetch featured");
        const data = await res.json();
        setFeatured({
          promotions: data.promotions || [],
          newArrivals: data.newArrivals || [],
          popular: data.popular || [],
        });
      } catch (err) {
        console.error("❌ Error fetching featured:", err);
      }
    };
    fetchFeatured();
  }, [API_URL]);

  // ============================
  // 🔹 Disclaimer Modal
  // ============================
  useEffect(() => {
    if (!localStorage.getItem("hasSeenDisclaimer")) setShowDisclaimer(true);
  }, []);

  const handleProceed = () => {
    localStorage.setItem("hasSeenDisclaimer", "true");
    setShowDisclaimer(false);
  };

  // ============================
  // 🔹 Carousel Auto Slide
  // ============================
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  // ============================================================
  // 🔸 Variant Switching Product Card
  // ============================================================
  const ProductCard = ({ product, bgColor }) => {
    const [index, setIndex] = useState(0);
    const [hovered, setHovered] = useState(false);
    const intervalRef = useRef(null);

    const variants = product.variants || [];
    const currentVariant = variants[index] || {};
    const navigate = useNavigate();

    // Auto-switch images when not hovered
    useEffect(() => {
      if (hovered || variants.length <= 1) return;
      intervalRef.current = setInterval(() => {
        setIndex((prev) => (prev + 1) % variants.length);
      }, 2000);
      return () => clearInterval(intervalRef.current);
    }, [hovered, variants.length]);

    const handleVariantHover = (i) => {
      clearInterval(intervalRef.current);
      setHovered(true);
      setIndex(i);
    };

    const handleMouseLeave = () => {
      setHovered(false);
    };

    const handleCardClick = () => {
      const variantSlug = currentVariant.format?.toLowerCase() || "standard";
      navigate(`/product/${product.slug}/${variantSlug}`);
    };

    return (
      <div
        className="product-card"
        onMouseLeave={handleMouseLeave}
        style={{ "--section-color": bgColor }}
      >
        <div className="product-image-wrap" onClick={handleCardClick}>
          <img
            src={currentVariant.mainImage || "/assets/placeholder-image.png"}
            alt={product.name}
          />
          {variants.length > 1 && (
            <div className="variant-count">{variants.length} VARIANTS</div>
          )}
        </div>

        <p className="product-name">{product.name}</p>

        {variants.length > 1 && (
          <div className="variant-buttons">
            {variants.map((v, i) => (
              <button
                key={i}
                className={`variant-btn ${i === index ? "active" : ""}`}
                onMouseEnter={() => handleVariantHover(i)}
                onClick={() => handleVariantHover(i)}
              >
                {v.format} — ₱{v.price?.toLocaleString() || "N/A"}
              </button>
            ))}
          </div>
        )}
        {variants.length === 1 && (
          <p className="price">₱{variants[0]?.price?.toFixed(2) || "N/A"}</p>
        )}
      </div>
    );
  };

  // ============================================================
  // 🔸 Category Product Section Renderer
  // ============================================================
  const renderProductSection = (slug, products) => {
    if (!products || products.length === 0) return null;
    const bgColor = CATEGORY_COLORS[slug]?.bg || "#ccc";
    const textColor = CATEGORY_COLORS[slug]?.text || "#fff";

    return (
      <div
        key={slug}
        className="product-section"
        style={{
          "--section-color": bgColor,
          "--section-text-color": textColor,
        }}
      >
        <h2 className="section-heading">
          {slug.replace(/-/g, " ").toUpperCase()}
        </h2>
        <div className="product-list">
          {products.slice(0, 8).map((p) => (
            <ProductCard key={p._id} product={p} bgColor={bgColor} />
          ))}
        </div>
        <Link to={`/${slug}`} className="view-all">
          View All →
        </Link>
      </div>
    );
  };

  // ============================================================
  // 🔸 Featured Block Renderer
  // ============================================================
  const renderFeaturedBlock = (title, list, className) => {
    if (!list || list.length === 0) return null;
    return (
      <div className={`product-section ${className}`}>
        <h2 className="section-heading">{title}</h2>
        <div className="product-list">
          {list.slice(0, 8).map((p) => (
            <ProductCard
              key={p._id}
              product={{
                ...p,
                variants: [
                  {
                    format: p.format,
                    price: p.price,
                    mainImage: p.mainImage,
                  },
                ],
              }}
              bgColor="#000"
            />
          ))}
        </div>
      </div>
    );
  };

  // ============================================================
  // 🔸 Final Render
  // ============================================================
  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div className="app">
      <Navbar />

      {/* Disclaimer */}
      {showDisclaimer && (
        <div className="disclaimer-overlay">
          <div className="disclaimer-box">
            <img src="/assets/logo.png" alt="Logo" className="disclaimer-logo" />
            <h6 className="disclaimer-header">Welcome!</h6>
            <p className="disclaimer-text">Welcome to our bookstore!</p>
            <button className="disclaimer-button" onClick={handleProceed}>
              Proceed
            </button>
          </div>
        </div>
      )}

      {/* Banner Carousel */}
      <div className="carousel-wrapper">
        {banners.length > 0 ? (
          banners.map((b, i) => (
            <div
              key={b._id}
              className={`carousel-slide ${i === current ? "active" : ""}`}
              style={{ backgroundColor: b.backgroundColor || "#fff" }}
            >
              <picture>
                {b.imageMobile && (
                  <source srcSet={b.imageMobile} media="(max-width:768px)" />
                )}
                <img
                  src={b.imageDesktop}
                  alt={b.title}
                  className="carousel-image"
                />
              </picture>
              <div className="carousel-content">
                <h2 className="carousel-title">{b.title}</h2>
                {b.ctaText && (
                  <button
                    className="carousel-btn"
                    onClick={() => navigate(b.ctaLink || "/")}
                  >
                    {b.ctaText}
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <img
            src="/assets/default-banner.png"
            alt="Default Banner"
            className="banner-image"
          />
        )}
      </div>

      {/* Featured Sections */}
      <div className="featured-wrapper">
        {renderFeaturedBlock("Promotions", featured.promotions, "featured promotions")}
        {renderFeaturedBlock("New Arrivals", featured.newArrivals, "featured new-arrivals")}
        {renderFeaturedBlock("Popular Products", featured.popular, "featured popular")}
      </div>

      {/* Category-based Product Sections */}
      {Object.entries(mergedProducts).map(([slug, products]) =>
        renderProductSection(slug, products)
      )}
    </div>
  );
};

export default Homepage;
