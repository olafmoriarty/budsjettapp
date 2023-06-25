import {RefObject} from 'react';
import { DBSchema, IDBPDatabase } from 'idb';

export interface BudgetInterface extends DBSchema {
	'budgets': {
		key: number,
		value: Budget,
		indexes: {
			'externalId': number,
		},
	},
	'accounts': {
		key: number,
		value: Account,
		indexes: {
			'externalId': number,
			'budgetId': number,
		}
	}
	'categories': {
		key: number,
		value: Category,
		indexes: {
			'externalId': number,
			'budgetId': number,
		}
	}
	'transactions': {
		key: number,
		value: Transaction,
		indexes: {
			'externalId': number,
			'budgetId': number,
			'accountId': number,
		}
	}
	'payees': {
		key: number,
		value: Payee,
		indexes: {
			'externalId': number,
			'budgetId': number,
		}
	}
}

export interface Budget {
	id?: number,
	name: string,
	externalId?: number,
	synced?: boolean,
}

export interface Account {
	id?: number,
	budgetId: number,
	name: string,
	externalId?: number,
	synced?: boolean,
}

export interface Category {
	id?: number,
	budgetId: number,
	name: string,
	parent?: number,
	externalId?: number,
	synced?: boolean,
}

export interface Payee {
	id?: number,
	budgetId: number,
	name: string,
	externalId?: number,
	synced?: boolean,
}

export interface Transaction {
	id?: number,
	budgetId: number,
	externalId?: number,
	date: Date,
	accountId: number,
	payeeId?: number,
	categoryId?: number,
	memo?: string,
	in?: number,
	out?: number,
	counterTransaction?: number,
	synced?: boolean,
}

export interface BP {
	db : IDBPDatabase<BudgetInterface> | undefined,
	t : {[key : string] : string},

	activeBudget : Budget,
	accounts : Account[],

	categories : Category[],
	selectBudget : (a : Budget) => void,
	selectAccount : (a : Account) => void,
	openDialog : (a : string) => void,
	setAccounts : (a : Account[]) => void,
	setCategories : (a : Category[]) => void,
	setShowSidebar : (a : boolean) => void,

	dialogBox : RefObject<HTMLDialogElement>,
}

export interface DefaultProps {
	bp : BP,
}