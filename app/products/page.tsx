"use client";

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
  const [discount, setDiscount] = useState('');







  const availableColors = ["black", "white", "red", "yellow", "blue", "green", "orange", "purple", "brown", "gray", "pink"];

  const handleColorToggle = (color) => {
    setSelectedColors(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };


  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(`/api/category`);
        if (response.ok) {
          const data = await response.json();
          setCategoryOptions(data);
          setSelectedCategory('');
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(`/api/sub`);
        if (response.ok) {
          const data = await response.json();
          setSubCategoryOptions(data);
          setSelectedsubCategory('');
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(`/api/factory`);
        if (response.ok) {
          const data = await response.json();
          setFactoryOptions(data);
          setSelectedFactory('');
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
    fetchCategories();
  }, []);




  const handleSubmit = async (e) => {
    e.preventDefault();

    if (img.length === 1 && img[0] === '') {
      alert('Please choose at least 1 image');
      return;
    }

    // Validate color quantities if collection
    if (productType === 'collection') {
      if (selectedColors.length === 0) {
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

    }



    const payload = {
      title,
      description,
      price: Number(price).toFixed(2),
    discount: discount
  ? ((Number(price) * Number(discount)) / 100).toFixed(2)
  : null,

      img,
      category: selectedCategory, 
      sub: selectedsubCategory, 
      factory: selectedFactory, 
      type: productType,
      ...(productType === 'single' && { stock }),
...(productType === "collection" && {
  color: selectedColors.map((color) => ({
    color,
    qty: Number(colorQuantities[color]),
  })),
})


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




      {/* Category Selection */}
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
      
      <label className="block text-lg font-bold mb-2">Brand</label>
      <select
        value={selectedFactory}
        onChange={(e) => setSelectedFactory(e.target.value)}
        className="w-full border p-2 mb-4"
        required
      >
        <option value="" disabled>Select a Brand</option>
        {factoryOptions.map((category) => (
          <option key={category.id} value={category.name}>
            {category.name}
          </option>
        ))}
      </select>



 






      




 
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
            <span>1 Item</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="collection"
              checked={productType === 'collection'}
              onChange={() => setProductType('collection')}
            />
            <span>Collection</span>
          </label>
        </div>
      </div>


                    <input
        type="number"
        step="0.01"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full border p-2 mb-4"
        required
      /> 




        <input
  type="number"
  step="0.01"
  placeholder="Discounted %"
  value={discount}
  onChange={(e) => setDiscount(e.target.value)}
  className="w-full border p-2 mb-4"
/>

      {/* Stock Input (only for 1 item) */}
      {productType === 'single' && (
        <>


        <input
          type="number"
          placeholder="Stock"
          value={stock}
          min={0}
          onChange={(e) => setStock(e.target.value)}
          className="w-full border p-2 mb-4"
          required
        />
        </>
      )}

{productType === 'collection' && (
  <div className="mb-4">
    <label className="block text-lg font-bold mb-2">Choose Colors</label>
    <div className="flex flex-col gap-4">
      {availableColors.map((color) => (
        <div key={color} className="p-2 border rounded-md">
          <div className="flex items-center space-x-2 mb-2">
            <div
              className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
                selectedColors.includes(color) ? "ring-2 ring-offset-2" : ""
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorToggle(color)}
            ></div>

            <span className="capitalize font-medium">{color}</span>

            {selectedColors.includes(color) && (
              <>
                {/* QTY input only */}
                <input
                  type="number"
                  placeholder="Qty"
                  min={1}
                  value={colorQuantities[color] || ""}
                  onChange={(e) =>
                    setColorQuantities((prev) => ({
                      ...prev,
                      [color]: e.target.value,
                    }))
                  }
                  className="border px-2 py-1 w-24 ml-4"
                />
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
)}



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

      <button type="submit" className="bg-green-500 text-white px-4 py-2">
        Save Product
      </button>
    </form>
  );
}
