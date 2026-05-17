import { useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaywallModal({ onSuccess, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handlePay = async () => {
    setError('');
    setLoading(true);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError('Payment script load nahi hua. Internet check karein.');
      setLoading(false);
      return;
    }

    let orderData;
    try {
      const res = await axios.post(`${API_BASE}/api/payment/create-order`);
      orderData = res.data;
    } catch {
      setError('Order create nahi hua. Dobara try karein.');
      setLoading(false);
      return;
    }

    const options = {
      key:      orderData.keyId,
      amount:   orderData.amount,
      currency: orderData.currency,
      name:     'ReportSamjho',
      description: 'Unlimited Report Analysis',
      order_id: orderData.orderId,
      theme:    { color: '#1D9E75' },
      handler: async (response) => {
        try {
          await axios.post(`${API_BASE}/api/payment/verify`, {
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
          });
          onSuccess();
        } catch {
          setError('Payment verify nahi hua. Support se contact karein.');
          setLoading(false);
        }
      },
      modal: { ondismiss: () => setLoading(false) },
    };

    new window.Razorpay(options).open();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 px-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 shadow-2xl">
        {/* Icon */}
        <div className="w-14 h-14 bg-[#e8f7f3] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-[#1D9E75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-900 text-center mb-1">
          3 Free Analyses Used
        </h2>
        <p className="text-gray-500 text-sm text-center mb-6">
          Aapne 3 free reports analyse kar li hain. Unlimited access ke liye ek baar payment karein.
        </p>

        {/* What you get */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-5 space-y-2">
          {[
            'Unlimited report analyses',
            'All 5 languages supported',
            'PDF + Image upload',
            'Doctor questions & diet tips',
          ].map((feat) => (
            <div key={feat} className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="w-4 h-4 text-[#1D9E75] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {feat}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 mb-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={loading}
          className={`w-full py-4 rounded-2xl font-bold text-lg text-white flex items-center justify-center gap-2 transition-all ${
            loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#1D9E75] hover:bg-[#178a64] active:scale-95 shadow-md'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <span className="text-xl">₹</span>
              Pay ₹99 — Unlock Unlimited
            </>
          )}
        </button>

        <button
          onClick={onClose}
          className="w-full mt-3 py-3 text-gray-400 text-sm hover:text-gray-600 transition-colors"
        >
          Abhi nahi
        </button>

        <p className="text-center text-xs text-gray-400 mt-2">
          Secure payment via Razorpay • One-time payment
        </p>
      </div>
    </div>
  );
}
