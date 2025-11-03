'use client';

import { useState, useEffect } from 'react';
import Upload from '../components/Upload';

const ManageCategory = () => {
  const [img, setImg] = useState([]);
  const [message, setMessage] = useState('');
  const fixedId = '68fd040cabb7b644763f8bf8'; // fixed ID for patch

  // Fetch the existing banner (optional - just to preview current image)
  const [banner, setBanner] = useState(null);
  const fetchBanner = async () => {
    try {
      const res = await fetch('/api/banner2', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        const found = data.find((item) => item.id === fixedId);
        setBanner(found || null);
      } else {
        console.error('Failed to fetch banners');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchBanner();
  }, []);

  // Handle update (PATCH only)
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/banner2?id=${encodeURIComponent(fixedId)}`, {
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

  const handleImgChange = (url) => {
    if (url) {
      setImg(url);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Edit Banner</h1>

      <form onSubmit={handleEditSubmit} className="space-y-4 text-center">
        <Upload onFilesUpload={handleImgChange} />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Update Banner
        </button>
      </form>

      {message && <p className="mt-4 text-center">{message}</p>}

      {banner && (
        <div className="mt-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Current Banner</h2>
          {banner.img && banner.img.length > 0 && (
            <>
              {/\.(mp4|webm|ogg)$/i.test(banner.img[0]) ? (
                <video controls className="mx-auto w-48 h-auto">
                  <source src={banner.img[0]} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img src={banner.img[0]} alt="Banner" className="mx-auto w-48 h-auto" />
              )}
            </>
          )}
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .uploadcare--widget {
              background: black;
            }
          `,
        }}
      />
    </div>
  );
};

export default ManageCategory;
