import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./categories.css";
import "./ProductPage.css";
import { useCart } from "../contexts/CartContext";
import { useUser } from "../contexts/UserContext";

const normalizeImagePath = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return path.startsWith("/") ? path : `/${path}`;
};

const ProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user: currentUser } = useUser();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showQuantityPrompt, setShowQuantityPrompt] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [showZoom, setShowZoom] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [zoomPosition, setZoomPosition] = useState("right");
  const imageRef = useRef(null);
  const zoomRef = useRef(null);
  const carouselRef = useRef(null);
  const autoScrollInterval = useRef(null);

  const isGuest = !currentUser || currentUser.isGuest;

  useEffect(() => {
    setProduct(null);
    setRelatedProducts([]);
    setMainImage("");
    setLoading(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchProduct = async () => {
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL ||
          "https://bookstore-0hqj.onrender.com";

        const res = await fetch(`${API_URL}/api/products?slug=${slug}`);
        if (!res.ok) throw new Error("Product not found");

        const data = await res.json();
        const prod = Array.isArray(data) ? data[0] : data;
        if (!prod) throw new Error("Product not found");

        const mainImg = normalizeImagePath(prod.image);
        const album = prod.albumImages?.map(normalizeImagePath) || [];
        const albumWithMain = album.includes(mainImg)
          ? album
          : [mainImg, ...album];

        setMainImage(mainImg);
        setProduct({ ...prod, albumImages: albumWithMain });
        setLoading(false);

        // Fetch related products
        const [subRes, catRes] = await Promise.all([
          prod.subcategory
            ? fetch(
                `${API_URL}/api/products?subcategory=${encodeURIComponent(
                  prod.subcategory
                )}`
              )
            : Promise.resolve(null),
          fetch(
            `${API_URL}/api/products?category=${encodeURIComponent(
              prod.category
            )}`
          ),
        ]);

        const subData = subRes && subRes.ok ? await subRes.json() : [];
        const catData = catRes.ok ? await catRes.json() : [];
        const filteredSub = subData.filter((p) => p.slug !== prod.slug);
        const filteredCat = catData.filter(
          (p) =>
            p.slug !== prod.slug &&
            !filteredSub.some((s) => s.slug === p.slug)
        );
        setRelatedProducts([...filteredSub, ...filteredCat]);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  useEffect(() => {
    const zoom = zoomRef.current;
    if (zoom && mainImage) {
      zoom.style.backgroundImage = `url(${mainImage})`;
      zoom.style.backgroundRepeat = "no-repeat";
      zoom.style.backgroundSize = "200% 200%";
      zoom.style.backgroundPosition = "center";
    }
  }, [mainImage]);

  const handleMouseMove = (e) => {
    const img = imageRef.current;
    const zoom = zoomRef.current;
    if (!img || !zoom) return;

    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const lensWidth = 120;
    const lensHeight = 120;
    let newX = Math.max(0, Math.min(x - lensWidth / 2, rect.width - lensWidth));
    let newY = Math.max(0, Math.min(y - lensHeight / 2, rect.height - lensHeight));

    setLensPosition({ x: newX, y: newY });
    const cx = img.naturalWidth / rect.width;
    const cy = img.naturalHeight / rect.height;
    zoom.style.backgroundPosition = `${-newX * cx}px ${-newY * cy}px`;
    zoom.style.backgroundSize = `${img.naturalWidth}px ${img.naturalHeight}px`;
  };

  const handleMouseEnter = () => {
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const spaceRight = window.innerWidth - rect.right;
    const spaceLeft = rect.left;
    setZoomPosition(spaceRight < 450 && spaceLeft > 450 ? "left" : "right");
    setShowZoom(true);
  };
  const handleMouseLeave = () => setShowZoom(false);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || relatedProducts.length === 0) return;
    const startAutoScroll = () => {
      autoScrollInterval.current = setInterval(() => {
        if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth) {
          carousel.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          carousel.scrollBy({ left: 250, behavior: "smooth" });
        }
      }, 4000);
    };
    startAutoScroll();
    carousel.addEventListener("mouseenter", () => clearInterval(autoScrollInterval.current));
    carousel.addEventListener("mouseleave", startAutoScroll);
    return () => clearInterval(autoScrollInterval.current);
  }, [relatedProducts]);

  const handleAddToCartClick = () => setShowQuantityPrompt(true);
  const confirmAddToCart = async () => {
    try {
      await addToCart(product, quantity);
      setShowQuantityPrompt(false);
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  if (loading) return <div className="loading-container">Loading product details...</div>;
  if (error || !product)
    return (
      <div className="not-found-container">
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist.</p>
        <button onClick={() => navigate("/")}>Return to Homepage</button>
      </div>
    );

  const albumImages = product.albumImages || [];
  const categoryLink = `/${product.category?.toLowerCase().replace(/\s+/g, "-")}`;
  const genreLink = product.subcategory
    ? `${categoryLink}/${product.subcategory.toLowerCase().replace(/\s+/g, "-")}`
    : null;

  return (
    <div className="app">
      <div className="product-section">
        <div className="product-detail-container">
          {/* Image Gallery */}
          <div className="product-gallery-wrapper">
            <div className="product-album-vertical">
              {albumImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx}`}
                  className={mainImage === img ? "active" : ""}
                  onClick={() => setMainImage(img)}
                />
              ))}
            </div>
            <div className="product-main-image-box">
              <div
                className="zoom-container"
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <img ref={imageRef} src={mainImage} alt={product.name} className="zoom-image" />
                {showZoom && (
                  <div
                    className="zoom-lens"
                    style={{ left: `${lensPosition.x}px`, top: `${lensPosition.y}px` }}
                  ></div>
                )}
              </div>
              <div
                ref={zoomRef}
                className={`zoom-popup ${zoomPosition === "left" ? "flip-left" : ""} ${
                  showZoom ? "show" : ""
                }`}
              ></div>
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info">
            <h1 className="product-name">{product.name}</h1>
            <p className="price">₱{product.price.toFixed(2)}</p>
            <p className="product-description">{product.description}</p>

            <div className="product-meta">
              <p>Category: <Link to={categoryLink}>{product.category}</Link></p>
              {genreLink && <p>Genre: <Link to={genreLink}>{product.subcategory}</Link></p>}
              <p>Stock: {product.countInStock}</p>
            </div>

            <div className="product-actions">
              {isGuest ? (
                <Link to="/login" className="sign-in-button">Sign In to Add to Cart</Link>
              ) : (
                <button className="add-to-cart-btn" onClick={handleAddToCartClick}>Add to Cart</button>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="section-heading-row">
          <h2 className="section-heading">You May Also Like</h2>
          {product && (
            <Link to={genreLink || categoryLink} className="view-all-btn">View All →</Link>
          )}
        </div>

        <div className="related-carousel-wrapper">
          {relatedProducts.length > 0 && (
            <>
              <button className="carousel-arrow left" onClick={() => carouselRef.current.scrollBy({ left: -300, behavior: "smooth" })}>
                &#10094;
              </button>
              <button className="carousel-arrow right" onClick={() => carouselRef.current.scrollBy({ left: 300, behavior: "smooth" })}>
                &#10095;
              </button>
            </>
          )}
          <div className="related-carousel" ref={carouselRef}>
            {relatedProducts.map((item) => (
              <div key={item._id} className="related-card">
                <Link to={`/product/${item.slug}`} className="related-link">
                  <img src={normalizeImagePath(item.image)} alt={item.name} className="related-img" />
                  <div className="related-info">
                    <p className="related-title">{item.name}</p>
                    <p className="related-price">₱{item.price.toFixed(2)}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ Quantity Prompt Modal */}
        {showQuantityPrompt && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Select Quantity</h3>
              <input
                type="number"
                min="1"
                max={product.countInStock}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
              <div className="modal-buttons">
                <button onClick={confirmAddToCart}>Confirm</button>
                <button onClick={() => setShowQuantityPrompt(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Confirmation Modal */}
        {showConfirmation && (
          <div className="confirmation-modal">
            ✅ {product.name} added to cart!
          </div>
        )}

        <hr className="bottom-line" />
      </div>
    </div>
  );
};

export default ProductPage;
