import Paymanai from 'paymanai';
import dotenv from 'dotenv';

dotenv.config();
console.log({
    xPaymanAPISecret: process.env.PAYMAN_API_SECRET!, // Your API key from the dashboard
    environment: 'sandbox', // Use 'production' for live transactions
});

const payman = new Paymanai({
    xPaymanAPISecret: process.env.PAYMAN_API_SECRET!, // Your API key from the dashboard
    environment: 'sandbox', // Use 'production' for live transactions
  });

type PayerIdMapKey = "1" | "2" | "3" | "4" | "5" | "6";

const payerIdMap: Record<PayerIdMapKey, string> = {
    "1": "pd-1efebfcc-4eed-6a29-ae47-87e95dee5b8e",
    "2": "pd-1efebfcc-53c3-66da-ae47-87e95dee5b8e",
    "3": "pd-1efebfcc-57e2-61db-ae47-87e95dee5b8e",
    "4": "pd-1efebfcc-5c0f-673c-ae47-87e95dee5b8e",
    "5": "pd-1efebfcc-6046-68dd-ae47-87e95dee5b8e",
    "6": "pd-1efebfcc-648c-64de-ae47-87e95dee5b8e"
};

export async function createPayment(winnerPositions: number[]) {
    const payment1 = await payman.payments.sendPayment({
        paymentDestinationId: payerIdMap[winnerPositions[0].toString() as PayerIdMapKey],
        amountDecimal: 40.00,
    });

    const payment2 = await payman.payments.sendPayment({
        paymentDestinationId: payerIdMap[winnerPositions[1].toString() as PayerIdMapKey],
        amountDecimal: 24.00,
    });

    const payment3 = await payman.payments.sendPayment({
        paymentDestinationId: payerIdMap[winnerPositions[2].toString() as PayerIdMapKey],
        amountDecimal: 16.00,
    });
    
    console.log(payment1, payment2, payment3);
    return [payment1, payment2, payment3];
}

// Example usage
// createPayment([4, 3, 6]);
