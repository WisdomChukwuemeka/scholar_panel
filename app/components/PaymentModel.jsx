// frontend/components/PaymentModal.jsx
import React, { useState, useEffect } from 'react';
import { PaymentAPI } from '@/app/services/api';

export default function PaymentModal({ publicationId, paymentType, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authorizationUrl, setAuthorizationUrl] = useState('');
  const [reference, setReference] = useState('');

  useEffect(() => {
  const initializePayment = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = { publication_id: publicationId || null, payment_type: paymentType };
      console.log('Sending payment initialization payload:', payload);
      const response = await PaymentAPI.initializePayment(payload);
      console.log('Payment initialization response:', response.data);
      setAuthorizationUrl(response.data.authorization_url);
      setReference(response.data.reference);
    } catch (err) {
      const errorMessage = err.response?.data?.detail ||
                          err.response?.data?.publication_id?.[0] ||
                          err.message ||
                          'Failed to initialize payment.';
      console.error('Payment initialization error:', err.response?.data || err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  initializePayment();
}, [publicationId, paymentType]);

  const handleRedirect = () => {
    if (authorizationUrl) {
      window.location.href = authorizationUrl;
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('reference');
    if (ref && ref === reference) {
      const verifyPayment = async () => {
        try {
          await onSuccess(ref);
        } catch (err) {
          setError('Payment verification failed.');
        }
      };
      verifyPayment();
    }
  }, [reference, onSuccess]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Payment for {paymentType === 'publication_fee' ? 'Publication' : 'Review'}</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {loading ? (
          <p className="text-gray-600">Initializing payment...</p>
        ) : authorizationUrl ? (
          <div>
            <p className="text-gray-600 mb-4">
              Click below to proceed with the payment of{' '}
              {paymentType === 'publication_fee' ? '₦25,000' : '₦3,000'}.
            </p>
            <button
              onClick={handleRedirect}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              Proceed to Payment
            </button>
          </div>
        ) : (
          <p className="text-gray-600">Unable to load payment gateway.</p>
        )}
        <button
          onClick={onClose}
          className="mt-4 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}