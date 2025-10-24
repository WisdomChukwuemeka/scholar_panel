"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PaymentAPI } from "@/app/services/api";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function PaystackCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const reference = searchParams.get("reference");
    if (reference) {
      const verifyPayment = async () => {
        try {
          const response = await PaymentAPI.verifyPayment(reference);
          if (response.data.payment.status === "success") {
            setSuccess(true);

            // 🕔 Delay 5 seconds before redirect
            setTimeout(() => {
              const publicationId = response.data.payment.metadata.publication_id;
              router.push(`/publications/${publicationId}`);
            }, 5000);
          } else {
            setError("Payment verification failed.");
            setLoading(false);
          }
        } catch (err) {
          setError(err.response?.data?.detail || "Payment verification failed.");
          setLoading(false);
        } finally {
          setLoading(false);
        }
      };
      verifyPayment();
    } else {
      setError("No payment reference provided.");
      setLoading(false);
    }
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 text-center"
      >
        {/* Loading State */}
        {loading && !success && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center space-y-4"
          >
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-800">
              Processing Payment
            </h2>
            <p className="text-gray-500">
              Please wait while we verify your transaction...
            </p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center space-y-5"
          >
            <XCircle className="w-14 h-14 text-red-500" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Verification Failed
            </h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => router.push("/payments/history")}
              className="mt-6 bg-red-500 hover:bg-red-600 text-white font-medium px-5 py-2.5 rounded-lg shadow transition-all duration-200"
            >
              Go to Payment History
            </button>
          </motion.div>
        )}

        {/* Success State with Book Animation */}
        {success && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center space-y-5"
          >
            <CheckCircle className="w-14 h-14 text-green-500" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Redirecting you to your publication page...
            </p>

            {/* 📖 Animated book */}
            <motion.div
              className="relative w-full h-40 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="text-6xl"
                initial={{ x: "-100vw", rotateY: 0 }}
                animate={[
                  { x: "0vw", rotateY: 0, transition: { duration: 2, ease: "easeInOut" } },
                  { rotateY: 180, transition: { duration: 1.5, ease: "easeInOut", delay: 2 } },
                ]}
              >
                📖
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Footer */}
      <p className="text-gray-400 text-sm mt-6">
        Powered by <span className="font-semibold text-indigo-600">Paystack</span>
      </p>
    </div>
  );
}
