import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { CATEGORIES } from '../../data/categories';
import './AdminDashboard.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com';

const ProductManagement = () => {
  const { user } = useUser();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    name:'', subtitle:'', description:'', price:'', discountPrice:'', discountStart:'',
    discountEnd:'', category:'', subcategory:'', image:null, images:[], author:'',
    publisher:'', isbn:'', publishedDate:'', language:'', pages:'', format:'',
    edition:'', sku:'', supplier:'', reorderLevel:'', countInStock:'', slug:'',
    metaTitle:'', metaDescription:''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [galleryPreview, setGalleryPreview] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [tableKey, setTableKey] = useState(0);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/products`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      setProducts(data);
      setTableKey(prev => prev+1);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  const handleInputChange = e => {
    const { name, value, files } = e.target;
    if(name === 'image' && files.length>0){
      setFormData({...formData, [name]: files[0]});
      const reader = new FileReader();
      reader.onloadend = ()=> setImagePreview(reader.result);
      reader.readAsDataURL(files[0]);
    } else if(name === 'images' && files.length>0){
      setFormData({...formData, [name]: files});
      const previews = Array.from(files).map(f=>URL.createObjectURL(f));
      setGalleryPreview(previews);
    } else setFormData({...formData, [name]: value});
  };

  const handleSubmit = async e=>{
    e.preventDefault();
    try{
      const url = isEditing ? `${API_URL}/api/admin/products/${currentProduct._id}` : `${API_URL}/api/admin/products`;
      const method = isEditing ? 'PUT' : 'POST';
      const data = new FormData();
      for(const key in formData){
        if(key==='images' && formData[key].length>0){
          Array.from(formData[key]).forEach(file=> data.append('images', file));
        } else if(key==='image' && formData[key] instanceof File){
          data.append('image', formData[key]);
        } else {
          data.append(key, formData[key]);
        }
      }
      const res = await fetch(url,{method,headers:{Authorization:`Bearer ${user.token}`},body:data});
      if(!res.ok) throw new Error('Failed to save');
      resetForm();
      fetchProducts();
    }catch(err){ console.error(err); }
  };

  const handleEdit = product=>{
    setCurrentProduct(product);
    setFormData({...product, image: product.image, images: product.images || []});
    setImagePreview(product.image);
    setGalleryPreview(product.images || []);
    setIsEditing(true);
  };

  const handleDelete = async id=>{
    if(!window.confirm('Delete product?')) return;
    try{
      const res = await fetch(`${API_URL}/api/admin/products/${id}`,{
        method:'DELETE', headers:{Authorization:`Bearer ${user.token}`}
      });
      if(!res.ok) throw new Error('Delete failed');
      fetchProducts();
    }catch(err){ console.error(err); }
  };

  const resetForm = ()=>{
    setFormData({
      name:'', subtitle:'', description:'', price:'', discountPrice:'', discountStart:'',
      discountEnd:'', category:'', subcategory:'', image:null, images:[], author:'',
      publisher:'', isbn:'', publishedDate:'', language:'', pages:'', format:'',
      edition:'', sku:'', supplier:'', reorderLevel:'', countInStock:'', slug:'',
      metaTitle:'', metaDescription:''
    });
    setImagePreview(null);
    setGalleryPreview([]);
    setCurrentProduct(null);
    setIsEditing(false);
  };

  if(loading) return <div>Loading...</div>;

  const selectedCategory = CATEGORIES.find(c=>c.slug===formData.category);
  const subcategories = selectedCategory?.subcategories || [];

  return (
    <div className="admin-container">
      <div className="product-form-container">
        <h2>{isEditing?'Edit Product':'Add New Product'}</h2>
        <form onSubmit={handleSubmit} className="product-form">

          <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Product Name" required/>
          <input type="text" name="subtitle" value={formData.subtitle} onChange={handleInputChange} placeholder="Subtitle"/>
          <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" required/>
          <input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} placeholder="Price" required/>
          <input type="number" step="0.01" name="discountPrice" value={formData.discountPrice} onChange={handleInputChange} placeholder="Discount Price"/>
          <input type="date" name="discountStart" value={formData.discountStart} onChange={handleInputChange}/>
          <input type="date" name="discountEnd" value={formData.discountEnd} onChange={handleInputChange}/>

          <input type="text" name="author" value={formData.author} onChange={handleInputChange} placeholder="Author"/>
          <input type="text" name="publisher" value={formData.publisher} onChange={handleInputChange} placeholder="Publisher"/>
          <input type="text" name="isbn" value={formData.isbn} onChange={handleInputChange} placeholder="ISBN"/>
          <input type="date" name="publishedDate" value={formData.publishedDate?.slice(0,10)} onChange={handleInputChange}/>
          <input type="text" name="language" value={formData.language} onChange={handleInputChange} placeholder="Language"/>
          <input type="number" name="pages" value={formData.pages} onChange={handleInputChange} placeholder="Pages"/>
          <select name="format" value={formData.format} onChange={handleInputChange}>
            <option value="">Select Format</option>
            <option value="Paperback">Paperback</option>
            <option value="Hardcover">Hardcover</option>
            <option value="Ebook">Ebook</option>
          </select>
          <input type="text" name="edition" value={formData.edition} onChange={handleInputChange} placeholder="Edition"/>
          <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} placeholder="SKU"/>
          <input type="text" name="supplier" value={formData.supplier} onChange={handleInputChange} placeholder="Supplier"/>
          <input type="number" name="reorderLevel" value={formData.reorderLevel} onChange={handleInputChange} placeholder="Reorder Level"/>
          <input type="number" name="countInStock" value={formData.countInStock} onChange={handleInputChange} placeholder="Stock"/>

          <select name="category" value={formData.category} onChange={handleInputChange}>
            <option value="">Select Category</option>
            {CATEGORIES.map(c=><option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          <select name="subcategory" value={formData.subcategory} onChange={handleInputChange}>
            <option value="">Select Subcategory</option>
            {subcategories.map(s=><option key={s.slug} value={s.slug}>{s.name}</option>)}
          </select>

          <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} placeholder="Slug"/>
          <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleInputChange} placeholder="Meta Title"/>
          <input type="text" name="metaDescription" value={formData.metaDescription} onChange={handleInputChange} placeholder="Meta Description"/>

          <input type="file" name="image" onChange={handleInputChange} accept="image/*"/>
          {imagePreview && <img src={imagePreview} alt="Main Preview" style={{height:80, marginRight:10}}/>}
          <input type="file" name="images" onChange={handleInputChange} accept="image/*" multiple/>
          {galleryPreview.map((img,i)=><img key={i} src={img} alt="Gallery Preview" style={{height:50, marginRight:5}}/>)}

          <button type="submit">{isEditing?'Update Product':'Add Product'}</button>
          {isEditing && <button type="button" onClick={resetForm}>Cancel</button>}
        </form>
      </div>

      <div className="product-list-container">
        <h2>Products</h2>
        <table key={tableKey}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Author</th>
              <th>Price</th>
              <th>Stock</th>
              <th>SKU</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p=>(
              <tr key={p._id}>
                <td><img src={p.image} alt={p.name} style={{height:50}}/></td>
                <td>{p.name}</td>
                <td>{p.author}</td>
                <td>${p.price}</td>
                <td>{p.countInStock}</td>
                <td>{p.sku}</td>
                <td>
                  <button onClick={()=>handleEdit(p)}>Edit</button>
                  <button onClick={()=>handleDelete(p._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagement;
