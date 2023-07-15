import { IDBPCursorWithValue, IDBPDatabase } from 'idb';
import { BudgetInterface } from '../../interfaces/interfaces';

/**
 * Delete a budget from the database
 * @param db - The database object
 * @param budgetId - The ID of the budget to delete
 * @returns 
 */
const deleteBudgetDB = async (db : IDBPDatabase<BudgetInterface> | undefined, budgetId : number) => {
	if (db) {
		
		// Get a list of stores to loop through and delete stuff from
		type validStore = 'accounts' | 'budgeted' | 'categories' | 'payees' | 'transactions';
		const stores = ['accounts', 'budgeted', 'categories', 'payees', 'transactions'] as validStore[];

		// Start transaction
		const tx = db.transaction(['budgets', ...stores], 'readwrite');

		// Delete budget
		const store = tx.objectStore('budgets');
		await store.delete(budgetId);

		// Loop through all the object stores and delete everything with the
		// given budget number
		for (let i = 0; i < stores.length; i++) {
			const storeName = stores[i];
			const store = tx.objectStore(storeName as validStore);
			let index = store.index('budgetId');
			let cursor = await index.openCursor(budgetId);
			while (cursor) {
				store.delete(cursor.primaryKey);
				cursor = await cursor.continue();
			}
		}

		await tx.done;
		return true;
	}
	else {
		return true;
	}
}

export default deleteBudgetDB;