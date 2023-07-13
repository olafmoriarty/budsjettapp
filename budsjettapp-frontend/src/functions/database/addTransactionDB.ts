import { IDBPDatabase } from 'idb';
import { BudgetInterface, Transaction } from '../../interfaces/interfaces';

const addTransactionDB = async (db : IDBPDatabase<BudgetInterface> | undefined, transaction : Transaction) => {
	if (db) {
		const tx = db.transaction('transactions', 'readwrite');
		const store = tx.objectStore('transactions');
		const added = await store.put(transaction);
		await tx.done;
		return added;
	}
}

export default addTransactionDB;