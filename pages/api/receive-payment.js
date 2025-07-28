// pages/api/receive-payment.js
import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed. Only POST requests are accepted.' });
  }

  console.log('API /receive-payment received a request.'); // LOG 1

  try {
    const {
      senderName,
      amount,
      eWalletApp,
      transactionDate,
      transactionTime
    } = req.body;

    console.log('Received data:', { senderName, amount, eWalletApp, transactionDate, transactionTime }); // LOG 2

    // Validasi data dasar
    if (!senderName || !amount || !eWalletApp || !transactionDate || !transactionTime) {
      console.error('Missing required fields in request body.'); // LOG 3
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
        console.error('Amount is not a valid number:', amount); // LOG 4
        return res.status(400).json({ message: 'Amount must be a valid number.' });
    }

    console.log('Attempting to connect to database...'); // LOG 5
    const { db } = await connectToDatabase();
    console.log('Successfully connected to database.'); // LOG 6

    const collection = db.collection('transactions');

    const newTransaction = {
      senderName,
      amount: parsedAmount,
      eWalletApp,
      timestamp: new Date(`${transactionDate}T${transactionTime}`), 
      rawDate: transactionDate,
      rawTime: transactionTime,
      receivedAt: new Date(),
      status: 'pending'
    };

    console.log('Inserting new transaction:', newTransaction); // LOG 7
    const result = await collection.insertOne(newTransaction);

    if (result.acknowledged) {
      console.log('Transaction recorded successfully! ID:', result.insertedId); // LOG 8
      res.status(200).json({ 
        message: 'Transaction recorded successfully!', 
        transactionId: result.insertedId 
      });
    } else {
      console.error('Failed to record transaction. Result:', result); // LOG 9
      res.status(500).json({ message: 'Failed to record transaction.' });
    }

  } catch (error) {
    console.error('Error processing payment:', error); // LOG 10
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
