import { IDBPDatabase } from 'idb';
import { BudgetInterface } from '../../interfaces/interfaces';

const getPayeesDB = async (db : IDBPDatabase<BudgetInterface> | undefined, budgetId : number) => {
	if (db) {
		const tx = db.transaction('payees', 'readonly');
		const store = tx.objectStore('payees');
		const index = store.index('budgetId');
		let value = await index.getAll(budgetId);
		await tx.done;
		return value;
	}
}

export default getPayeesDB;