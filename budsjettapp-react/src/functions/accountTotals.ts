import { Transaction } from "../types/types";

function accountTotals(transactions : Transaction[], accountId? : number) : Balances {
	return transactions.reduce((previous, current) => {
		return {
			total: accountId === current.accountId || !accountId ? previous.total + (current.in ? current.in : 0) - (current.out ? current.out : 0) : previous.total
		} as Balances
	}, {total: 0});
}

interface Balances {
	total: number,
}

export default accountTotals;