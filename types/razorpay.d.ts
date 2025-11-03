// Keep this file as a module to allow global augmentation
export {};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayInstance {
  open: () => void;
  close?: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

export interface RazorpayOptions {
  key: string;
  amount: number;          // paise for INR
  currency: string;        // e.g. "INR"
  order_id: string;        // from your server
  name?: string;
  description?: string;
  image?: string;
  handler?: (response: RazorpaySuccessResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
}
