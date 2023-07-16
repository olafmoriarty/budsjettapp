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
	},
	'categories': {
		key: number,
		value: Category,
		indexes: {
			'externalId': number,
			'budgetId': number,
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
		}
	},
	'payees': {
		key: number,
		value: Payee,
		indexes: {
			'externalId': number,
			'budgetId': number,
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
		}
	},
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
	sort?: number,
	parent?: number,
	externalId?: number,
	hidden?: boolean,
	synced?: boolean,
	deleted?: boolean,
}

export interface Payee {
	id?: number,
	budgetId: number,
	name: string,
	lastUsed?: number,
	externalId?: number,
	synced?: boolean,
}

export interface Budgeted {
	id?: number,
	budgetId: number,
	externalId?: number,
	synced?: boolean,
	month: number,
	category: number,
	amount: number,
}

export interface Transaction {
	id?: number,
	budgetId: number,
	externalId?: number,
	date: string,
	month: number,
	accountId: number,
	payeeId?: number,
	categoryId?: number,
	memo?: string,
	in?: number,
	out?: number,
	counterAccount?: number,
	counterTransaction?: number,
	synced?: boolean,
	deleted?: boolean,
}

export interface BP {
	db : IDBPDatabase<BudgetInterface> | undefined,
	t : {[key : string] : string},

	activeBudget : Budget,
	accounts : Account[],
	categories : Category[],
	payees : Payee[],
	showSidebar : boolean,
	accountBalances : AccountBalances,
	defaultDate : string,
	numberOptions : {
		numberOfDecimals : number,
		decimalSign : string,
		thousandsSign : string,
	},

	selectBudget : (a : Budget | undefined) => void,
	selectAccount : (a : Account) => void,
	openDialog : (a : string | [string, DialogParams]) => void,
	setAccounts : (a : Account[]) => void,
	setCategories : (a : Category[]) => void,
	setPayees : (a : Payee[]) => void,
	setShowSidebar : (a : boolean) => void,
	setAccountBalances : (a : AccountBalances) => void,
	setDefaultDate : (a : string) => void,
	updateAccountBalances : () => void,

	dialogBox : RefObject<HTMLDialogElement>,
}

export interface BBP {
	budgetNumbers : BudgetNumbers,
	setBudgetNumbers : (a : BudgetNumbers) => void,
	categoryToEdit : number | undefined,
	setCategoryToEdit : (a : number | undefined) => void,
	createCategory : (a : number | undefined) => void,
	currentMonth : number,
	showHidden : boolean,
}

export interface BAP {
	payeesById : {[key : number] : Payee},
	categoriesById : {[key : number] : Category},
	accountsById : {[key : number] : Account},
	registerCheckbox : (id : number | undefined, value? : boolean) => void,
	transactions : Transaction[],
	setTransactions : (a : Transaction[]) => void,
	accountId : number,
}

export interface DefaultProps {
	bp : BP,
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