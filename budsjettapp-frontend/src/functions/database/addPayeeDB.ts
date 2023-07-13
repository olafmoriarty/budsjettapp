import { IDBPDatabase } from 'idb';
import { BudgetInterface, Payee } from '../../interfaces/interfaces';

const addPayeeDB = async (db : IDBPDatabase<BudgetInterface> | undefined, payee : Payee) => {
	if (db) {
		const tx = db.transaction('payees', 'readwrite');
		const store = tx.objectStore('payees');
		const added = await store.put(payee);
		await tx.done;
		return added;
	}
}

export default addPayeeDB;