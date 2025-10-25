// ============================================================
// ✅ Homepage.jsx — Dynamic Category Colors + Soft Pastel Tint
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./homepage.css";

const normalizeSlug = (str) => str?.toLowerCase().replace(/\s+/g, "-").trim();

const Homepage = () => {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [productData, setProductData] = useState({});
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
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

  // Fetch CMS banners
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

  // Fetch categories (with color info)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/categories`);
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("❌ Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, [API_URL]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const allProducts = await res.json();

        const grouped = allProducts.reduce((acc, product) => {
          const catSlug = normalizeSlug(product.category);
          if (!acc[catSlug]) acc[catSlug] = [];
          acc[catSlug].push(product);
          return acc;
        }, {});

        setProductData(grouped);
      } catch (err) {
        console.error("❌ Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [API_URL]);

  // Fetch featured products
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

  // Disclaimer modal
  useEffect(() => {
    if (!localStorage.getItem("hasSeenDisclaimer")) setShowDisclaimer(true);
  }, []);

  const handleProceed = () => {
    localStorage.setItem("hasSeenDisclaimer", "true");
    setShowDisclaimer(false);
  };

  const user = JSON.parse(localStorage.getItem("user"));

  // Carousel auto-slide
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  // Helper: group variants
  const groupProductsByParent = (products) => {
    const grouped = {};
    for (const p of products) {
      const key = p.parentId || p._id;
      if (!grouped[key]) grouped[key] = { ...p, variants: [] };
      grouped[key].variants.push({
        _id: p._id,
        format: p.format,
        price: p.price,
        mainImage: p.mainImage,
      });
    }
    return Object.values(grouped);
  };

  // Get category colors dynamically from backend
  const getCategoryColors = (slug) => {
    const found = categories.find(
      (cat) => normalizeSlug(cat.name) === normalizeSlug(slug)
    );
    return {
      bg: found?.color || "#f4f4f4",
      text: found?.textColor || "#111111",
    };
  };

  // Product Card
  const VariantCard = ({ product }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [hovered, setHovered] = useState(false);
    const [fading, setFading] = useState(false);
    const intervalRef = useRef(null);

    const variants = product.variants || [];
    const hasVariants = variants.length > 1;
    const currentImage =
      variants[activeIndex]?.mainImage ||
      product.mainImage ||
      "/assets/placeholder-image.png";

    useEffect(() => {
      if (!hasVariants || hovered) return;
      intervalRef.current = setInterval(() => {
        setFading(true);
        setTimeout(() => {
          setActiveIndex((prev) => (prev + 1) % variants.length);
          setFading(false);
        }, 200);
      }, 2000);
      return () => clearInterval(intervalRef.current);
    }, [variants, hovered, hasVariants]);

    const handleMouseEnter = () => setHovered(true);
    const handleMouseLeave = () => setHovered(false);

    const handleVariantHover = (idx) => {
      setActiveIndex(idx);
      setHovered(true);
    };

    const handleVariantClick = (v) =>
      navigate(`/product/${product.slug}/${v.format.toLowerCase()}`);

    const handleCardClick = () => {
      const v = variants[activeIndex] || variants[0];
      navigate(`/product/${product.slug}/${v.format?.toLowerCase() || "standard"}`);
    };

    return (
      <div
        className="product-card variant-card"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleCardClick}
      >
        <div className="product-image-wrap">
          <img
            src={currentImage}
            alt={product.name}
            className={fading ? "fade" : ""}
            onError={(e) => (e.target.src = "/assets/placeholder-image.png")}
          />
          {hasVariants && (
            <span className="variant-count">{variants.length} Variants</span>
          )}
        </div>
        <p className="product-name">{product.name}</p>
        <p className="price">
          ₱
          {variants[activeIndex]?.price?.toFixed(2) ||
            product.price?.toFixed(2) ||
            "N/A"}
        </p>

        {hasVariants && (
          <div className="variant-buttons">
            {variants.map((v, idx) => (
              <button
                key={v._id}
                className={`variant-btn ${idx === activeIndex ? "active" : ""}`}
                onMouseEnter={() => handleVariantHover(idx)}
                onClick={() => handleVariantClick(v)}
              >
                {v.format} — ₱{v.price?.toFixed(2) || "N/A"}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render Category Section
  const renderProductSection = (slug, products) => {
    if (!products || products.length === 0) return null;
    const { bg, text } = getCategoryColors(slug);
    const grouped = groupProductsByParent(products);

    return (
      <div
        key={slug}
        className="product-section"
        style={{
          "--section-color": bg,
          "--section-text-color": text,
        }}
      >
        <h2 className="section-heading">
          {slug.replace(/-/g, " ").toUpperCase()}
        </h2>
        <div className="product-list">
          {grouped.slice(0, 8).map((p) => (
            <VariantCard key={p._id} product={p} />
          ))}
        </div>
        <Link to={`/${slug}`} className="view-all">
          View All →
        </Link>
      </div>
    );
  };

  // Render Featured Block
  const renderFeaturedBlock = (title, list, className) => {
    if (!list || list.length === 0) return null;
    const grouped = groupProductsByParent(list);

    return (
      <div className={`product-section ${className}`}>
        <h2 className="section-heading">{title}</h2>
        <div className="product-list">
          {grouped.slice(0, 8).map((p) => (
            <VariantCard key={p._id} product={p} />
          ))}
        </div>
        <Link
          to={`/collections/${title.toLowerCase().replace(/\s+/g, "-")}`}
          className="view-all"
        >
          View All →
        </Link>
      </div>
    );
  };

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div className="app">
      <Navbar />

      {showDisclaimer && (
        <div className="disclaimer-overlay">
          <div className="disclaimer-box">
            <img src="/assets/logo.png" alt="Logo" className="disclaimer-logo" />
            <h6 className="disclaimer-header">Welcome!</h6>
            <p className="disclaimer-text">
              {user
                ? `Hello ${user.firstName} ${user.lastName}!`
                : "Welcome to our bookstore!"}
            </p>
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
                {b.subtitle && <p className="carousel-subtitle">{b.subtitle}</p>}
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
      {Object.entries(productData).map(([slug, products]) =>
        renderProductSection(slug, products)
      )}
    </div>
  );
};

export default Homepage;
