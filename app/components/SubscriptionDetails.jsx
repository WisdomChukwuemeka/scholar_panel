// frontend/components/SubscriptionDetails.jsx
import React, { useState, useEffect } from 'react';
import { PaymentAPI } from '@/app/services/api';

export default function SubscriptionDetails() {
  const [subscription, setSubscription] = useState(null);
  const [freeReviewStatus, setFreeReviewStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const [subResponse, reviewResponse] = await Promise.all([
          PaymentAPI.getSubscriptionDetails(),
          PaymentAPI.getFreeReviewStatus(),
        ]);
        setSubscription(subResponse.data);
        setFreeReviewStatus(reviewResponse.data);
      } catch (err) {
        setError('Failed to load subscription details.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 font-serif bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Subscription Details</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : !subscription ? (
        <p>Subscription not found.</p>
      ) : (
        <div className="space-y-2">
          <p><strong>User:</strong> {subscription.user}</p>
          <p><strong>Free Reviews Used:</strong> {subscription.free_reviews_used}</p>
          <p><strong>Free Reviews Granted:</strong> {freeReviewStatus.free_reviews_granted ? 'Yes' : 'No'}</p>
          <p><strong>Free Reviews Available:</strong> {freeReviewStatus.has_free_review_available ? 'Yes' : 'No'}</p>
          {freeReviewStatus.has_free_review_available && (
            <p><strong>Available Free Reviews:</strong> {2 - freeReviewStatus.free_reviews_used}</p>
          )}
        </div>
      )}
    </div>
  );
}