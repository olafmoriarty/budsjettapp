import { Transaction } from "../types/types";

/**
 * Calculates the total inflow/outflow in a category for a month, and until that month.
 * 
 * @param transactions 
 * An array of type Transaction[], containing the transactions that are to be .
 * @param monthId
 * A numeric representation of which month to summarize, specifically how many months have passed since January 2000.
 * @param category 
 * The category ID to summarize.
 * @returns 
 * An object on the format { monthTotal: number, untilMonthTotal: number }. monthTotal is the total inflow - outflow the category has in the given month. untilMonthTotal is the total inflow - outflow the category has UNTIL the given month (inclusive).
 */
function getCategoryTotals(transactions : Transaction[], monthId : number, category : number) : Totals {

	const year = (Math.floor(monthId / 12) + 2000).toString();
	let monthString = (monthId % 12 + 1).toString();
	if (monthString.length < 2) {
		monthString = '0' + monthString;
	}
	const yearMonth = year + '-' + monthString;

	return transactions.reduce(
		(previous, current) => {
			return {
				monthTotal: current.date.substring(0, 7) === yearMonth && current.categoryId === category ? previous.monthTotal + (current.in ? current.in : 0) - (current.out ? current.out : 0) : previous.monthTotal,
				untilMonthTotal: current.date.substring(0, 7) <= yearMonth && current.categoryId === category ? previous.untilMonthTotal + (current.in ? current.in : 0) - (current.out ? current.out : 0) : previous.untilMonthTotal
			} as Totals
		}, {monthTotal: 0, untilMonthTotal: 0}
	);
}

interface Totals {
	monthTotal: number,
	untilMonthTotal: number,
} 

export default getCategoryTotals;