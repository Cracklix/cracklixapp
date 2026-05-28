import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { db } from "@/lib/firebase-admin";

/**
 * Dynamic Order Creation Logic
 * Fetches keys from Firestore Settings instead of ENV vars for better flexibility.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Fetch Dynamic Credentials from Firestore Settings
    const settingsSnap = await db.collection('settings').doc('payment').get();
    
    if (!settingsSnap.exists) {
      throw new Error("Payment gateway not configured in Admin Settings.");
    }
    
    const settings = settingsSnap.data() as any;
    
    // 2. Initialize Gateway
    const razorpay = new Razorpay({
      key_id: settings.keyId,
      key_secret: settings.secret,
    });

    const options = {
      amount: Math.round(body.amount * 100), // amount in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Order Creation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
