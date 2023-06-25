import React, {useState, useEffect, useRef} from 'react';

import { IDBPDatabase } from 'idb';
import { BP, Account, Budget, BudgetInterface, Category, Payee } from './interfaces/interfaces';

import { useNavigate } from 'react-router-dom';

import './css/budget.css';

import createDatabase from './functions/database/createDatabase';
import Sidebar from './components/Sidebar';
import Content from './components/Content';
import Dialog from './components/Dialog';
import getAccounts from './functions/database/getAccounts';

function App() {

	const [pageLoaded, setPageLoaded] = useState(false);
	const [activeBudget, setActiveBudget] = useState(undefined as Budget | undefined);
	const [accounts, setAccounts] = useState([] as Account[]);
	const [categories, setCategories] = useState([] as Category[]);
	const [payees, setPayees] = useState([] as Payee[]);

	const [db, setDatabase] = useState(undefined as IDBPDatabase<BudgetInterface> | undefined);
	const [dialogToShow, setDialogToShow] = useState(''); 
	const [showSidebar, setShowSidebar] = useState(true);
	const dialogBox = useRef<HTMLDialogElement>(null);

	// Get app language
	const lang = 'nn';

	// Fetch language files
	const t = require(`./languages/${lang}.json`);

	const navigate = useNavigate();

	useEffect(() => {
		createDatabase()
		.then(database => {
			setDatabase(database);
			setPageLoaded(true);
		});
	}, []);

	// Return error if indexedDB is not supported
	if (!('indexedDB' in window)) {
		return <div>
			<p>{t.errorNoIndexedDB}</p>
		</div>
	}

	if (!pageLoaded) {
		return (
			<>
				<div className="sidebar sidebar-no-budget"></div>
				<main className="settings">
					<p className="loading">{t.loading}</p>
				</main>
			</>
		);
	}

	const selectBudget = (el : Budget) => {
		setActiveBudget(el);
		if (el && el.id) {
			getAccounts(db, el.id)
			.then((el) => setAccounts(el ? el : []));

		}
		setShowSidebar(true);
		navigate('/');
	}

	const selectAccount = (el : Account) => {
		navigate(`/accounts/${el.id}`);
	}

	const openDialog = (name : string) => {
		
		setDialogToShow(name);
		if (dialogBox.current) {
			dialogBox.current.showModal();
		}
	}

	const bp = {db, t, activeBudget, selectBudget, selectAccount, openDialog, dialogBox, accounts, setAccounts, categories, setCategories, setShowSidebar} as BP;

	return (
		<>
			<Sidebar bp={bp} showSidebar={showSidebar} />
			<Content bp={bp} />
			<Dialog bp={bp} dialogToShow={dialogToShow} />
		</>
	);

}

export default App;
