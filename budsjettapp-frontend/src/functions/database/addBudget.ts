import { IDBPDatabase } from 'idb';
import { BudgetInterface, Budget } from '../../interfaces/interfaces';

const addBudget = async (db : IDBPDatabase<BudgetInterface> | undefined, budget : Budget) => {
	if (db) {
		const tx = db.transaction('budgets', 'readwrite');
		const store = tx.objectStore('budgets');
		const added = await store.put(budget);
		await tx.done;
		return added;
	}
}

export default addBudget;