"use client";

// frontend/components/PaymentHistory.jsx
import React, { useState, useEffect } from "react";
import { PaymentAPI } from "@/app/services/api";
// import { useRouter } from 'next/router';

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // const router = useRouter();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await PaymentAPI.getPaymentHistory();
        setPayments(response.data.results);
        console.log(response.data.results);
      } catch (err) {
        setError("Failed to load payment history.");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // const handleViewDetails = (reference) => {
  //   router.push(`/payments/${reference}`);
  // };

  // const handleRequestRefund = async (reference) => {
  //   try {
  //     await PaymentAPI.requestRefund({ reference });
  //     alert('Refund request submitted successfully.');
  //     // Refresh payment history
  //     const response = await PaymentAPI.getPaymentHistory();
  //     setPayments(response.data);
  //   } catch (err) {
  //     setError('Failed to request refund.');
  //   }
  // };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Payment History</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : payments.length === 0 ? (
        <p>No payments found.</p>
      ) : (
        <table className="w-full border-collapse border border-blue-300 text-sm">
          <thead className="bg-blue-100">
            <tr>
              <th className="border border-blue-300 p-2">Type</th>
              <th className="border border-blue-300 p-2">Amount</th>
              <th className="border border-blue-300 p-2">Status</th>
              <th className="border border-blue-300 p-2">Date</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            {payments
              .filter((p) => p.status === "success")
              .map((p) => (
                <tr
                  key={p.reference} // Use reference instead of id
                  className={
                    p.status === "success"
                      ? "bg-green-50"
                      : p.status === "pending"
                      ? "bg-yellow-50"
                      : "bg-red-50"
                  }
                >
                  <td className="border border-blue-300 p-2">
                    {p.payment_type}
                  </td>
                  <td className="border border-blue-300 p-2 text-right font-medium">
                    ₦{p.amount.toLocaleString()}
                  </td>
                  <td className="border border-blue-300 p-2 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        p.status === "success"
                          ? "bg-green-200 text-green-800"
                          : p.status === "pending"
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="border border-blue-300 p-2 text-xs">
                    {new Date(p.created_at).toLocaleString()}
                  </td>
                  <td className="border border-blue-300 p-2">{p.reference}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
