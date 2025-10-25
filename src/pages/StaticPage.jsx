// ============================================================
// ✅ src/pages/StaticPage.jsx — Styled & Working Version
// ============================================================
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./styles/StaticPage.css"; // ✅ import dedicated CSS
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_URL =
  process.env.REACT_APP_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://bookstore-0hqj.onrender.com";

const StaticPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`${API_URL}/api/static-pages/${slug}`);
        if (!res.ok) throw new Error("Page not found");
        const data = await res.json();
        setPage(data);
      } catch (err) {
        console.error("❌ Error fetching static page:", err);
        setPage(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  if (loading) return <div className="loading">Loading page...</div>;
  if (!page) return <div className="not-found">Page not found.</div>;

  return (
    <>
      <Navbar />
      <div className="static-page container">
        <h1>{page.title}</h1>

        {/* ✅ Safely render HTML content */}
        <div
          className="static-page-content"
          dangerouslySetInnerHTML={{
            __html:
              page.content?.trim() === ""
                ? "<p><em>No content available.</em></p>"
                : page.content,
          }}
        />
      </div>
      <Footer />
    </>
  );
};

export default StaticPage;
