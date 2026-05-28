
import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { response, plan, amount, userId, planId, duration } = body;

    // 1. Fetch Dynamic Webhook Secret for Verification
    const firestore = getFirestore();
    const settingsSnap = await firestore.collection('settings').doc('payment').get();
    const settings = settingsSnap.data() as any;

    // 2. Signature Verification
    const generated_signature = crypto
      .createHmac("sha256", settings.secret)
      .update(response.razorpay_order_id + "|" + response.razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== response.razorpay_signature) {
      return NextResponse.json({ success: false, error: "Invalid Signature" }, { status: 400 });
    }

    // 3. Record Payment
    await firestore.collection("payments").add({
      userId,
      paymentId: response.razorpay_payment_id,
      orderId: response.razorpay_order_id,
      plan,
      amount,
      status: "success",
      mode: settings.mode,
      createdAt: Date.now(),
    });

    // 4. Grant Premium Access
    const startDate = Date.now();
    const endDate = startDate + (duration * 24 * 60 * 60 * 1000);

    await firestore.collection("premiumAccess").doc(userId).set({
      status: "active",
      plan,
      planId,
      endDate,
      updatedAt: startDate,
    });

    // 5. Create Subscription Ledger Record
    await firestore.collection("subscriptions").add({
      userId,
      plan,
      planId,
      amount,
      status: "active",
      startDate,
      endDate,
      paymentId: response.razorpay_payment_id,
      createdAt: startDate,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Payment Verification Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
