import { IDBPDatabase } from 'idb';
import { BudgetInterface } from '../../interfaces/interfaces';

const getBudgets = async (db : IDBPDatabase<BudgetInterface> | undefined, id? : number) => {
	if (db) {
		const tx = db.transaction('budgets', 'readwrite');
		const store = tx.objectStore('budgets');
		let value;
		if (id) {
			value = await store.get(id);
		}
		else {
			value = await store.getAll();
		}
		await tx.done;
		return value;
	}
}

export default getBudgets;