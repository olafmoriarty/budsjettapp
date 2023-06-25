import React, { useState, useEffect } from 'react';
import { Account, Transaction, BudgetProps, Category } from './types/types';
import numberParser from './functions/numberParser';
import AccountPage from './components/account/AccountPage';
import Sidebar from './components/sidebar/Sidebar';

import './css/index.css';
import NewAccount from './components/dialogs/NewAccount';
import MenuButton from './components/basics/MenuButton';
import BudgetScreen from './components/budget/BudgetScreen';
import ymd from './functions/ymd';

function App() {

	console.log(ymd());

	const [storageFetched, setStorageFetched] = useState(false);

	const [budgetInfo, setBudgetInfo] = useState({name: 'Min privatøkonomi'});
	const [categories, setCategories] = useState<Category[]>([
	]);
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [accountToShow, setAccountToShow] = useState(0);
	const [pageToShow, setPageToShow] = useState<Keyword>();
	const [dialogToShow, setDialogToShow] = useState<Keyword>();
	const [showMobileMenu, setShowMobileMenu] = useState(true);
	
	let pageToShowTag : JSX.Element | undefined;
	let dialogToShowTag : JSX.Element | undefined;

	// Import language files
	const t : Dictionary = require('./languages/nb.json');

	useEffect(() => { // When the script starts running ...
		if (!storageFetched) {

			// Get accounts from storage
			const storedAccounts = localStorage.getItem('accounts');
			if (storedAccounts) {
				setAccounts(JSON.parse(storedAccounts));
			}

			// Get transactions from storage
			const storedTransactions = localStorage.getItem('transactions');
			if (storedTransactions) {
				setTransactions(JSON.parse(storedTransactions));
			}

			setStorageFetched(true);
		}
	}, []);

	useEffect(() => { // When an account is changed ...
		if (storageFetched) {
			localStorage.setItem('accounts', JSON.stringify(accounts));
		}
	}, [accounts]);

	useEffect(() => { // When a transaction is changed ...

		const accountBalances = transactions.reduce((previous, current) => {
			const obj = previous;
			obj[current.accountId] = (obj[current.accountId] ? obj[current.accountId] : 0) + (current.in ? current.in : 0) - (current.out ? current.out : 0);
			return obj;
		}, {} as AccountBalanceObject);

		interface AccountBalanceObject {
			[index : number]: number
		}

		// Store transactions in localStorage
		if (storageFetched) {
			localStorage.setItem('transactions', JSON.stringify(transactions));
		}
	}, [transactions]);

	const addTransaction = (formData : {date : string, accountId: number, memo?: string, categoryId?: number, in?: number, out?: number}) => {
		const transactionIds = transactions.map(el => el.id);
		let id = 0;
		for (let i = -1; ; i--) {
			if (!transactionIds.includes(i)) {
				id = i;
				break;
			}
		}
		const newTransaction : Transaction = {
			id: id,
			date: formData.date,
			accountId: formData.accountId,
			in: formData.in ? formData.in : 0,
			out: formData.out ? formData.out : 0,
			categoryId: formData.categoryId ? formData.categoryId : 0,
			memo: formData.memo ? formData.memo : "",
		};

		const allTransactions = [ ...transactions ];
		allTransactions.push(newTransaction);
		setTransactions(allTransactions);
	}

	const addAccount = (formData : {name : string, balance : string, balanceDate : string}) => {
		const accountNumbers = accounts.map(el => el.id);
		let id = 0;
		for (let i = -1; ; i--) {
			if (!accountNumbers.includes(i)) {
				id = i;
				break;
			}
		}
		const parsedBalance = numberParser(formData.balance);
		const newAccount : Account = {
			id: id,
			name: formData.name,
		};
		const allAccounts = [ ...accounts ];
		allAccounts.push(newAccount);
		setAccounts(allAccounts);
		addTransaction({
			date: formData.balanceDate,
			accountId: id,
			categoryId: 0,
			memo: "Inngående kontobalanse",
			in: parsedBalance > 0 ? parsedBalance : 0,
			out: parsedBalance < 0 ? -parsedBalance : 0,
		})

		showAccount(id);
	}

	const showAccount = (id : number) => {
		setAccountToShow(id);
		setPageToShow('account');
		setDialogToShow(undefined);
		setShowMobileMenu(false);
	}

	// Build an object containing all the information needed throughout the app
	const bp : BudgetProps = {
		t: t,
		budgetInfo: budgetInfo,

		accounts: accounts,
		accountToShow: accountToShow,

		categories: categories,

		transactions: transactions,

		setPageToShow: setPageToShow,
		setDialogToShow: setDialogToShow,
		showMobileMenu: showMobileMenu,
		setShowMobileMenu: setShowMobileMenu,
		addAccount: addAccount,
		showAccount: showAccount,
	}

	switch (pageToShow) {
		case 'account':
			pageToShowTag = <AccountPage bp={bp} />;
			break;
		
		default:
			pageToShowTag = <BudgetScreen bp={bp} />;
			break;
	}

	switch (dialogToShow) {
		case 'newAccount':
			dialogToShowTag = <NewAccount bp={bp} />;
			break;
	
		default:
			break;
	}

	return (
		<div className="budsjettapp">
			<MenuButton
				bp={bp}
			/>
			<Sidebar
				bp={bp}
			/>
			{pageToShowTag}
			{dialogToShowTag}
		</div>
	);
}

type Keyword = string | undefined;
interface Dictionary {
	[index: string]: string,
}

export default App;