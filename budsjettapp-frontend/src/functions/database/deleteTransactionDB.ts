import { IDBPDatabase } from 'idb';
import { BudgetInterface, Transaction } from '../../interfaces/interfaces';

const deleteTransactionDB = async (db : IDBPDatabase<BudgetInterface> | undefined, transaction : Transaction) => {
	if (db && transaction.id) {
		const tx = db.transaction('transactions', 'readwrite');
		const store = tx.objectStore('transactions');

		if (transaction.externalId) {
			const newTransaction = {
				id: transaction.id,
				externalId: transaction.externalId,
				budgetId: transaction.budgetId,
				date: '',
				month: 0,
				accountId: 0,
				sync: 1,
				deleted: true,
			} as Transaction;
			await store.put(newTransaction);

			if (transaction.counterTransaction) {
				const newCounter = {
					...newTransaction,
					id: transaction.counterTransaction,
				} as Transaction;
				await store.put(newCounter);
			}
		}
		else {
			await store.delete(transaction.id);
			
			if (transaction.counterTransaction) {
				await store.delete(transaction.counterTransaction);
			}
		}
		await tx.done;
		return;
	}
}

export default deleteTransactionDB;