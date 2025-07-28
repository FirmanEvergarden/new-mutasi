// pages/index.js
import { connectToDatabase } from '../lib/mongodb';

export default function Home({ transactions }) {
  return (
    <div>
      <h1>Daftar Pembayaran</h1>
      {transactions.length === 0 ? (
        <p>Belum ada transaksi.</p>
      ) : (
        <ul>
          {transactions.map((tx) => (
            <li key={tx._id}>
              <strong>Dari:</strong> {tx.senderName} <br />
              <strong>Jumlah:</strong> Rp{tx.amount.toLocaleString('id-ID')} <br />
              <strong>E-Wallet:</strong> {tx.eWalletApp} <br />
              <strong>Waktu Transaksi:</strong> {new Date(tx.timestamp).toLocaleString('id-ID')} <br />
              <small>Diterima pada: {new Date(tx.receivedAt).toLocaleString('id-ID')}</small>
              <hr />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('transactions');
    const transactions = await collection.find({}).sort({ timestamp: -1 }).toArray(); // Ambil semua, urutkan terbaru

    // _id dari MongoDB adalah ObjectId, perlu di-string-ify untuk props Next.js
    const serializedTransactions = transactions.map(tx => ({
      ...tx,
      _id: tx._id.toString(),
      // Pastikan timestamp dan receivedAt juga di-string-ify jika perlu
      timestamp: tx.timestamp.toISOString(),
      receivedAt: tx.receivedAt.toISOString()
    }));

    return {
      props: {
        transactions: serializedTransactions,
      },
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return {
      props: {
        transactions: [],
        error: error.message
      }
    };
  }
}