// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { toast } from 'react-toastify';
// import { PaymentAPI, PublicationAPI } from '../services/api';
// import CreatePublication from '../publications/create/page';

// export default function SubscriptionGate({ publicationId = null }) {
//   const [subscription, setSubscription] = useState(null);
//   const [rejectionCount, setRejectionCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isResubmission, setIsResubmission] = useState(!!publicationId);
//   const router = useRouter();

//   // Fetch subscription status and rejection count
//   useEffect(() => {
//     async function fetchData() {
//       console.log('Fetching subscription data...');
//       try {
//         const { data: subData } = await PaymentAPI.getFreeReviewStatus();  // Fixed: Use getFreeReviewStatus
//         setSubscription(subData);

//         if (publicationId) {
//           const { data: pubData } = await PublicationAPI.getPublication(publicationId);
//           setRejectionCount(pubData.rejection_count || 0);
//           setIsResubmission(pubData.rejection_count > 0);
//         }
//         setLoading(false);
//       } catch (err) {
//         const errorMessage = err.response?.data?.error || 'Failed to load subscription status';
//         setError(errorMessage);
//         toast.error(errorMessage, { position: 'top-right' });
//         setLoading(false);
//       }
//     }
//     fetchData();
//   }, [publicationId]);

//   // Handle payment initiation
//   const handlePayment = async (paymentType) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const { data } = await PaymentAPI.initializePayment({
//         publication_id: publicationId || null,
//         payment_type: paymentType,
//       });
//       if (data.message === 'Free review used. No payment needed.') {
//         toast.info("🎉 You used a free review! Redirecting...");
//         router.push(`/publications/resubmit/${publicationId}`);
//       } else {
//         localStorage.setItem('paymentReference', data.reference);
//         localStorage.setItem('pendingPublicationId', publicationId || '');
//         window.location.href = data.authorization_url;
//       }
//     } catch (err) {
//       const errorMessage =
//         err.response?.data?.error ||
//         err.response?.data?.detail ||
//         Object.entries(err.response?.data || {})
//           .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
//           .join('; ') ||
//         err.message ||
//         'Payment initialization failed';
//       console.error('Payment error:', err.response?.data || err);
//       setError(errorMessage);
//       toast.error(errorMessage, { position: 'top-right' });
//       setLoading(false);
//     }
//   };

//   if (loading || !subscription) {
//     return (
//       <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg my-8">
//         <p>Loading subscription status...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg my-8">
//         <p className="text-red-500">Error: {error}</p>
//         <button
//           onClick={() => setError(null)}
//           className="mt-2 text-blue-600 underline"
//         >
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   // Check for review fee (if resubmission and no free reviews)
//   if (isResubmission && !subscription.has_free_review_available) {
//     return (
//       <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg my-8">
//         <h1 className="text-2xl font-semibold mb-6 text-center">Review Fee Required</h1>
//         <p className="mb-4">You have used your two free reviews. Please pay a ₦3,000 review fee to resubmit.</p>
//         <button
//           onClick={() => handlePayment('review_fee')}
//           disabled={loading}
//           className={`w-full p-2 rounded text-white font-medium ${
//             loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
//           } transition duration-300`}
//         >
//           {loading ? 'Processing...' : 'Pay ₦3,000'}
//         </button>
//       </div>
//     );
//   }

//   // Render the publication form (new submission or free review available)
//   return <CreatePublication publicationId={publicationId} />;
// }