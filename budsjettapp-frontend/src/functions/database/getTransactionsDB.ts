import { IDBPDatabase } from 'idb';
import { BudgetInterface } from '../../interfaces/interfaces';

const getTransactionsDB = async (db : IDBPDatabase<BudgetInterface> | undefined, budgetId : number, options : Options) => {
	if (db) {
		const {account} = options;
		let value;
		const tx = db.transaction('transactions', 'readonly');
		const store = tx.objectStore('transactions');
		if (account) {
			const index = store.index('accountId');
			value = await index.getAll(account);
		}
		else {
			const index = store.index('budgetId');
			value = await index.getAll(budgetId);
		}
		await tx.done;
		return value;
	}
}

interface Options {
	account?: number,
}

export default getTransactionsDB;