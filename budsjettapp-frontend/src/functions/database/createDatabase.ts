import {openDB} from 'idb';
import {BudgetInterface} from '../../interfaces/interfaces';

const createDatabase = async () => {
	if (!('indexedDB' in window)) {
		return undefined;
	}

	const db = await openDB<BudgetInterface>('budgetApp', 3, {
		upgrade(db, oldVersion, newVersion, transaction, event) {
			if (!db.objectStoreNames.contains('budgets')) {
				const budgets = db.createObjectStore('budgets', {
					keyPath: 'id',
					autoIncrement: true,
				});
				budgets.createIndex('externalId', 'externalId');
			}
			else {
				if (oldVersion < 3) {
					const store = transaction.objectStore("budgets");
					store.createIndex('sync', 'sync');
				}
			}

			if (!db.objectStoreNames.contains('accounts')) {
				const accounts = db.createObjectStore('accounts', {
					keyPath: 'id',
					autoIncrement: true,
				});
				accounts.createIndex('externalId', 'externalId');
				accounts.createIndex('budgetId', 'budgetId');
				accounts.createIndex('sync', ['budgetId', 'sync']);
			}
			else {
				if (oldVersion < 3) {
					const store = transaction.objectStore("accounts");
					store.createIndex('sync', ['budgetId', 'sync']);
				}
			}

			if (!db.objectStoreNames.contains('categories')) {
				const categories = db.createObjectStore('categories', {
					keyPath: 'id',
					autoIncrement: true,
				});
				categories.createIndex('externalId', 'externalId');
				categories.createIndex('budgetId', 'budgetId');
				categories.createIndex('sync', ['budgetId', 'sync']);
			}
			else {
				if (oldVersion < 3) {
					const store = transaction.objectStore("categories");
					store.createIndex('sync', ['budgetId', 'sync']);
				}
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
				transactions.createIndex('sync', ['budgetId', 'sync']);
			}
			else {
				const store = transaction.objectStore("transactions");
				if (oldVersion < 2) {
					store.createIndex('categoryId', 'categoryId');
				}
				if (oldVersion < 3) {
					store.createIndex('sync', ['budgetId', 'sync']);
				}
			}

			if (!db.objectStoreNames.contains('payees')) {
				const payees = db.createObjectStore('payees', {
					keyPath: 'id',
					autoIncrement: true,
				});
				payees.createIndex('externalId', 'externalId');
				payees.createIndex('budgetId', 'budgetId');
				payees.createIndex('sync', ['budgetId', 'sync']);
			}
			else {
				if (oldVersion < 3) {
					const store = transaction.objectStore("payees");
					store.createIndex('sync', ['budgetId', 'sync']);
				}
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
				budgeted.createIndex('sync', ['budgetId', 'sync']);
			}
			else {
				if (oldVersion < 3) {
					const store = transaction.objectStore("budgeted");
					store.createIndex('sync', ['budgetId', 'sync']);
				}
			}
		}
	});
	return db;
}

export default createDatabase;