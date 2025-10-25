// ============================================================
// ✅ src/pages/StaticPage.jsx
// ============================================================
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://bookstore-0hqj.onrender.com";

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
        setPage(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  if (loading) return <div>Loading page...</div>;
  if (!page) return <div>Page not found.</div>;

  return (
    <div className="static-page container">
      <h1>{page.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
};

export default StaticPage;
