import React, {useState, useEffect, createContext, useContext} from 'react';

// Import CSS
import '../css/budget.css';
import { useBudget } from './BudgetContext';
import getAllDB from '../functions/database/getAllDB';
import { Account, Archive, Budget, Budgeted, Category, Payee, Transaction } from '../interfaces/interfaces';
import { useNavigate } from 'react-router-dom';
import getAllToSyncDB from '../functions/database/getAllToSyncDB';
import addAllFromSyncDB from '../functions/database/addAllFromSyncDB';
import getAccounts from '../functions/database/getAccounts';
import getCategories from '../functions/database/getCategories';
import getPayeesDB from '../functions/database/getPayeesDB';

const APIContext = createContext( {} as APIContextType );

export const APIProvider = (props : Props) => {

	const { db, activeBudget, selectBudget, deviceIdentifier, updateAccountBalances, setAccounts, setCategories, setPayees } = useBudget();

	// State: Access token to API
	const [token, setToken] = useState(undefined as string | undefined);

	// State: Is the app currently fetching data from the API?
	const [isFetching, setIsFetching] = useState(false);

	const [syncCount, setSyncCount] = useState(0);

	const [syncButtonPressedTimes, setSyncButtonPressedTimes] = useState(0);

	const navigate = useNavigate();

	useEffect(() => {
		if (activeBudget && activeBudget.id) {
			syncBudget();
		}
	}, [activeBudget?.id]);

	/**
	 * Fetch data from the API 
	 * @param endpoint - the API endpoint to access
	 */
	const fetchFromAPI = async ( path : string, options? : FetchOptions) => {
		const api = 'https://api.budsjett.app/v1/';

		let headers = {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		} as { [key : string] : string };

		if (options?.auth) {
			headers['Authorization'] = options.auth;
		}
		else if (token) {
			headers['Authorization'] = 'Bearer ' + token;
		}

		try {
			const response = await fetch(api + path, {
				headers: headers,
				method: options?.method || 'POST',
				mode: 'cors',
				credentials: 'include',
				body: options?.body ? JSON.stringify(options.body) : undefined,
			});
			const json = await response.json();

			if (json.accessToken) {
				setToken(json.accessToken);
			}
			return json;
		} catch (error) {
			console.log(error);

			return(
				{
					status: 0,
					error: 'OFFLINE',
				}
			)
		}
	}

	const syncBudget = async ( options? : {
		redirect : boolean,
		import : number,
	}) => {

		let budget : Archive | undefined;
		let url;
		let method : 'GET' | 'POST' | 'PATCH';

		if (options?.import) {
			url = `budgets/${options.import}/`;
			method = 'GET';
		}
		else {
			// If no active budget is set, we can't sync it, so abort.
			if (!activeBudget || !activeBudget.id) {
				return;
			}

			// Get budget content from database
			if (activeBudget.externalId) {
				budget = await getAllToSyncDB(db, activeBudget.id);

			}
			else {
				budget = await getAllDB(db, activeBudget.id);
			}

			// Save the number of rows to sync to state so it can be displayed on
			// the "Sync budget" button
			if (budget) {


				setSyncCount(Object.keys(budget).filter((el) => el !== 'budget').reduce((accumulator, current) => accumulator + (budget ? (budget[current] as Transaction[] | Budgeted[] | Account[] | Category[] | Payee[]).length : 0), ('sync' in budget.budget && budget.budget.sync ? 1 : 0)) );

			}

			// Set API URL and HTTP method based on whether this is the first upload or a later synchronization
			method = activeBudget.externalId ? 'PATCH' : 'POST';
			url = activeBudget.externalId ? `budgets/${activeBudget.externalId}/` : 'budgets/';
		}
		// Send sync data to API
		const result = await fetchFromAPI(url, {
			body: budget,
			method: method,
		});

		// If error, return the error
		if (!result.status) {
			// If user is not authenticated and sync button is pressed, send
			// user to login page
			if (options?.redirect && result.error === 'USER_NOT_AUTHENTICATED') {
				navigate('/log-in/');
			}

			return( result );
		}

		const returnValue = await addAllFromSyncDB(db, result.data, deviceIdentifier);
		if (options?.import || (activeBudget && activeBudget.sync)) {
			selectBudget(returnValue?.budget || result.data.budget);
		}
		setSyncCount(0);

		// Update changed variables
		if (result.data.accounts && activeBudget.id) {
			const syncedAccounts = await getAccounts(db, activeBudget.id || 0);
			setAccounts(syncedAccounts ? syncedAccounts : []);
		}
		if (result.data.categories && activeBudget.id) {
			const syncedCategories = await getCategories(db, activeBudget.id);
			setCategories(syncedCategories ? syncedCategories : []);

		}
		if (result.data.payees && activeBudget.id) {
			const syncedPayees = await getPayeesDB(db, activeBudget.id);
			setPayees(syncedPayees ? syncedPayees : []);
		}

		updateAccountBalances();
		return( returnValue );
	}

	const bp = {token, setToken, fetchFromAPI, isFetching,setIsFetching, syncBudget, syncCount, syncButtonPressedTimes, setSyncButtonPressedTimes} as APIContextType;

	return (
		<APIContext.Provider value={bp}>
			{props.children}
		</APIContext.Provider>
	)
}

export const useAPI = () => useContext(APIContext);

interface Props {
	 children : JSX.Element | JSX.Element[],
}

interface SyncResult {
	budget?: Budget,
	accounts?: Account[],
	categories?: Category[],
	budgeted?: Budgeted[],
	payees?: Payee[],
	transactions?: Transaction[],
	status?: number,
	error?: string,
}

export interface APIContextType {
	token : string,
	setToken : (a : string) => void,

	isFetching : boolean,
	setIsFetching : (a : boolean) => void,

	fetchFromAPI : (a : string, b? : object) => Promise<any>,

	syncBudget : ( options? : {
		redirect? : boolean,
		import? : number,
	} ) => Promise<SyncResult>,

	syncCount : number,

	syncButtonPressedTimes : number,
	setSyncButtonPressedTimes : ( a : number ) => void,
}

interface FetchOptions {
	body?: object,
	auth?: string,
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
}
