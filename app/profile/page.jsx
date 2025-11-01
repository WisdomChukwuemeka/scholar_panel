'use client';

import { useState, useEffect } from 'react';
import { ProfileAPI } from '../services/api'; // Adjust the import path as needed
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    institution: '',
    affiliation: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await ProfileAPI.list();
        const profiles = response.data;
        const ownProfile = profiles.length > 0 ? profiles[0] : null;
        if (ownProfile) {
          setProfile(ownProfile);
          setFormData({
            bio: ownProfile.bio || '',
            institution: ownProfile.institution || '',
            affiliation: ownProfile.affiliation || '',
          });
          setPreviewUrl(ownProfile.profile_image || null);
          setEditing(false);
        } else {
          setEditing(true);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        if (err.response && err.response.status === 404) {
          setEditing(true);
        } else {
          setError(err.response?.data?.detail || 'Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (selectedImage) {
      const objectUrl = URL.createObjectURL(selectedImage);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [selectedImage]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      setError(null); // Clear error after showing toast
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);

  try {
    const data = new FormData();
    data.append('bio', formData.bio);
    data.append('institution', formData.institution);
    data.append('affiliation', formData.affiliation);
    if (selectedImage) {
      data.append('profile_image', selectedImage);
    }

    let updatedProfile;
    if (profile) {
      updatedProfile = await ProfileAPI.update(profile.id, data);
    } else {
      updatedProfile = await ProfileAPI.create(data);
    }

    setProfile(updatedProfile.data);
    setEditing(false);
    setSelectedImage(null);
    setPreviewUrl(updatedProfile.data.profile_image || null);
    toast.success('Profile saved successfully');
    window.location.reload();
  } catch (err) {
    console.error('Error saving profile:', err);

    // Extract readable message
    let message = 'Failed to save profile';
    if (err.response?.data) {
      const data = err.response.data;
      if (typeof data === 'string') {
        message = data;
      } else if (data.detail) {
        message = data.detail;
      } else {
        message = Object.entries(data)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' | ');
      }
    }

    //  Move these inside the catch
    setError(message);
    toast.error(message);
  }
};



  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">My Profile</h1>
      {profile && !editing ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          {profile.profile_image && (
            <div className="mb-4 text-center">
              <img
                src={profile.profile_image}
                alt="Profile"
                className="w-32 h-32 rounded-full mx-auto object-cover"
              />
            </div>
          )}
          <div className="mb-4">
            <strong className="block text-gray-700">Bio:</strong>
            <p className="text-gray-900">{profile.bio || 'N/A'}</p>
          </div>
          <div className="mb-4">
            <strong className="block text-gray-700">Institution:</strong>
            <p className="text-gray-900">{profile.institution || 'N/A'}</p>
          </div>
          <div className="mb-4">
            <strong className="block text-gray-700">Affiliation:</strong>
            <p className="text-gray-900">{profile.affiliation || 'N/A'}</p>
          </div>
          <div className="mb-4">
            <strong className="block text-gray-700">Date Joined:</strong>
            <p className="text-gray-900">{new Date(profile.date_joined).toLocaleDateString()}</p>
          </div>
          <button 
            onClick={() => setEditing(true)} 
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
          {previewUrl && (
            <div className="mb-4 text-center">
              <img
                src={previewUrl}
                alt="Profile Preview"
                className="w-32 h-32 rounded-full mx-auto object-cover"
              />
            </div>
          )}
          <div>
            <label className="block text-gray-700 mb-2">Profile Image</label>
            <input
              type="file"
              name="profile_image"
              onChange={handleImageChange}
              accept="image/*"
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
              rows={4}
              placeholder="Enter your bio..."
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Institution</label>
            <input
              type="text"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
              placeholder="Enter your institution..."
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Affiliation</label>
            <input
              type="text"
              name="affiliation"
              value={formData.affiliation}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
              placeholder="Enter your affiliation..."
            />
          </div>
          <div className="flex justify-between">
            <button 
              type="submit" 
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              {profile ? 'Update Profile' : 'Create Profile'}
            </button>
            {profile && (
              <button 
                type="button" 
                onClick={() => {
                  setEditing(false);
                  setSelectedImage(null);
                  setPreviewUrl(profile.profile_image || null);
                }} 
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default ProfilePage;