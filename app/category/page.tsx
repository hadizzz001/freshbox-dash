'use client';

import { useState, useEffect } from 'react';
import Upload from '../components/Upload';
import { useRouter } from 'next/navigation';

const ManageCategory = () => {
  const [formData, setFormData] = useState({ name: '', img: [] });
  const [editFormData, setEditFormData] = useState({ id: '', name: '', img: [] });
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [img, setImg] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/category');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add category
  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/category', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setMessage('Category added successfully!');
      setFormData({ name: '', img: [] });
      fetchCategories();
      router.refresh();
    } else {
      const errorData = await res.json();
      setMessage(`Error: ${errorData.error}`);
    }
  };

  // Edit category
  const handleEdit = (category) => {
    setEditMode(true);
    setEditFormData({
      id: category.id,
      name: category.name,
      img: category.img,
    });
    setImg(category.img);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/category?id=${encodeURIComponent(editFormData.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editFormData.name,
          img: img,
        }),
      });

      if (res.ok) {
        setEditFormData({ id: '', name: '', img: [] });
        setEditMode(false);
        fetchCategories();
        router.refresh();
      } else {
        const errorData = await res.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred while updating the category.');
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (confirm(`Are you sure you want to delete this category?`)) {
      try {
        const res = await fetch(`/api/category?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setMessage('Category deleted successfully!');
          fetchCategories();
          router.refresh();
        } else {
          const errorData = await res.json();
          setMessage(`Error: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  // Handle image upload
  const handleImgChange = (url) => {
    if (url) setImg(url);
  };

  useEffect(() => {
    if (!img.includes('')) {
      setFormData((prev) => ({ ...prev, img }));
    }
  }, [img]);

 

  return (
    <div className="container mx-auto p-4 text-[13px]">
      <h1 className="text-2xl font-bold mb-4">{editMode ? 'Edit Category' : 'Add Category'}</h1>

      {/* ADD / EDIT FORM */}
      <form onSubmit={editMode ? handleEditSubmit : handleSubmit} className="mb-8 space-y-4">
        <input
          type="text"
          placeholder="Category Name"
          value={editMode ? editFormData.name : formData.name}
          onChange={(e) =>
            editMode
              ? setEditFormData({ ...editFormData, name: e.target.value })
              : setFormData({ ...formData, name: e.target.value })
          }
          required
          className="border p-2 w-full"
        />

        <Upload onFilesUpload={handleImgChange} />

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {editMode ? 'Update Category' : 'Add Category'}
        </button>
        {editMode && (
          <button
            type="button"
            onClick={() => {
              setEditMode(false);
              setEditFormData({ id: '', name: '', img: [] });
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
          >
            Cancel
          </button>
        )}
      </form>

 

      {/* CATEGORY TABLE */}
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Image</th>
            <th className="border p-2 text-left">Name</th> 
            <th className="border p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="border p-2">
                {category.img && category.img.length > 0 ? (
                  <img
                    src={category.img[0]}
                    alt={category.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  '—'
                )}
              </td>
              <td className="border p-2">{category.name}</td>

 

              <td className="border p-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
};

export default ManageCategory;
