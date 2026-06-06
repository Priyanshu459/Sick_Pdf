'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RazorpayButton({ email, name }: { email: string, name: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const loadRazorpayScript = () => new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) throw new Error("Razorpay SDK failed to load. Are you online?");

      // 1. Get Order ID from our Next.js backend
      const res = await fetch('/api/razorpay/order', { method: 'POST' });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      // 2. Initialize Razorpay popup
      const options = {
        key: data.keyId, // Fetched securely from backend at runtime!
        amount: "49900",
        currency: "INR",
        name: "PDF Master",
        description: "1-Month Premium Pass",
        order_id: data.orderId,
        handler: async function (response: any) {
          // 3. Send signature to our backend to verify securely
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            router.refresh(); // Reload the page to remove the premium lock!
          } else {
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: name,
          email: email
        },
        theme: {
          color: "#4f46e5" // Indigo primary color
        }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any){
        alert(response.error.description);
      });
      rzp1.open();
    } catch (error: any) {
      alert("Error initiating payment: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayment} 
      disabled={isLoading}
      style={{
        background: 'var(--primary-color, #4f46e5)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '1rem 2rem',
        fontSize: '1.1rem',
        fontWeight: 600,
        cursor: isLoading ? 'wait' : 'pointer',
        marginTop: '1rem',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '250px'
      }}
    >
      {isLoading ? 'Loading Secure Checkout...' : 'Upgrade to Premium (₹499)'}
    </button>
  );
}
