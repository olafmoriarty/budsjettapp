import { IDBPDatabase } from 'idb';
import { BudgetInterface } from '../../interfaces/interfaces';

const getAccounts = async (db : IDBPDatabase<BudgetInterface> | undefined, budgetId : number) => {
	if (db) {
		const tx = db.transaction('accounts', 'readonly');
		const store = tx.objectStore('accounts');
		const index = store.index('budgetId');
		let value = await index.getAll(budgetId);
		await tx.done;
		return value;
	}
}

export default getAccounts;