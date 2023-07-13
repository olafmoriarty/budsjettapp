import { IDBPDatabase } from 'idb';
import { BudgetInterface } from '../../interfaces/interfaces';

const getBudgeted = async (db : IDBPDatabase<BudgetInterface> | undefined, budgetId : number, options : Options) => {
	if (db) {
		const {maxMonth} = options;
		let value;
		const tx = db.transaction('budgeted', 'readonly');
		const store = tx.objectStore('budgeted');
		if (maxMonth) {
			const index = store.index('month');
			const range = IDBKeyRange.bound([budgetId, 0], [budgetId, maxMonth]);
			value = await index.getAll(range);

		}
		else {
			const index = store.index('budgetId');
			value = await index.getAll(budgetId);
		}
		await tx.done;
		return value;
	}
}

interface Options {
	maxMonth?: number,
}

export default getBudgeted;