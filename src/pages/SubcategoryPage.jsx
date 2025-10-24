// ============================================================
// ✅ SubcategoryPage.jsx — Variant Image & Fallback Fix
// ============================================================
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./categories.css";

const SubcategoryPage = () => {
  const navigate = useNavigate();
  const { categorySlug, subcategorySlug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://bookstore-0hqj.onrender.com";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/products`);
        if (!response.ok) throw new Error("Failed to fetch products");

        const allProducts = await response.json();

        const filtered = allProducts.filter(
          (p) =>
            p.category === categorySlug && p.subcategory === subcategorySlug
        );

        // ✅ Use first variant image if root missing
        const processed = filtered.map((p) => ({
          ...p,
          displayImage:
            p.image ||
            p.variants?.[0]?.mainImage ||
            "/assets/placeholder-image.png",
          displayPrice:
            p.variants?.[0]?.price || p.price || "N/A",
        }));

        setProducts(processed);
      } catch (err) {
        console.error("Error fetching subcategory products:", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [API_URL, categorySlug, subcategorySlug]);

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="app">
      <div className="product-section">
        <h2 className="section-heading">
          {categorySlug.replace(/-/g, " ")} → {subcategorySlug.replace(/-/g, " ")}
        </h2>

        <div className="product-grid">
          {products.length === 0 ? (
            <p>No products found.</p>
          ) : (
            products.map((p) => (
              <div
                key={p._id}
                className="product-card"
                onClick={() => navigate(`/product/${p.slug || p.parentId || p._id}`)}
              >
                <img
                  src={p.displayImage}
                  alt={p.name}
                  onError={(e) =>
                    (e.target.src = "/assets/placeholder-image.png")
                  }
                />
                <p className="product-name">{p.name}</p>
                <p className="price">
                  ₱{p.displayPrice.toLocaleString() || "N/A"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SubcategoryPage;
