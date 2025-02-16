import Paymanai from 'paymanai';
import dotenv from 'dotenv';

dotenv.config();

const payman = new Paymanai({
    xPaymanAPISecret: process.env.PAYMAN_API_SECRET!, // Your API key from the dashboard
    environment: 'sandbox', // Use 'production' for live transactions
  });

const payerIdMap = {
    "1": "pd-1efebfcc-4eed-6a29-ae47-87e95dee5b8e",
    "2": "pd-1efebfcc-53c3-66da-ae47-87e95dee5b8e",
    "3": "pd-1efebfcc-57e2-61db-ae47-87e95dee5b8e",
    "4": "pd-1efebfcc-5c0f-673c-ae47-87e95dee5b8e",
    "5": "pd-1efebfcc-6046-68dd-ae47-87e95dee5b8e",
    "6": "pd-1efebfcc-648c-64de-ae47-87e95dee5b8e"
};

// This could be your external function that returns winner positions
function getWinnerPositions() {
    // Replace this with your actual implementation
    return [4, 3, 6]; // Example return value: [first, second, third]
}

async function createPayment() {
    // This code is for creating a payee and won't be used in PRD
    // const agentPayee1 = await payman.payments.createPayee({
    //     type: 'PAYMAN_AGENT',
    //     paymanAgent: 'agt-1efebee6-af35-6f73-9c15-ed3e511002ed',  // Recipient agent's ID from dashboard
    //     name: 'Agent 1',
    // });

    // console.log(agentPayee1);

    const winners = getWinnerPositions();
    
    const payment1 = await payman.payments.sendPayment({
        paymentDestinationId: payerIdMap[winners[0].toString()],
        amountDecimal: 400.00,
    });

    const payment2 = await payman.payments.sendPayment({
        paymentDestinationId: payerIdMap[winners[1].toString()],
        amountDecimal: 240.00,
    });

    const payment3 = await payman.payments.sendPayment({
        paymentDestinationId: payerIdMap[winners[2].toString()],
        amountDecimal: 160.00,
    });
    
    console.log(payment1, payment2, payment3);
    return [payment1, payment2, payment3];
}

// Call the function
createPayment();