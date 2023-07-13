import { IDBPDatabase } from 'idb';
import { BudgetInterface } from '../../interfaces/interfaces';

const getTransactionCountDB = async (db : IDBPDatabase<BudgetInterface> | undefined, budgetId : number, options? : TransactionOptions) => {
	if (db) {
		const tx = db.transaction('transactions', 'readonly');
		const store = tx.objectStore('transactions');
		let value;
		
		if (options && options.category) {
			const index = store.index('categoryId');
			value = await index.count(options.category);

		}
		else {
			const index = store.index('budgetId');
			value = await index.count(budgetId);
		}
		await tx.done;
		return value;
}
}

interface TransactionOptions {
	category? : number,
	account? : number,
}

export default getTransactionCountDB;