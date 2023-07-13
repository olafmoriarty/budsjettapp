import { IDBPDatabase } from 'idb';
import { AccountBalances, BudgetInterface } from '../../interfaces/interfaces';

const getAccountBalancesDB = async (db : IDBPDatabase<BudgetInterface> | undefined, budgetId : number) => {
	let accountBalances = {} as AccountBalances;
	if (db) {
		const tx = db.transaction('transactions', 'readonly');
		const store = tx.objectStore('transactions');
		const index = store.index('budgetId');
		let cursor = await index.openCursor(budgetId);

		while (cursor) {
			let newValue = accountBalances[cursor.value.accountId] || 0;
			newValue = newValue + (cursor.value.in || 0) - (cursor.value.out || 0);
			accountBalances[cursor.value.accountId] = newValue;
			cursor = await cursor.continue();
		}
		await tx.done;
		return accountBalances;
	}
	else {
		return accountBalances;
	}
}

interface TransactionOptions {
	category? : number,
	account? : number,
}

export default getAccountBalancesDB;