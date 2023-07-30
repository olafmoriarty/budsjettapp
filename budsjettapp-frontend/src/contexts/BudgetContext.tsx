import React, {useState, useEffect, useRef, createContext, useContext, RefObject} from 'react';
import { useNavigate } from 'react-router-dom';
import { IDBPDatabase } from 'idb';

// Import CSS
import '../css/budget.css';

// Import components
import Loading from '../components/Loading';

// Import functions
import yyyymmdd from '../functions/yyyymmdd';
import createDatabase from '../functions/database/createDatabase';
import getAccountBalancesDB from '../functions/database/getAccountBalancesDB';
import getAccounts from '../functions/database/getAccounts';
import getCategories from '../functions/database/getCategories';
import getPayeesDB from '../functions/database/getPayeesDB';

// Import types and interfaces
import { Account, Budget, BudgetInterface, Category, Payee, AccountBalances, DialogParams } from '../interfaces/interfaces';

const BudgetContext = createContext( {
	db: undefined,
	t: {},
	dialogToShow: '',
} as BP );

export const BudgetProvider = (props : Props) => {

	// State: Has the page completed loading?
	const [pageLoaded, setPageLoaded] = useState(false);

	// State: If a budget has been selected, which budget is it?
	const [activeBudget, setActiveBudget] = useState(undefined as Budget | undefined);

	// State: What accounts exist in the active budget?
	const [accounts, setAccounts] = useState([] as Account[]);

	// State: What categories exist in the active budget?
	const [categories, setCategories] = useState([] as Category[]);

	// State: What payees exist in the active budget?
	const [payees, setPayees] = useState([] as Payee[]);

	// State: What are the balances of the accounts in the active budget?
	const [accountBalances, setAccountBalances] = useState({} as AccountBalances);

	// State: Connection to the Indexed.db database
	const [db, setDatabase] = useState(undefined as IDBPDatabase<BudgetInterface> | undefined);

	// State: Which dialog should be shown?
	const [dialogToShow, setDialogToShow] = useState(''); 

	// State: Is the sidebar visible on mobile screens?
	const [showSidebar, setShowSidebar] = useState(true);

	// State: What was the last date entered into the system?
	const [defaultDate, setDefaultDate] = useState(yyyymmdd(new Date()));

	// State: Access token to API
	const [token, setToken] = useState(undefined as string | undefined);

	// Ref: The <dialog> box used to display dialogs
	const dialogBox = useRef<HTMLDialogElement>(null);

	// Get app language
	const lang = 'nn';

	// Fetch language files
	const t = require(`../languages/${lang}.json`);
	
	// Get the navigate function from react-router-dom
	const navigate = useNavigate();

	/**
	 * Changes the active budget.
	 * @param budget - The new budget.
	 */
	const selectBudget = (budget : Budget | undefined) => {
		setActiveBudget(budget);
	}

	// Effect: On mount, connect to the database. Also, check if localstorage contains a budget, and if it does, select it.
	useEffect(() => {
		createDatabase()
		.then(database => {
			setDatabase(database);
			setPageLoaded(true);
			if (localStorage.getItem("activeBudget")) {
				selectBudget(JSON.parse(localStorage.getItem("activeBudget") || "{}"));
			}
		});
	}, []);

	// Effect: Whenever the active budget changes, populate all variables. Also, go to the budget screen, show the sidebar on mobile screens, and save the active budget to localStorage.
	useEffect(() => {
		if (activeBudget && activeBudget.id) {
			getAccounts(db, activeBudget.id)
			.then((el) => setAccounts(el ? el : []));
			getCategories(db, activeBudget.id)
			.then((el) => setCategories(el ? el : []));
			getPayeesDB(db, activeBudget.id)
			.then((el) => setPayees(el ? el : []));
			updateAccountBalances();

			setShowSidebar(true);
			localStorage.setItem("activeBudget", JSON.stringify(activeBudget));
		}
		else {
			// Clear out cache if no budget is set
			setAccounts([]);
			setCategories([]);
			setPayees([]);
			setAccountBalances({});
		}
	}, [activeBudget]);

	// Return error if indexedDB is not supported
	if (!('indexedDB' in window)) {
		return <div>
			<p>{t.errorNoIndexedDB}</p>
		</div>
	}

	// If the page hasn't loaded yet, display loading screen
	if (!pageLoaded) {
		return (
			<>
				<div className="sidebar sidebar-no-budget"></div>
				<main className="settings">
					<Loading />
				</main>
			</>
		);
	}

	/**
	 * Navigates to the given account.
	 * @param account - The account to navigate to.
	 */
	const selectAccount = (account : Account) => {
		navigate(`/account/${account.id}`);
	}

	/**
	 * Opens the dialog box that matches the given identifier.
	 * @param identifier - a string containing the name of the dialog box to display. 
	 */
	const openDialog = (identifier : string) => {
		setDialogToShow(identifier);
		if (identifier && dialogBox.current) {
			dialogBox.current.showModal();
		}
	}

	/* Get the options for how numeral strings are displayed. These can be
	   changed by the user and stored in localStorage. If the user has not
	   changed them, use the settings found in the language file. */
	const numberOptions = {
		numberOfDecimals: Number(t.numberOfDecimals),
		decimalSign: t.decimalSign,
		thousandsSign: t.thousandsSign,
	};

	/**
	 * Fetch the calculated account balances and save the values to state
	 */
	const updateAccountBalances = () => {
		if (activeBudget?.id) {
			getAccountBalancesDB(db, activeBudget.id)
			.then((el) => setAccountBalances(el));
		}
	}

	/**
	 * Fetch data from the API 
	 * @param endpoint - the API endpoint to access
	 */
	const fetchFromAPI = async ( path : string, options? : FetchOptions) => {
		const api = 'https://testapi.budsjett.app/v1/';

		/*
		// If we're trying to upload a budget, first check if budget exists
		if (endpoint === 'sync' && (!activeBudget || !activeBudget.id)) {
			return;
		}

		let authToken = token;

		// If we're updating a budget, assume a refresh token exists
		// - if not, check if it does before sending a giant file to the server
		if (endpoint === 'sync' && !activeBudget?.externalId && !authToken) {
			const response = await fetch(api + 'auth/', {
				method: 'POST',
				mode: 'cors',
				credentials: 'include',
			});
			const json = await response.json();
			if (json.authToken) {
				authToken = json.authToken;
				setToken(json.authToken);
			}
			else if (json.status === 0) {
				console.log(json.error);
				navigate('/log-in');
				return;
			}
		}
		*/

		let headers = {
			'Content-Type': 'application/json',
		} as { [key : string] : string };

		if (token) {
			headers['Authorization'] = token;
		}

		const response = await fetch(api + path, {
			headers: headers,
			method: 'POST',
			mode: 'cors',
			credentials: 'include',
			body: options?.body ? JSON.stringify(options.body) : undefined,
		});
		const json = await response.json();

		if (json.accessToken) {
			setToken(json.accessToken);
		}
		console.log(json);
		return json;
	}

	interface FetchOptions {
		body?: object,
		auth?: string,
	}

	const bp = {db, t, activeBudget, selectBudget, selectAccount, openDialog, dialogBox, accounts, setAccounts, categories, setCategories, payees, setPayees, showSidebar, setShowSidebar, accountBalances, setAccountBalances, numberOptions, defaultDate, setDefaultDate, updateAccountBalances, dialogToShow} as BP;

	return (
		<BudgetContext.Provider value={bp}>
			{props.children}
		</BudgetContext.Provider>
	)
}

export const useBudget = () => useContext(BudgetContext);

interface Props {
	 children : JSX.Element | JSX.Element[],
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
	dialogToShow : string | [string, DialogParams],
}
