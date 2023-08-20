import { IDBPDatabase } from 'idb';
import { Archive, BudgetInterface } from '../../interfaces/interfaces';

/**
 * Get all database rows related to the given budget
 * @param db The IndexedDB database object
 * @param id The ID of the budget we wish to return information about
 * @returns An object of database rows
 */
const getAllToSyncDB = async (db : IDBPDatabase<BudgetInterface> | undefined, budgetId : number) => {

	// Check that a database is given
	if (db) {

		// Get a list of stores to loop through and delete stuff from
		type validStore = 'accounts' | 'budgeted' | 'categories' | 'payees' | 'transactions';
		const stores = ['accounts', 'categories', 'payees', 'budgeted', 'transactions'] as validStore[];

		const tx = db.transaction(['budgets', ...stores], 'readonly');
		const budgetStore = tx.objectStore('budgets');
		
		let budget = await budgetStore.get(budgetId);

		let budgetFile = {
			budget: budget,
		} as Archive;

		for (let i = 0; i < stores.length; i++) {
			const store = tx.objectStore(stores[i]);
			const index = store.index("sync");
			let value = await index.getAll([budgetId, 1]);
			

			if (stores[i] === 'budgeted') {
				for (let j = 0; j < value.length; j++) {
					let valueRow = value[j];
					// Add external category id
					if ('category' in valueRow) {
						const categoryStore = tx.objectStore('categories');
						const budgetedCategory = await categoryStore.get(valueRow.category);
						if (budgetedCategory?.externalId) {
							valueRow.exCategory = budgetedCategory.externalId;
						}
						value[j] = valueRow;
					}
				}
			}

			if (stores[i] === 'categories') {
				for (let j = 0; j < value.length; j++) {
					let valueRow = value[j];
					// Add external parent category id
					if ('parent' in valueRow && valueRow.parent) {
						const parentCategory = await store.get(valueRow.parent);
						if (parentCategory?.externalId) {
							valueRow.exParent = parentCategory.externalId;
						}
						value[j] = valueRow;
					}
				}
			}

			if (stores[i] === 'transactions') {
				for (let j = 0; j < value.length; j++) {
					let valueRow = value[j];

					// Add external category ID
					if ('categoryId' in valueRow && valueRow.categoryId) {
						const categoryStore = tx.objectStore('categories');
						const transactionCategory = await categoryStore.get(valueRow.categoryId);
						if (transactionCategory?.externalId) {
							valueRow.exCategoryId = transactionCategory.externalId;
						}
					}

					// Add external account ID
					const accountStore = tx.objectStore('accounts');
					if ('accountId' in valueRow && valueRow.accountId) {
						const transactionAccount = await accountStore.get(valueRow.accountId);
						if (transactionAccount?.externalId) {
							valueRow.exAccountId = transactionAccount.externalId;
						}
					}

					// Add external countertransaction ID
					if ('counterTransaction' in valueRow && valueRow.counterTransaction) {
						const transactionCounter = await store.get(valueRow.counterTransaction);
						if (transactionCounter?.externalId) {
							valueRow.exCounterTransaction = transactionCounter.externalId;
						}
					}

					// Add external counteraccount ID
					if ('counterAccount' in valueRow && valueRow.counterAccount) {
						const transactionAccount = await accountStore.get(valueRow.counterAccount);
						if (transactionAccount?.externalId) {
							valueRow.exCounterAccount = transactionAccount.externalId;
						}
					}

					// Add external account ID
					if ('payeeId' in valueRow && valueRow.payeeId) {
						const payeeStore = tx.objectStore('payees');
						const transactionPayee = await payeeStore.get(valueRow.payeeId);
						if (transactionPayee?.externalId) {
							valueRow.exPayeeId = transactionPayee.externalId;
						}
					}


					value[j] = valueRow;
				}
			}

			budgetFile[stores[i]] = value;
		}

		await tx.done;
		return budgetFile;
	}
}

export default getAllToSyncDB;