
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { response, plan, amount, userId } = body;

    // 1. Record Payment
    await addDoc(collection(db, "payments"), {
      userId,
      paymentId: response.razorpay_payment_id,
      orderId: response.razorpay_order_id,
      plan,
      amount,
      status: "success",
      createdAt: Date.now(),
    });

    // 2. Grant Premium Access
    const durationDays = plan === "Monthly" ? 30 : plan === "Quarterly" ? 90 : 365;
    const startDate = Date.now();
    const endDate = startDate + (durationDays * 24 * 60 * 60 * 1000);

    await setDoc(doc(db, "premiumAccess", userId), {
      status: "active",
      plan,
      endDate,
      updatedAt: startDate,
    });

    // 3. Create Subscription Record
    await addDoc(collection(db, "subscriptions"), {
      userId,
      plan,
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
