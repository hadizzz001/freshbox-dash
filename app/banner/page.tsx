'use client';

import { useState, useEffect } from 'react';
import Upload from '../components/Upload';

const ManageCategory = () => {
  const [img, setImg] = useState([]);
  const [message, setMessage] = useState('');

  // Fixed ID
  const bannerId = '68fcd8b821e83092245e1485';

  // Fetch current banner to show
  const [banner, setBanner] = useState(null);

  const fetchBanner = async () => {
    try {
      const res = await fetch('/api/banner', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        const found = data.find((b) => b.id === bannerId);
        setBanner(found);
      } else {
        console.error('Failed to fetch banner');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchBanner();
  }, []);

  // Handle image change
  const handleImgChange = (url) => {
    if (url) setImg(url);
  };

  // Submit patch update for this specific ID
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/banner?id=${bannerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ img }),
      });

      if (res.ok) {
        setMessage('Banner updated successfully!');
        fetchBanner();
      } else {
        const errorData = await res.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred while updating the banner.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Update Banner</h1>

      <form onSubmit={handleEditSubmit} className="space-y-4">
        <Upload onFilesUpload={handleImgChange} />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          Update Banner
        </button>
      </form>

      {message && <p className="mt-4">{message}</p>}

      {banner && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">Current Banner</h2>
          {banner.img && banner.img.length > 0 ? (
            /\.(mp4|webm|ogg)$/i.test(banner.img[0]) ? (
              <video controls className="w-40">
                <source src={banner.img[0]} type="video/mp4" />
              </video>
            ) : (
              <img src={banner.img[0]} alt="Banner" className="w-40 h-auto" />
            )
          ) : (
            <p>No image found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageCategory;
