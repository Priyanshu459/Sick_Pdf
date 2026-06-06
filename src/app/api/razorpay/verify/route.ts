import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      throw new Error('Server configuration error: Missing Razorpay Secret');
    }

    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(text)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      // Payment is successful, update user in MongoDB
      await dbConnect();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

      await User.findOneAndUpdate(
        { email: session.user.email },
        { premiumExpiresAt: expiresAt }
      );

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }
  } catch (err: any) {
    console.error('Razorpay Verify Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
