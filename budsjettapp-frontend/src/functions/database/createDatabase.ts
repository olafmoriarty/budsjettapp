import {openDB} from 'idb';
import {BudgetInterface} from '../../interfaces/interfaces';

const createDatabase = async () => {
	if (!('indexedDB' in window)) {
		return undefined;
	}

	const db = await openDB<BudgetInterface>('budgetApp', 2, {
		upgrade(db) {
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
			}

			if (!db.objectStoreNames.contains('payees')) {
				const payees = db.createObjectStore('payees', {
					keyPath: 'id',
					autoIncrement: true,
				});
				payees.createIndex('externalId', 'externalId');
				payees.createIndex('budgetId', 'budgetId');
			}
		}
	});
	return db;
}

export default createDatabase;