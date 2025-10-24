// frontend/components/PaymentHistory.jsx
import React, { useState, useEffect } from 'react';
import { PaymentAPI } from '@/app/services/api';
import { useRouter } from 'next/router';

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await PaymentAPI.getPaymentHistory();
        setPayments(response.data);
      } catch (err) {
        setError('Failed to load payment history.');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const handleViewDetails = (reference) => {
    router.push(`/payments/${reference}`);
  };

  const handleRequestRefund = async (reference) => {
    try {
      await PaymentAPI.requestRefund({ reference });
      alert('Refund request submitted successfully.');
      // Refresh payment history
      const response = await PaymentAPI.getPaymentHistory();
      setPayments(response.data);
    } catch (err) {
      setError('Failed to request refund.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Payment History</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : payments.length === 0 ? (
        <p>No payments found.</p>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.reference} className="border p-4 rounded-md">
              <p><strong>Reference:</strong> {payment.reference}</p>
              <p><strong>Amount:</strong> ₦{payment.amount}</p>
              <p><strong>Type:</strong> {payment.payment_type}</p>
              <p><strong>Status:</strong> {payment.status}</p>
              <p><strong>Date:</strong> {new Date(payment.created_at).toLocaleString()}</p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => handleViewDetails(payment.reference)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  View Details
                </button>
                {payment.status === 'success' && (
                  <button
                    onClick={() => handleRequestRefund(payment.reference)}
                    className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                  >
                    Request Refund
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}