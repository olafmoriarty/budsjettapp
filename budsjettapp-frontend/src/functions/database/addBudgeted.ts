import { IDBPDatabase } from 'idb';
import { BudgetInterface, Budgeted, Category } from '../../interfaces/interfaces';

const addBudgeted = async (db : IDBPDatabase<BudgetInterface> | undefined, budgeted : Budgeted) => {
	if (db) {
		const tx = db.transaction('budgeted', 'readwrite');
		const store = tx.objectStore('budgeted');
		const added = await store.put(budgeted);
		await tx.done;
		return added;
	}
}

export default addBudgeted;