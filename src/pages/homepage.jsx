// ============================================================
// ✅ Homepage.jsx — Modern Banner + Interactive Carousel (Fixed Readability)
// ============================================================
import React, { useState, useEffect } from "react";
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
  const [productData, setProductData] = useState({});
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const API_URL =
    process.env.REACT_APP_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://bookstore-0hqj.onrender.com";

  // ============================================================
  // 🔹 Fetch CMS Banners
  // ============================================================
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${API_URL}/api/cms/banners?active=true`);
        const data = await res.json();
        const active = data.filter((b) => b.isActive).sort((a, b) => a.order - b.order);
        setBanners(active);
      } catch (err) {
        console.error("❌ Error fetching banners:", err);
      }
    };
    fetchBanners();
  }, [API_URL]);

  // ============================================================
  // 🔹 Fetch Categories
  // ============================================================
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

  // ============================================================
  // 🔹 Fetch Products
  // ============================================================
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

  // ============================================================
  // 🔹 Disclaimer Modal
  // ============================================================
  useEffect(() => {
    if (!localStorage.getItem("hasSeenDisclaimer")) setShowDisclaimer(true);
  }, []);

  const handleProceed = () => {
    localStorage.setItem("hasSeenDisclaimer", "true");
    setShowDisclaimer(false);
  };

  const user = JSON.parse(localStorage.getItem("user"));

  // ============================================================
  // 🔹 Carousel Auto-slide
  // ============================================================
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  // ============================================================
  // 🔹 Render Product Section
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
        <h2 className="section-heading">{slug.replace(/-/g, " ").toUpperCase()}</h2>
        <div className="product-list">
          {products.slice(0, 8).map((p) => (
            <div
              className="product-card"
              key={p._id}
              onClick={() => navigate(`/product/${p.slug || p.parentId || p._id}`)}
            >
              <img
                src={p.mainImage || "/assets/placeholder-image.png"}
                alt={p.name}
                onError={(e) => (e.target.src = "/assets/placeholder-image.png")}
              />
              <p className="product-name">{p.name}</p>
              <p className="product-subtitle">{p.description?.substring(0, 40)}...</p>
              <p className="price">₱{p.price?.toFixed(2) || "N/A"}</p>
            </div>
          ))}
        </div>
        <Link to={`/${slug}`} className="view-all">
          View All →
        </Link>
      </div>
    );
  };

  // ============================================================
  // 🔹 UI States
  // ============================================================
  if (loading) return <div className="loading">Loading products...</div>;

  // ============================================================
  // 🔹 Render Homepage
  // ============================================================
  return (
    <div className="app">
      <Navbar />

      {/* Disclaimer */}
      {showDisclaimer && (
        <div className="disclaimer-overlay">
          <div className="disclaimer-box">
            <img src="/assets/logo.png" alt="Logo" className="disclaimer-logo" />
            <h6 className="disclaimer-header">Welcome!</h6>
            <p className="disclaimer-text">
              {user ? `Hello ${user.firstName} ${user.lastName}!` : "Welcome to our bookstore!"}
            </p>
            <button className="disclaimer-button" onClick={handleProceed}>
              Proceed
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 🎨 Interactive Banner Carousel — Fixed Overlay Version */}
      {/* ============================================================ */}
      <div className="carousel-wrapper">
        {banners.length > 0 ? (
          banners.map((b, i) => (
            <div
              key={b._id}
              className={`carousel-slide ${i === current ? "active" : ""} ${b.animationType}`}
              style={{
                backgroundColor: b.backgroundColor || "#fff",
              }}
            >
              {/* Dark gradient overlay handled in CSS ::before */}
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
          <img src="/assets/default-banner.png" alt="Default Banner" className="banner-image" />
        )}
      </div>

      {/* ============================================================ */}
      {/* 🛍️ Product Sections */}
      {/* ============================================================ */}
      {Object.entries(productData).map(([slug, products]) =>
        renderProductSection(slug, products)
      )}
    </div>
  );
};

export default Homepage;
