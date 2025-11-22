'use client';
import { useState, useEffect } from 'react';
import { ProfileAPI } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    institution: '',
    affiliation: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await ProfileAPI.list();
        const profiles = response.data.results || response.data;
        const ownProfile = profiles.length > 0 ? profiles[0] : null;
        setProfileImageFile(profiles);
        if (ownProfile) {
          setProfile(ownProfile);
          setFormData({
            name: ownProfile.name || '',
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
      setError(null);
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
      data.append('name', formData.name)
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
      setError(message);
      toast.error(message);
    }
  };

  if (loading) return <div className="text-center mt-10 text-gray-600">Loading...</div>;

  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white shadow-lg rounded-3xl w-full max-w-sm p-6 relative">
          {profile && !editing ? (
            <div className="text-center">
              {profile.profile_image && (
                <div className="flex justify-center">
                  <img
                    src={profile.profile_image}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover shadow-md border-4 border-white -mt-14 mb-3"
                  />
                </div>
              )}

              <section>
              <div className='flex flex-col gap-2'>

                <div>
                  <h2>Name</h2>
                    <h1 className="text-xl font-serif font-semibold text-gray-800">{profile.name || 'Unnamed User'}</h1>
                </div>
                
                <div>
                  <h2>Institution</h2>
                  <p className="text-gray-500 text-sm">{profile.institution || 'Unnamed Institution'}</p>
                </div>
                <div>
                  <h2>Affiliation</h2>
                  <p className="text-gray-500 text-sm">{profile.affiliation || 'No affiliation added'}</p>
                </div>
              </div>

             <div className="mt-4 text-gray-700 text-sm leading-relaxed px-2">
              <h2>Bio</h2>
              <div>
                {profile.bio || 'No bio available yet.'}
              </div>
              </div>
              </section>

              <button
                onClick={() => setEditing(true)}
                className="mt-6 w-full bg-gray-900 text-white py-2 rounded-xl hover:bg-gray-800 transition"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {previewUrl && (
                <div className="flex justify-center">
                  <img
                    src={previewUrl}
                    alt="Profile Preview"
                    className="w-32 h-32 rounded-full object-cover shadow-md border-4 border-white mx-auto -mt-10"
                  />
                </div>
              )}

              <div>
                <label className="block text-gray-600 text-sm mb-1">Profile Image</label>
                <input
                  type="file"
                  name="profile_image"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="w-full text-sm border border-gray-300 p-2 rounded-lg focus:outline-none focus:border-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-gray-500"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-gray-500"
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-1">Institution</label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-gray-500"
                  placeholder="Enter your institution..."
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-1">Affiliation</label>
                <input
                  type="text"
                  name="affiliation"
                  value={formData.affiliation}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-gray-500"
                  placeholder="Enter your affiliation..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gray-900 text-white py-2 rounded-xl hover:bg-gray-800 transition"
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
                    className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-xl hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
};

export default ProfilePage;
