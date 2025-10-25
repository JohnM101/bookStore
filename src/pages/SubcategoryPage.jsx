import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./categories.css";

const SubcategoryPage = () => {
  const { categorySlug, subcategorySlug } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL =
    process.env.REACT_APP_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://bookstore-0hqj.onrender.com";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        const filtered = data.filter(
          (p) =>
            p.category === categorySlug && p.subcategory === subcategorySlug
        );

        setProducts(filtered);
      } catch (err) {
        console.error(err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [API_URL, categorySlug, subcategorySlug]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="app">
      <h2 className="section-heading">
        {categorySlug.replace(/-/g, " ")} → {subcategorySlug.replace(/-/g, " ")}
      </h2>
      <div className="product-list">
        {products.map((p) => (
          <div
            key={p._id}
            className="product-card variant-card"
            onClick={() => navigate(`/product/${p.slug || p._id}`)}
          >
            <div className="product-image-wrap">
              <img
                src={p.mainImage || "/assets/placeholder-image.png"}
                alt={p.name}
                onError={(e) =>
                  (e.target.src = "/assets/placeholder-image.png")
                }
              />
            </div>
            <p className="product-name">{p.name}</p>
            <p className="price">₱{p.price?.toFixed(2) || "N/A"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubcategoryPage;
