import { IDBPDatabase } from 'idb';
import { BudgetInterface, Category } from '../../interfaces/interfaces';

const addCategory = async (db : IDBPDatabase<BudgetInterface> | undefined, category : Category) => {
	if (db) {
		const tx = db.transaction('categories', 'readwrite');
		const store = tx.objectStore('categories');
		const added = await store.put(category);
		await tx.done;
		return added;
	}
}

export default addCategory;