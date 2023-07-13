import { IDBPDatabase } from 'idb';
import { BudgetInterface } from '../../interfaces/interfaces';

const getCategories = async (db : IDBPDatabase<BudgetInterface> | undefined, budgetId : number) => {
	if (db) {
		const tx = db.transaction('categories', 'readonly');
		const store = tx.objectStore('categories');
		const index = store.index('budgetId');
		let value = await index.getAll(budgetId);
		await tx.done;
		return value;
	}
}

export default getCategories;