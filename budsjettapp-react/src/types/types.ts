export interface BudgetProps {
	budgetInfo: any,
	accounts: Account[],
	accountToShow: number,
	categories: Category[],
	transactions: Transaction[],
	setPageToShow: Function,
	setDialogToShow: Function,
	showMobileMenu: boolean,
	setShowMobileMenu: Function,
	addAccount: Function,
	showAccount: Function,
	t: {[index : string]: string},
}

export interface Account {
	id: number,
	name: string,
}

export interface Category {
	id: number,
	name: string,
	order?: number,
	parent?: number,
}

export interface FormField {
	name: string,
	label?: string,
	type? : string,
	required?: boolean,
	default?: string,
}

export interface Transaction {
	id: number,
	date: string,
	accountId: number,
	payeeId?: number,
	categoryId?: number,
	memo?: string,
	in?: number,
	out?: number,
	synced?: boolean,
}