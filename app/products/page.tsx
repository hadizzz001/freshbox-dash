'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import Upload from '../components/Upload';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function AddProduct() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [stock1, setStock1] = useState('');
  const [img, setImg] = useState(['']);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subcategoryOptions, setSubCategoryOptions] = useState([]);
  const [selectedsubCategory, setSelectedsubCategory] = useState('');
  const [factoryOptions, setFactoryOptions] = useState([]);
  const [selectedFactory, setSelectedFactory] = useState('');
  const [productType, setProductType] = useState('single');
  const [selectedColors, setSelectedColors] = useState([]);
  const [colorQuantities, setColorQuantities] = useState({});

  // OLD discount removed → replaced with per
  const [per, setPer] = useState('');

  // Cost fields
  const [cost, setCost] = useState('');
  const [costBox, setCostBox] = useState({ price: '', kg: '' });

  const availableColors = [
    "black", "white", "red", "yellow", "blue",
    "green", "orange", "purple", "brown", "gray", "pink"
  ];

// price after discount
const discountValue =
  per && price
    ? (Number(price) - (Number(price) * (Number(per) / 100))).toFixed(2)
    : null;


  const handleColorToggle = (color) => {
    setSelectedColors(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  // Fetch categories/subcategories/factories
  useEffect(() => {
    async function fetchData(endpoint, setter) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          setter(data);
        }
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
      }
    }
    fetchData('/api/category', setCategoryOptions);
    fetchData('/api/sub', setSubCategoryOptions);
    fetchData('/api/factory', setFactoryOptions);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (img.length === 1 && img[0] === '') {
      alert('Please choose at least 1 image');
      return;
    }

    if (productType === 'collection' && selectedColors.length === 0) {
      alert('Please select at least one color with a quantity.');
      return;
    }

    for (const color of selectedColors) {
      const qty = Number(colorQuantities[color]);
      if (isNaN(qty) || qty <= 0) {
        alert(`Please enter a valid quantity (greater than 0) for color "${color}".`);
        return;
      }
    }

    // FINAL PAYLOAD
const payload = {
  title,
  description,
  price: Number(price).toFixed(2),
  per: String(per),
  discount: discountValue,
  img,
  category: selectedCategory,
  sub: selectedsubCategory,
  factory: selectedFactory,
  type: productType,
  cost,
  costBox,
stock, 
  ...(productType === 'box' && { stock1 }),
};


    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Product added successfully!');
        window.location.href = '/dashboard';
      } else {
        alert('Failed to add product');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('An error occurred');
    }
  };

  const handleImgChange = (url) => {
    if (url) {
      setImg(url);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Add New Product</h1>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border p-2 mb-4"
        required
      />

      {/* Category & Sub-Category */}
      <label className="block text-lg font-bold mb-2">Category</label>
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="w-full border p-2 mb-4"
        required
      >
        <option value="" disabled>Select a category</option>
        {categoryOptions.map((category) => (
          <option key={category.id} value={category.name}>
            {category.name}
          </option>
        ))}
      </select>

      <label className="block text-lg font-bold mb-2">Sub-Category</label>
      <select
        value={selectedsubCategory}
        onChange={(e) => setSelectedsubCategory(e.target.value)}
        className="w-full border p-2 mb-4"
        required
      >
        <option value="" disabled>Select a Sub-Category</option>
        {subcategoryOptions.map((category) => (
          <option key={category.id} value={category.name}>
            {category.name}
          </option>
        ))}
      </select>

{/* Product Type */}
<div className="mb-4">
  <label className="block text-lg font-bold mb-2">Product Type</label>
  <div className="flex space-x-4">
    <label className="flex items-center space-x-2">
      <input
        type="radio"
        value="single"
        checked={productType === 'single'}
        onChange={() => setProductType('single')}
      />
      <span>Single</span>
    </label>

    <label className="flex items-center space-x-2">
      <input
        type="radio"
        value="box"
        checked={productType === 'box'}
        onChange={() => setProductType('box')}
      />
      <span>Box & Single</span>
    </label>
  </div>
</div>


      {/* Price */}
      <input
        type="number"
        step="0.01"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full border p-2 mb-4"
        required
      />

      {/* PERCENTAGE (per) */}
      <input
        type="number"
        placeholder="Discount %"
        value={per}
        onChange={(e) => setPer(e.target.value)}
        className="w-full border p-2 mb-2"
      />

      {/* DISCOUNT LABEL */}
      {discountValue && (
        <div className="mb-4 font-semibold">
          Discount Amount: {discountValue} $
        </div>
      )}

 
    <input
      type="number"
      placeholder="Grams Stock"
      value={stock}
      min={0}
      onChange={(e) => setStock(e.target.value)}
      className="w-full border p-2 mb-4"
      required
    />
 
 

{/* Show ONLY for BOX */}
{productType === 'box' && (
  <>
    {/* BOX STOCK */}
    <input
      type="text"
      placeholder="Box Stock"
      value={stock1}
      onChange={(e) => setStock1(e.target.value)}
      className="w-full border p-2 mb-4"
    />

    {/* COST BOX */}
    <div className="mb-4 border p-2 rounded">
      <h3 className="font-medium mb-2">Cost Box</h3>

      <input
        type="text"
        placeholder="Price"
        value={costBox.price}
        onChange={(e) => setCostBox(prev => ({ ...prev, price: e.target.value }))}
        className="w-full border p-2 mb-2"
      />

      <input
        type="text"
        placeholder="Kg"
        value={costBox.kg}
        onChange={(e) => setCostBox(prev => ({ ...prev, kg: e.target.value }))}
        className="w-full border p-2"
      />
    </div>
  </>
)}


      {/* Original Cost */}
      <input
        type="text"
        placeholder="Original Cost"
        value={cost}
        onChange={(e) => setCost(e.target.value)}
        className="w-full border p-2 mb-4"
      />

 
      {/* Description */}
      <label className="block text-lg font-bold mb-2">Description</label>
      <ReactQuill
        value={description}
        onChange={setDescription}
        className="mb-4"
        theme="snow"
        placeholder="Write your product description here..."
      />

      <Upload onFilesUpload={handleImgChange} />Max 12 images

      <br />

      <button type="submit" className="bg-green-500 text-white px-4 py-2 mt-4">
        Save Product
      </button>
    </form>
  );
}
