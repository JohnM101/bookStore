// ============================================================
// ✅ src/pages/Homepage.jsx — Unified Featured + Category Grouping
// ============================================================
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import DisplayProductCard from "../components/DisplayProductCard";
import "./homepage.css";

const CATEGORY_COLORS = {
  "kids-manga": { bg: "#f87171", text: "#fff" },
  "young-boys-manga": { bg: "#60a5fa", text: "#fff" },
  "young-girls-manga": { bg: "#34d399", text: "#fff" },
};

const normalizeSlug = (str) => str?.toLowerCase().replace(/\s+/g, "-").trim();

const API_URL =
  process.env.REACT_APP_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://bookstore-0hqj.onrender.com";

const Homepage = () => {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [productData, setProductData] = useState({});
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState({
    promotions: [],
    newArrivals: [],
    popular: [],
  });
  const navigate = useNavigate();

  // ============================================================
  // 🔹 Helper: Group Products by Slug (deduplicate variants)
  // ============================================================
  const groupProducts = (list = []) => {
    const grouped = list.reduce((acc, p) => {
      const key = p.slug || p.parentId || p._id?.split("-")[0] || p._id;
      if (!acc[key]) {
        acc[key] = {
          _id: key,
          slug: p.slug,
          name: p.name,
          description: p.description,
          category: p.category,
          variants: [],
          mainImage: p.mainImage || p.albumImages?.[0] || null,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        };
      }

      acc[key].variants.push({
        format: p.format || "Standard",
        price: Number(p.price) || 0,
        countInStock: p.countInStock || 0,
        mainImage: p.mainImage,
        albumImages: p.albumImages || [],
      });
      return acc;
    }, {});
    return Object.values(grouped);
  };

  // ============================================================
  // 🔹 Fetch CMS Banners
  // ============================================================
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${API_URL}/api/cms/banners?active=true`);
        const data = await res.json();
        const active = Array.isArray(data)
          ? data
              .filter((b) => b.isActive)
              .sort((a, b) => (a.order || 0) - (b.order || 0))
          : [];
        setBanners(active);
      } catch (err) {
        console.error("❌ Error fetching banners:", err);
      }
    };
    fetchBanners();
  }, []);

  // ============================================================
  // 🔹 Fetch Featured Products (grouped)
  // ============================================================
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/featured`);
        if (!res.ok) throw new Error("Failed to fetch featured");
        const data = await res.json();
        setFeatured({
          promotions: groupProducts(data.promotions || []),
          newArrivals: groupProducts(data.newArrivals || []),
          popular: groupProducts(data.popular || []),
        });
      } catch (err) {
        console.error("❌ Error fetching featured:", err);
        setFeatured({ promotions: [], newArrivals: [], popular: [] });
      }
    };
    fetchFeatured();
  }, []);

  // ============================================================
  // 🔹 Fetch All Products and Group by Category
  // ============================================================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/products`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const allProducts = await res.json();

        const groupedByCategory = allProducts.reduce((acc, p) => {
          const catSlug = normalizeSlug(p.category) || "uncategorized";
          if (!acc[catSlug]) acc[catSlug] = [];
          acc[catSlug].push(p);
          return acc;
        }, {});

        const finalGrouped = Object.entries(groupedByCategory).reduce(
          (acc, [cat, list]) => {
            acc[cat] = groupProducts(list);
            return acc;
          },
          {}
        );

        setProductData(finalGrouped);
      } catch (err) {
        console.error("❌ Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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
  // 🔹 Carousel Auto-Slide
  // ============================================================
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(
      () => setCurrent((prev) => (prev + 1) % banners.length),
      6000
    );
    return () => clearInterval(interval);
  }, [banners]);

  // ============================================================
  // 🔹 Deduplication Across Sections
  // ============================================================
  const displayedSlugs = new Set();

  // ============================================================
  // 🔹 Render Featured Section
  // ============================================================
  const renderFeaturedBlock = (title, list, className) => {
    if (!Array.isArray(list) || list.length === 0) return null;
    return (
      <section className={`product-section featured-section ${className}`}>
        <div className="section-header">
          <h2 className="section-heading">{title}</h2>
          <Link
            to={`/collections/${title.toLowerCase().replace(/\s+/g, "-")}`}
            className="view-all small"
          >
            View All
          </Link>
        </div>
        <div className="product-shelf">
          {list.slice(0, 12).map((p) => {
            if (displayedSlugs.has(p.slug)) return null;
            displayedSlugs.add(p.slug);
            return (
              <DisplayProductCard
                key={p._id}
                product={p}
                onClick={() => navigate(`/product/${p.slug || p._id}`)}
              />
            );
          })}
        </div>
      </section>
    );
  };

  // ============================================================
  // 🔹 Render Category Section
  // ============================================================
  const renderCategorySection = (slug, products) => {
    if (!products || products.length === 0) return null;
    const bgColor = CATEGORY_COLORS[slug]?.bg || "#f3f4f6";
    const textColor = CATEGORY_COLORS[slug]?.text || "#111";

    return (
      <section
        key={slug}
        className="product-section category-section"
        style={{
          "--section-color": bgColor,
          "--section-text-color": textColor,
        }}
      >
        <div className="section-header">
          <h2 className="section-heading">
            {slug.replace(/-/g, " ").toUpperCase()}
          </h2>
          <Link to={`/${slug}`} className="view-all small">
            View All
          </Link>
        </div>
        <div className="product-grid">
          {products
            .filter((p) => !displayedSlugs.has(p.slug))
            .slice(0, 8)
            .map((p) => {
              displayedSlugs.add(p.slug);
              return (
                <DisplayProductCard
                  key={p._id}
                  product={p}
                  onClick={() => navigate(`/product/${p.slug || p._id}`)}
                />
              );
            })}
        </div>
      </section>
    );
  };

  // ============================================================
  // 🔹 Render Loading / Main Page
  // ============================================================
  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div className="app">
      <Navbar />

      {/* Disclaimer */}
      {showDisclaimer && (
        <div className="disclaimer-overlay">
          <div className="disclaimer-box">
            <img
              src="/assets/logo.png"
              alt="Logo"
              className="disclaimer-logo"
            />
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

      {/* Carousel */}
      <div className="carousel-wrapper">
        {banners.length > 0 ? (
          banners.map((b, i) => (
            <div
              key={b._id}
              className={`carousel-slide ${
                i === current ? "active" : ""
              } ${b.animationType || ""}`}
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
                {b.subtitle && (
                  <p className="carousel-subtitle">{b.subtitle}</p>
                )}
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
        {renderFeaturedBlock("🔥 Promotions", featured.promotions, "promotions")}
        {renderFeaturedBlock("🆕 New Arrivals", featured.newArrivals, "new-arrivals")}
        {renderFeaturedBlock("⭐ Popular Products", featured.popular, "popular")}
      </div>

      {/* Category Sections */}
      <main>
        {Object.entries(productData).map(([slug, products]) =>
          renderCategorySection(slug, products)
        )}
      </main>
    </div>
  );
};

export default Homepage;
