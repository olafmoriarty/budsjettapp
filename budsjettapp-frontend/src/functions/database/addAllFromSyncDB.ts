import { IDBPDatabase } from 'idb';
import { Account, Archive, Budget, BudgetInterface, Budgeted, Category, Payee, Transaction } from '../../interfaces/interfaces';

/**
 * Get all database rows related to the given budget
 * @param db The IndexedDB database object
 * @param id The ID of the budget we wish to return information about
 * @returns An object of database rows
 */
const addAllFromSyncDB = async (db : IDBPDatabase<BudgetInterface> | undefined, archive : Archive, device? : string) => {

	// Check that a database is given
	if (db) {

		// Get a list of stores to loop through and delete stuff from
		type validStore = 'accounts' | 'budgeted' | 'categories' | 'payees' | 'transactions';
		const stores = ['accounts', 'categories', 'payees', 'budgeted', 'transactions'] as validStore[];

		const tx = db.transaction(['budgets', ...stores], 'readwrite');
		const budgetStore = tx.objectStore('budgets');
		
		let newBudget = {
			...archive.budget as Budget,
		} as Budget;

		if (device) {
			newBudget.device = device;
		}
		let budgetId = await budgetStore.put(newBudget);

		let output = {} as Archive;
		output.budget = {
			...archive.budget,
			id: budgetId,
		} as Budget;
		if (device) {
			output.budget.device = device;
		}

		for (let i = 0; i < stores.length; i++) {
			if (!archive[stores[i]]) {
				continue;
			}

			const rowsToAdd = archive[stores[i]];

			if (!Array.isArray(rowsToAdd)) {
				continue;
			}

			let outputStore = [] as (Account | Budgeted | Category | Payee | Transaction)[];
			const store = tx.objectStore(stores[i]);
			for (let j = 0; j < rowsToAdd.length; j++) {
				let row = rowsToAdd[j] as Account | Category | Payee | Budgeted | Transaction;
				row.budgetId = budgetId;
				if (row.externalId && !row.id) {
					const externalIndex = store.index("externalId");
					const external = await externalIndex.get(row.externalId);
					if (external) {
						row.id = external.id;
					}
				}

				if ('exCategory' in row && row.exCategory) {
					if (!row.category) {
						const categoryStore = tx.objectStore('categories');
						const externalCategoryIndex = categoryStore.index('externalId');
						const externalCategoryRow = await externalCategoryIndex.get(row.exCategory);
						row.category = externalCategoryRow?.id || 0;
					}
					delete(row.exCategory);
				}

				if ('exParent' in row && row.exParent) {
					if (!row.parent) {
						const categoryStore = tx.objectStore('categories');
						const externalCategoryIndex = categoryStore.index('externalId');
						const externalCategoryRow = await externalCategoryIndex.get(row.exParent);
						row.parent = externalCategoryRow?.id || 0;
					}
					delete(row.exParent);
				}

				if ('exCategoryId' in row && row.exCategoryId) {
					if (!row.categoryId) {
						const categoryStore = tx.objectStore('categories');
						const externalCategoryIndex = categoryStore.index('externalId');
						const externalCategoryRow = await externalCategoryIndex.get(row.exCategoryId);
						row.categoryId = externalCategoryRow?.id;
					}
					delete(row.exCategoryId);
				}

				if ('exAccountId' in row && row.exAccountId) {
					if (!row.accountId) {
						const accountStore = tx.objectStore('accounts');
						const externalAccountIndex = accountStore.index('externalId');
						const externalAccountRow = await externalAccountIndex.get(row.exAccountId);
						row.accountId = externalAccountRow?.id || 0;
					}
					delete(row.exAccountId);
				}

				if ('exPayeeId' in row && row.exPayeeId) {
					if (!row.payeeId) {
						const payeeStore = tx.objectStore('payees');
						const externalPayeeIndex = payeeStore.index('externalId');
						const externalPayeeRow = await externalPayeeIndex.get(row.exPayeeId);
						row.payeeId = externalPayeeRow?.id;
					}
					delete(row.exPayeeId);
				}

				if ('exCounterAccount' in row && row.exCounterAccount) {
					if (!row.counterAccount) {
						const accountStore = tx.objectStore('accounts');
						const externalAccountIndex = accountStore.index('externalId');
						const externalAccountRow = await externalAccountIndex.get(row.exCounterAccount);
						row.counterAccount = externalAccountRow?.id;
					}
					delete(row.exCounterAccount);
				}

				if ('exCounterTransaction' in row && row.exCounterTransaction) {
					if (!row.counterTransaction) {
						const transactionStore = tx.objectStore('transactions');
						const externalTransactionIndex = transactionStore.index('externalId');
						const externalTransactionRow = await externalTransactionIndex.get(row.exCounterTransaction);

						row.counterTransaction = externalTransactionRow?.id;
					}
					delete(row.exCounterTransaction);
				}

				if ('exParentTransaction' in row && row.exParentTransaction) {
					if (!row.parentTransaction) {
						const transactionStore = tx.objectStore('transactions');
						const externalTransactionIndex = transactionStore.index('externalId');
						const externalTransactionRow = await externalTransactionIndex.get(row.exParentTransaction);

						row.parentTransaction = externalTransactionRow?.id;
					}
					delete(row.exParentTransaction);
				}

				const rowId = await store.put(row);
				outputStore.push({
					...row,
					id: rowId,
				});

				if ('counterTransaction' in row) {

					const oldCounterTransaction = await store.get(row.counterTransaction || 0);
					if (oldCounterTransaction) {
						const newCounterTransaction = {
							...oldCounterTransaction,
							counterTransaction: rowId,
						}
						await store.put(newCounterTransaction);
						output.transactions = Array.isArray(output.transactions) ? output.transactions.map(el => el.id === oldCounterTransaction.id ? newCounterTransaction : el) : [];
					}
				}
			}

			output[stores[i]] = outputStore;
		}
		await tx.done;
		return output;
	}
}

export default addAllFromSyncDB;