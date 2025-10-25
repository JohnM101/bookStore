import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import "./categories.css";

const normalizeSlug = (str) => str?.toLowerCase().replace(/\s+/g, "-").trim();

const CATEGORY_COLORS = {
  "kids-manga": { bg: "#f87171", text: "#fff" },
  "young-boys-manga": { bg: "#60a5fa", text: "#fff" },
  "young-girls-manga": { bg: "#34d399", text: "#fff" },
};

const MangaCategoryPage = ({ baseCategory, heading }) => {
  const navigate = useNavigate();
  const { subcategory } = useParams();
  const [productsData, setProductsData] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("default");

  const API_URL =
    process.env.REACT_APP_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://bookstore-0hqj.onrender.com";

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/products`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const allProducts = await res.json();

        const baseCatNorm = normalizeSlug(baseCategory);
        const subCatNorm = normalizeSlug(subcategory);

        const filtered = allProducts.filter((p) => {
          const cat = normalizeSlug(p.category);
          const sub = normalizeSlug(p.subcategory);
          return subCatNorm
            ? cat === baseCatNorm && sub === subCatNorm
            : cat === baseCatNorm;
        });

        setProductsData(filtered);

        const uniqueSubcats = [
          ...new Set(
            allProducts
              .filter((p) => normalizeSlug(p.category) === baseCatNorm)
              .map((p) => p.subcategory)
              .filter(Boolean)
          ),
        ];
        setSubcategories(uniqueSubcats);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [API_URL, baseCategory, subcategory]);

  const handleSortChange = (e) => setSortOption(e.target.value);
  const getSortedProducts = () => {
    switch (sortOption) {
      case "price-low-to-high":
        return [...productsData].sort((a, b) => a.price - b.price);
      case "price-high-to-low":
        return [...productsData].sort((a, b) => b.price - a.price);
      default:
        return productsData;
    }
  };

  // Group variants
  const groupProductsByParent = (products) => {
    const grouped = {};
    for (const p of products) {
      const key = p.parentId || p._id;
      if (!grouped[key]) {
        grouped[key] = { ...p, variants: [] };
      }
      grouped[key].variants.push({
        _id: p._id,
        format: p.format,
        price: p.price,
        mainImage: p.mainImage,
      });
    }
    return Object.values(grouped);
  };

  // 🧱 Variant-Aware Product Card
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
      navigate(
        `/product/${product.slug}/${v.format?.toLowerCase() || "standard"}`
      );
    };

    return (
      <div
        className="product-card variant-card"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="product-image-wrap" onClick={handleCardClick}>
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

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const groupedProducts = groupProductsByParent(getSortedProducts());
  const bgColor = CATEGORY_COLORS[baseCategory]?.bg || "#ccc";
  const textColor = CATEGORY_COLORS[baseCategory]?.text || "#fff";

  return (
    <div className="app">
      <h2
        className="section-heading"
        style={{ color: textColor, borderColor: bgColor }}
      >
        {heading}{" "}
        {subcategory
          ? `– ${subcategory
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")}`
          : ""}
      </h2>

      <div className="subcategory-nav">
        <Link to={`/${baseCategory}`} className={!subcategory ? "active-subcat" : ""}>
          All
        </Link>
        {subcategories.map((sc) => (
          <Link
            key={sc}
            to={`/${baseCategory}/${normalizeSlug(sc)}`}
            className={
              normalizeSlug(subcategory) === normalizeSlug(sc)
                ? "active-subcat"
                : ""
            }
          >
            {sc}
          </Link>
        ))}
      </div>

      <div className="sorting-controls">
        <label htmlFor="sort-select">Sort by:</label>
        <select
          id="sort-select"
          value={sortOption}
          onChange={handleSortChange}
        >
          <option value="default">Default</option>
          <option value="price-low-to-high">Price: Low to High</option>
          <option value="price-high-to-low">Price: High to Low</option>
        </select>
      </div>

      <div
        className="product-section"
        style={{
          "--section-color": bgColor,
          "--section-text-color": textColor,
        }}
      >
        <div className="product-list">
          {groupedProducts.length > 0 ? (
            groupedProducts.map((p) => <VariantCard key={p._id} product={p} />)
          ) : (
            <p className="no-products">No products found.</p>
          )}
        </div>
      </div>

      <hr className="bottom-line" />
    </div>
  );
};

export default MangaCategoryPage;
