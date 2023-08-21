import { IDBPDatabase } from 'idb';
import { BudgetInterface, BudgetNumbers } from '../../interfaces/interfaces';

const getBudgetNumbersDB = async (db : IDBPDatabase<BudgetInterface> | undefined, budgetId : number | undefined, minMonth : number, maxMonth : number) => {
	let budgetNumbers = {} as BudgetNumbers;

	
	if (db && budgetId) {
		const tx = db.transaction(['transactions', 'budgeted'], 'readonly');
		const tStore = tx.objectStore('transactions');
		const tIndex = tStore.index('budgetId');
		let tCursor = await tIndex.openCursor(budgetId);

		while (tCursor) {
			const month = tCursor.value.month + (tCursor.value.monthOffset || 0);
			const category = tCursor.value.categoryId;

			if (category === undefined) {
				tCursor = await tCursor.continue();
				continue;
			}

			for (let i = minMonth; i <= maxMonth; i++) {
				if (!budgetNumbers[i]) {
					budgetNumbers[i] = {};
				}
				if (!budgetNumbers[i][category]) {
					budgetNumbers[i][category] = {budgeted: 0, budgetedTotal: 0, spent: 0, spentTotal: 0};
				}
				if (i >= month) {
					// budgetNumbers[i][el.category].id = el.id;
					budgetNumbers[i][category].spentTotal += ((tCursor.value.in || 0) - (tCursor.value.out || 0));
				}
			}

			if (month >= minMonth && month <= maxMonth) {
				budgetNumbers[month][category].spent += ((tCursor.value.in || 0) - (tCursor.value.out || 0));
			}
			tCursor = await tCursor.continue();
		}

		const bStore = tx.objectStore('budgeted');
		const bIndex = bStore.index('budgetId');
		let bCursor = await bIndex.openCursor(budgetId);

		while (bCursor) {
			const month = bCursor.value.month;
			const category = bCursor.value.category;

			if (category === undefined) {
				bCursor = await bCursor.continue();
				continue;
			}

			for (let i = minMonth; i <= maxMonth; i++) {
				if (!budgetNumbers[i]) {
					budgetNumbers[i] = {};
				}
				if (!budgetNumbers[i][category]) {
					budgetNumbers[i][category] = {budgeted: 0, budgetedTotal: 0, spent: 0, spentTotal: 0};
				}
				if (i >= month) {
					budgetNumbers[i][category].budgetedTotal += bCursor.value.amount;
				}
			}

			if (month >= minMonth && month <= maxMonth) {
				budgetNumbers[month][category].id = bCursor.value.id;
				budgetNumbers[month][category].budgeted += bCursor.value.amount;
			}

			bCursor = await bCursor.continue();
		}

		await tx.done;
		return budgetNumbers;
	}
	else {
		return budgetNumbers;
	}
}

export default getBudgetNumbersDB;