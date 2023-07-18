import { IDBPDatabase } from 'idb';
import { Archive, BudgetInterface } from '../../interfaces/interfaces';

/**
 * Get all database rows related to the given budget
 * @param db The IndexedDB database object
 * @param id The ID of the budget we wish to return information about
 * @returns An object of database rows
 */
const getAllDB = async (db : IDBPDatabase<BudgetInterface> | undefined, budgetId : number) => {

	// Check that a database is given
	if (db) {

		// Get a list of stores to loop through and delete stuff from
		type validStore = 'accounts' | 'budgeted' | 'categories' | 'payees' | 'transactions';
		const stores = ['accounts', 'budgeted', 'categories', 'payees', 'transactions'] as validStore[];

		const tx = db.transaction(['budgets', ...stores], 'readonly');
		const budgetStore = tx.objectStore('budgets');
		let budget = await budgetStore.get(budgetId);

		let budgetFile = {
			budget: budget,
		} as Archive;

		for (let i = 0; i < stores.length; i++) {
			const store = tx.objectStore(stores[i]);
			const index = store.index("budgetId");
			const value = await index.getAll(budgetId);
			budgetFile[stores[i]] = value;
		}

		await tx.done;
		return budgetFile;
	}
}

export default getAllDB;