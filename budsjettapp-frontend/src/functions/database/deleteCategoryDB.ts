import { IDBPDatabase } from 'idb';
import { BudgetInterface, Category } from '../../interfaces/interfaces';

const deleteCategoryDB = async (db : IDBPDatabase<BudgetInterface> | undefined, category : number) => {
	if (db) {
		const tx = db.transaction('categories', 'readwrite');
		const store = tx.objectStore('categories');
		await store.delete(category);
		await tx.done;
		return;
	}
}

export default deleteCategoryDB;