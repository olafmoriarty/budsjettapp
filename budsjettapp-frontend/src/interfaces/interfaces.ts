import {RefObject} from 'react';
import { DBSchema, IDBPDatabase } from 'idb';

export interface BudgetInterface extends DBSchema {
	'budgets': {
		key: number,
		value: Budget,
		indexes: {
			'externalId': number,
			'sync': [
				budgetId: number,
				sync: number,
			],
		},
	},
	'accounts': {
		key: number,
		value: Account,
		indexes: {
			'externalId': number,
			'budgetId': number,
			'sync': [
				budgetId: number,
				sync: number,
			],
		}
	},
	'categories': {
		key: number,
		value: Category,
		indexes: {
			'externalId': number,
			'budgetId': number,
			'sync': [
				budgetId: number,
				sync: number,
			],
		}
	},
	'transactions': {
		key: number,
		value: Transaction,
		indexes: {
			'externalId': number,
			'budgetId': number,
			'accountId': number,
			'categoryId': number,
			'sync': [
				budgetId: number,
				sync: number,
			],
		}
	},
	'payees': {
		key: number,
		value: Payee,
		indexes: {
			'externalId': number,
			'budgetId': number,
			'sync': [
				budgetId: number,
				sync: number,
			],
		}
	},
	'budgeted': {
		key: number,
		value: Budgeted,
		indexes: {
			'externalId': number,
			'budgetId': number,
			'categoryMonth': [
				category: number,
				month: number,
			],
			'month': number,
			'category': number,
			'sync': [
				budgetId: number,
				sync: number,
			],
		}
	},
}

export interface Budget {
	id?: number,
	name: string,
	externalId?: number,
	sync?: number,
	lastSyncDate?: string,
	device: string,
}

export interface Account {
	id?: number,
	budgetId: number,
	name: string,
	externalId?: number,
	sync?: number,

}

export interface Category {
	id?: number,
	budgetId: number,
	name: string,
	sort?: number,
	parent?: number,
	exParent?: number,
	externalId?: number,
	hidden?: boolean,
	sync?: number,
	deleted?: boolean,
}

export interface Payee {
	id?: number,
	budgetId: number,
	name: string,
	lastUsed?: number,
	externalId?: number,
	sync?: number,
}

export interface Budgeted {
	id?: number,
	budgetId: number,
	externalId?: number,
	sync?: number,
	month: number,
	category: number,
	exCategory?: number,
	amount: number,
}

export interface Transaction {
	id?: number,
	budgetId: number,
	externalId?: number,
	date: string,
	month: number,
	accountId: number,
	exAccountId?: number,
	payeeId?: number,
	exPayeeId?: number,
	categoryId?: number,
	exCategoryId?: number,
	memo?: string,
	in?: number,
	out?: number,
	counterAccount?: number,
	counterTransaction?: number,
	exCounterAccount?: number,
	exCounterTransaction?: number,
	sync?: number,
	deleted?: boolean,
	monthOffset?: number,
	parentTransaction?: number,
	exParentTransaction?: number,
	isParent?: boolean,
}

export interface BBP {
	budgetNumbers : BudgetNumbers,
	setBudgetNumbers : (a : BudgetNumbers) => void,
	categoryToEdit : number | undefined,
	setCategoryToEdit : (a : number | undefined) => void,
	createCategory : (a : number | undefined) => void,
	currentMonth : number,
	showHidden : boolean,
	categoryRefs : {[key : number] : HTMLInputElement}[][],
}

export interface BAP {
	payeesById : {[key : number] : Payee},
	categoriesById : {[key : number] : Category},
	accountsById : {[key : number] : Account},
	registerCheckbox : (id : number | undefined, value? : boolean) => void,
	transactions : Transaction[],
	setTransactions : (a : Transaction[]) => void,
	accountId : number,
	deleteTransaction : (a : Transaction) => void,
}

export interface BudgetNumbers {
	[key: number]: { // Month
		[key: number]: BudgetNumbersSingleCategory,
	}
}
export interface BudgetNumbersSingleCategory {
	id?: number,
	budgeted: number,
	budgetedTotal: number,
	spent: number,
	spentTotal: number,
}

export interface DialogParams {
	id?: number,
	account?: Account,
}

export interface AccountBalances {
	[key : number]: number,
}

export interface DictionaryEntry {
	key : number|undefined, 
	value: string, 
	displayValue?: string | JSX.Element
}

export interface Archive {
	[key : string]: Budget | (Transaction | Account | Category |  Payee |  Budgeted)[],
}
