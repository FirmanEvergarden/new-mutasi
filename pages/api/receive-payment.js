// pages/api/receive-payment.js
import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed. Only POST requests are accepted.' });
  }

  try {
    const {
      senderName,
      amount,
      eWalletApp,
      transactionDate, // Asumsi format ISO string atau bisa diolah
      transactionTime // Asumsi string "HH:MM" atau bisa diolah
    } = req.body;

    // Validasi data dasar
    if (!senderName || !amount || !eWalletApp || !transactionDate || !transactionTime) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Pastikan amount adalah angka
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
        return res.status(400).json({ message: 'Amount must be a valid number.' });
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('transactions'); // Nama koleksi Anda, bisa diganti

    const newTransaction = {
      senderName,
      amount: parsedAmount,
      eWalletApp,
      // Gabungkan tanggal dan jam, atau simpan terpisah sesuai kebutuhan
      // Direkomendasikan simpan sebagai Date object jika memungkinkan
      timestamp: new Date(`${transactionDate}T${transactionTime}`), 
      rawDate: transactionDate, // Opsional, simpan format asli
      rawTime: transactionTime, // Opsional, simpan format asli
      receivedAt: new Date(), // Waktu API menerima data
      status: 'pending' // Atau status awal lainnya
    };

    const result = await collection.insertOne(newTransaction);

    if (result.acknowledged) {
      res.status(200).json({ 
        message: 'Transaction recorded successfully!', 
        transactionId: result.insertedId 
      });
    } else {
      res.status(500).json({ message: 'Failed to record transaction.' });
    }

  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}