'use client';

/**
 * PRODUCTION RAZORPAY INTEGRATION SERVICE v16.0
 * Handles preparedness pass orchestration.
 */

export const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export async function processPassPayment({ 
  amount, 
  planName, 
  userId, 
  userEmail, 
  userName,
  onSuccess,
  onFailure
}: {
  amount: number;
  planName: string;
  userId: string;
  userEmail: string;
  userName: string;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}) {
  const isLoaded = await loadRazorpay();
  if (!isLoaded) {
    onFailure(new Error("Failed to load preparation gateway."));
    return;
  }

  // 1. Create order on server
  const orderRes = await fetch("/api/create-order", {
    method: "POST",
    body: JSON.stringify({ amount, userId, planName }),
  });
  const order = await orderRes.json();

  // 2. Open payment widget
  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || "rzp_test_placeholder",
    amount: amount * 100,
    currency: "INR",
    name: "CRACKLIX Preparation",
    description: `Preparation Pass: ${planName}`,
    order_id: order.id,
    handler: onSuccess,
    prefill: {
      name: userName,
      email: userEmail,
    },
    theme: {
      color: "#3b82f6",
    },
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.on("payment.failed", onFailure);
  rzp.open();
}
