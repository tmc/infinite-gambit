import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment Test',
  description: 'Test payment functionality',
};

export default function PaymentTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 