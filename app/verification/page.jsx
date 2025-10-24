"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PasscodeAPI } from '../services/api'; // Adjust path to your API file
import { toast, ToastContainer } from 'react-toastify';

const VerifyPasscodeForm = () => {
  const [data, setData] = useState({
    role: 'editor',
    code: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await PasscodeAPI.verify(data);
        toast.success(response.data.message || 'Passcode verified successfully!');
      console.log(response.data)
      router.push("/login")
    } catch (error) {
      toast.error(error.response?.data?.code || error.response?.data?.non_field_errors || 'Invalid passcode.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Verify Passcode</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={data.role}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="admin">Admin</option>
            <option value="publisher">Publisher</option>
            <option value="editor">Editor</option>
            <option value="participant">Participant</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="code" className="block text-sm font-medium text-gray-700">
            Passcode
          </label>
          <input
            id="code"
            name="code"
            type="text"
            value={data.code}
            onChange={handleChange}
            placeholder="Enter passcode"
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md text-white ${
            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Verifying...' : 'Verify Passcode'}
        </button>
      </form>
    </div>

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />

    </>
  );
};

export default VerifyPasscodeForm;