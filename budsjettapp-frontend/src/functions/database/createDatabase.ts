import {openDB} from 'idb';
import {BudgetInterface} from '../../interfaces/interfaces';

const createDatabase = async () => {
	if (!('indexedDB' in window)) {
		return undefined;
	}

	const db = await openDB<BudgetInterface>('budgetApp', 2, {
		upgrade(db, oldVersion, newVersion, transaction, event) {
			if (!db.objectStoreNames.contains('budgets')) {
				const budgets = db.createObjectStore('budgets', {
					keyPath: 'id',
					autoIncrement: true,
				});
				budgets.createIndex('externalId', 'externalId');
			}

			if (!db.objectStoreNames.contains('accounts')) {
				const accounts = db.createObjectStore('accounts', {
					keyPath: 'id',
					autoIncrement: true,
				});
				accounts.createIndex('externalId', 'externalId');
				accounts.createIndex('budgetId', 'budgetId');
			}

			if (!db.objectStoreNames.contains('categories')) {
				const categories = db.createObjectStore('categories', {
					keyPath: 'id',
					autoIncrement: true,
				});
				categories.createIndex('externalId', 'externalId');
				categories.createIndex('budgetId', 'budgetId');
			}

			if (!db.objectStoreNames.contains('transactions')) {
				const transactions = db.createObjectStore('transactions', {
					keyPath: 'id',
					autoIncrement: true,
				});
				transactions.createIndex('externalId', 'externalId');
				transactions.createIndex('budgetId', 'budgetId');
				transactions.createIndex('accountId', 'accountId');
				transactions.createIndex('categoryId', 'categoryId');
			}
			else {
				const store = transaction.objectStore("transactions");
				store.createIndex('categoryId', 'categoryId');
			}

			if (!db.objectStoreNames.contains('payees')) {
				const payees = db.createObjectStore('payees', {
					keyPath: 'id',
					autoIncrement: true,
				});
				payees.createIndex('externalId', 'externalId');
				payees.createIndex('budgetId', 'budgetId');
			}

			if (!db.objectStoreNames.contains('budgeted')) {
				const budgeted = db.createObjectStore('budgeted', {
					keyPath: 'id',
					autoIncrement: true,
				});
				budgeted.createIndex('externalId', 'externalId');
				budgeted.createIndex('budgetId', 'budgetId');
				budgeted.createIndex('categoryMonth', ['budgetId', 'category', 'month']);
				budgeted.createIndex('category', ['budgetId', 'category']);
				budgeted.createIndex('month', ['budgetId', 'month']);
			}
		}
	});
	return db;
}

export default createDatabase;