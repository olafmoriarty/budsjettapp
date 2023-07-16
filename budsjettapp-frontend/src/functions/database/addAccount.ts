import { IDBPDatabase } from 'idb';
import { BudgetInterface, Account } from '../../interfaces/interfaces';

const addAccount = async (db : IDBPDatabase<BudgetInterface> | undefined, account : Account) => {
	if (db) {
		const tx = db.transaction('accounts', 'readwrite');
		const store = tx.objectStore('accounts');
		const added = await store.put(account);
		await tx.done;
		return added;
	}
}

export default addAccount;