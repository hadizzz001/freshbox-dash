'use client';

import { useState, useEffect } from 'react';
import Upload from '../components/Upload';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import ExportToExcel from '../components/ExportToExcel';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function ProductTable() {
  const [products, setProducts] = useState([]);
  const [products1, setProducts1] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');


  // Fetch products and categories on load
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);



  const fetchProducts = async () => {
    const response = await fetch('/api/products');
    if (response.ok) {
      const data = await response.json();
      setProducts(data);
    } else {
      console.error('Failed to fetch products');
    }
  };

  const fetchCategories = async () => {
    const response = await fetch('/api/category');
    if (response.ok) {
      const data = await response.json();
      setCategories(data);
    } else {
      console.error('Failed to fetch categories');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Product deleted successfully');
          fetchProducts();
        } else {
          console.error('Failed to delete product');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleUpdate = async (updatedProduct) => {
    try {
      const response = await fetch(`/api/products/${updatedProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });

      if (response.ok) {
        alert('Product updated successfully');
        setEditingProduct(null);
        fetchProducts();
      } else {
        console.error('Failed to update product');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Filter products by search query
  const filterBySearch = (product) => {
    return product.title.toLowerCase().includes(searchQuery.toLowerCase());
  };

  // Filter products by selected category
  const filterByCategory = (product) => {
    const isFilteredByCategory = selectedCategory ? product.category === selectedCategory : true;

    return isFilteredByCategory;
  };

  // Apply both search and category filters
  const filteredProducts = products.filter((product) => {
    return filterBySearch(product) && filterByCategory(product);
  });



 




  return (
    <div className="max-w-7xl mx-auto p-4 text-[12px]">
      {editingProduct && (
        <EditProductForm
          product={editingProduct}
          onCancel={() => setEditingProduct(null)}
          onSave={handleUpdate}
        />
      )}
      <h1 className="text-2xl font-bold mb-4">Product List</h1>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border p-2"
          placeholder="Search by title..."
        />
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full border p-2"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <ExportToExcel products={products} />

 



      <table className="table-auto w-full border-collapse border border-gray-200 mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Title</th>
            {/* <th className="border p-2">Pic</th> */}
            <th className="border p-2">Price (USD)</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Stock</th>
            <th className="border p-2">Colors & Qty</th> 
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredProducts.map((product) => {
            const fileUrl = product.img[0];
            const isVideo = /\.(mp4|webm|ogg)$/i.test(fileUrl);
            const isCollection = product.type === "collection";
            const isSingle = product.type === "single";

            // Stock Calculation Logic
            const isOutOfStockSingle = isSingle && (product.stock === "0" || product.stock === 0 || product.stock === null);

            const allColorsQtyZero = isCollection &&
              product.color &&
              product.color.length > 0 &&
              product.color.every(c => !c.sizes && parseInt(c.qty) === 0);

            const allSizesQtyZero = isCollection &&
              product.color &&
              product.color.length > 0 &&
              product.color.every(c =>
                Array.isArray(c.sizes) &&
                c.sizes.length > 0 &&
                c.sizes.every(s => parseInt(s.qty || 0) === 0)
              );

            let totalStock = 0;
            if (isSingle) {
              totalStock = parseInt(product.stock || 0);
            } else if (product.color && product.color.length > 0) {
              product.color.forEach(c => {
                if (Array.isArray(c.sizes) && c.sizes.length > 0) {
                  totalStock += c.sizes.reduce((sum, s) => sum + parseInt(s.qty || 0), 0);
                } else {
                  totalStock += parseInt(c.qty || 0);
                }
              });
            }

            const isLowStock = totalStock > 0 && totalStock < 3;

            let rowClass = "";
            if (isOutOfStockSingle || allColorsQtyZero || allSizesQtyZero) {
              rowClass = "bg-red-300";
            } else if (isLowStock) {
              rowClass = "bg-yellow-300";
            }





            return (
              <tr key={product.id} className={rowClass}>

                <td className="border p-2">{product.title}</td>
                {/* <td className="border p-2">
                  {isVideo ? (
                    <video controls className="w-24 h-auto">
                      <source src={fileUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img src={fileUrl} alt="Product" className="w-24 h-auto" />
                  )}
                </td> */}
<td className="border p-2">
  {product.discount && product.discount > 0 ? (
    <span>
      <span className="line-through text-red-600 mr-1">${product.price}</span>
      <span className="font-bold text-green-600">${product.discount}</span>
    </span>
  ) : (
    `$${product.price}`
  )}
</td>



                <td className="border p-2">{product.category}</td>
                <td className="border p-2">{product.type}</td>

                <td className="border p-2">
                  {product.type === 'single' && product.stock}

                  {product.type === 'collection' && product.color && !product.color[0]?.sizes &&
                    product.color.reduce((sum, c) => sum + (c.qty || 0), 0)
                  }

                  {product.type === 'collection' && product.color && product.color[0]?.sizes &&
                    product.color.reduce(
                      (colorSum, color) =>
                        colorSum +
                        (color.sizes
                          ? color.sizes.reduce((sizeSum, s) => sizeSum + (s.qty || 0), 0)
                          : 0),
                      0
                    )
                  }
                </td>

                <td className="border p-2">
                  {!isSingle && product.color && product.color.length > 0 ? (
                    <ul className="space-y-1">
                      {product.color.map((c, index) => (
                        <li key={index}>
                          <span className="font-semibold">{c.color}</span>
                          {c.sizes && Array.isArray(c.sizes) ? (
                            <ul className="ml-4 space-y-1 list-disc">
                              {c.sizes.map((s, idx) => (
                                <li key={idx}>
                                  <span className="italic">{s.size}</span>: {s.qty}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <>: {c.qty}</>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    isCollection ? 'No colors' : '—'
                  )}
                </td>

 




                <td className="border p-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-yellow-500 text-white px-2 py-1 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-500 text-white px-2 py-1"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>

      </table>


    </div>
  );
}




 
function EditProductForm({ product, onCancel, onSave }) {
  const [title, setTitle] = useState(product.title);
  const [stock, setStock] = useState(product.stock || "0");
  const [img, setImg] = useState(product.img || []);
  const [description, setDescription] = useState(product.description);
  const [type, setType] = useState(product.type || "collection");
  const [price, setPrice] = useState(product.price);
  const [discount, setDiscount] = useState(product.discount);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(product.category || "");
  const [categories1, setCategories1] = useState([]);
  const [selectedCategory1, setSelectedCategory1] = useState(product.sub || "");
  const [categories2, setCategories2] = useState([]);
  const [selectedCategory2, setSelectedCategory2] = useState(product.factory || "");

  const availableColors = ["black", "white", "red", "yellow", "blue", "green", "orange", "purple", "brown", "gray", "pink"];

const [selectedColors, setSelectedColors] = useState(() => {
  const initial = {};
  (product.color || []).forEach(c => {
    initial[c.color] = {
      qty: c.qty || 1,
    };
  });
  return initial;
});


  // Fetch category options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const categoriesRes = await fetch("/api/category");
        setCategories(await categoriesRes.json());
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const categoriesRes = await fetch("/api/sub");
        setCategories1(await categoriesRes.json());
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const categoriesRes = await fetch("/api/factory");
        setCategories2(await categoriesRes.json());
      } catch (error) {
        console.error("Error fetching factories:", error);
      }
    };
    fetchOptions();
  }, []);

const handleSubmit = (e) => {
  e.preventDefault();

  // ✅ NEW VALIDATION (no sizes anymore)
  if (type === "collection") {
    for (const [colorName, data] of Object.entries(selectedColors)) {
      if (!data.qty || data.qty <= 0) {
        alert(`Please enter a valid quantity (greater than 0) for color "${colorName}".`);
        return;
      }
    }
  }

  // Convert percentage discount to actual discounted price
  let finalDiscountPrice = price;
  if (price && discount) {
    const percentage = Number(discount);
    const numericPrice = Number(price);
    const discountedValue = numericPrice - (numericPrice * percentage / 100);
    finalDiscountPrice = discountedValue.toFixed(2);
  }

  onSave({
    ...product,
    title,
    description,
    price: Number(price).toFixed(2),
    discount: String(finalDiscountPrice),
    img,
    category: selectedCategory,
    sub: selectedCategory1,
    factory: selectedCategory2,
    type,
    ...(type === 'single' && { stock }),
    ...(type === 'collection' && {
      color: Object.entries(selectedColors).map(([colorName, data]) => ({
        color: colorName,
        qty: Number(data.qty),
      }))
    })
  });
};


const toggleColor = (color) => {
  setSelectedColors((prev) => {
    if (prev[color]) {
      const updated = { ...prev };
      delete updated[color];
      return updated;
    } else {
      return { ...prev, [color]: { qty: 1 } };
    }
  });
};


 const updateQty = (color, qty) => {
  setSelectedColors((prev) => ({
    ...prev,
    [color]: { qty },
  }));
};


  return (
    <form onSubmit={handleSubmit} className="text-[12px] border p-4 bg-gray-100 rounded">
      <h2 className="text-xl font-bold mb-4">Edit Product</h2>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2"
          required
        />
      </div>



      {/* Category Selects */}
      <select className="w-full p-2 border mb-2" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required>
        <option value="">Select Category</option>
        {categories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
      </select>

      <select className="w-full p-2 border mb-2" value={selectedCategory1} onChange={(e) => setSelectedCategory1(e.target.value)} required>
        <option value="">Select Sub-Category</option>
        {categories1.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
      </select>

      <select className="w-full p-2 border mb-2" value={selectedCategory2} onChange={(e) => setSelectedCategory2(e.target.value)} required>
        <option value="">Select Factory</option>
        {categories2.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
      </select>

      {/* Product Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="type" value="single" checked={type === "single"} onChange={() => setType("single")} />
            Single
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="type" value="collection" checked={type === "collection"} onChange={() => setType("collection")} />
            Collection
          </label>
        </div>
      </div>

                  <div className="mt-4">
              <label className="text-sm font-bold">Price</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border p-2 mb-2" />
            </div>

            <div className="mt-4">
              <label className="text-sm font-bold">Discount %</label>
              <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-full border p-2 mb-2" />
            </div>

      {/* Price, Discount, Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {type === "single" && (
          <>


            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full border p-2" required />
            </div>
          </>
        )}
      </div>

{type === "collection" && (
  <div className="mb-6">
    <label className="block text-lg font-bold mb-2">Choose Colors</label>
    <div className="flex flex-col gap-4">
      {availableColors.map((color) => {
        const isSelected = selectedColors[color];

        return (
          <div key={color} className="p-3 border rounded-md">
            <div className="flex items-center space-x-2 mb-2">
              <div
                className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
                  isSelected ? "ring-2 ring-offset-2 ring-black" : ""
                }`}
                style={{ backgroundColor: color }}
                onClick={() => toggleColor(color)}
              ></div>
              <span className="capitalize font-medium">{color}</span>
            </div>

            {isSelected && (
              <div className="ml-6 space-y-2">
                <label className="font-semibold text-sm">Qty</label>
                <input
                  type="number"
                  value={selectedColors[color].qty}
                  onChange={(e) => updateQty(color, e.target.value)}
                  className="border px-2 py-1 w-24"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
)}


      {/* Description */}
      <label className="block text-lg font-bold mb-2">Description</label>
      <ReactQuill value={description} onChange={setDescription} className="mb-4" theme="snow" placeholder="Write your product description here..." />

      {/* Image Upload */}
      <Upload onFilesUpload={(url) => setImg(url)} />

      {/* Buttons */}
      <div className="flex gap-2 mt-4">
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Save</button>
        <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
      </div>
    </form>
  );
}

 