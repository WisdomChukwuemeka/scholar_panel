'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PaymentAPI } from '@/app/services/api';

export default function PaymentSuccess() {
  const [status, setStatus] = useState('Verifying...');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    async function verify() {
      const reference = searchParams.get('reference') || localStorage.getItem('paymentReference');
      if (!reference) {
        setStatus('Error: Missing reference');
        toast.error('Missing payment reference', { position: 'top-right' });
        setTimeout(() => router.push('/'), 2000);
        return;
      }

      try {
        const { data } = await PaymentAPI.verifyPayment(reference);
        setStatus('Payment verified successfully!');
        toast.success('Payment verified successfully!', { position: 'top-right' });
        localStorage.removeItem('paymentReference');
        localStorage.removeItem('pendingPublicationId');
      } catch (err) {
        const errorMessage = err.response?.data?.error || 'Payment verification failed';
        setStatus(errorMessage);
        toast.error(errorMessage, { position: 'top-right' });
        localStorage.removeItem('paymentReference');
        localStorage.removeItem('pendingPublicationId');
        setTimeout(() => router.push('/'), 2000);
      }
    }
    verify();
  }, [searchParams, router]);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg my-8">
      <h1 className="text-2xl font-semibold mb-6 text-center">Payment Status</h1>
      <p>{status}</p>
      <ToastContainer />
    </div>
  );
}
