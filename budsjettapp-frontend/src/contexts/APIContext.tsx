import React, {useState, createContext, useContext} from 'react';

// Import CSS
import '../css/budget.css';
import { useBudget } from './BudgetContext';
import getAllDB from '../functions/database/getAllDB';
import addBudget from '../functions/database/addBudget';
import { Account, Budget, Budgeted, Category, Payee, Transaction } from '../interfaces/interfaces';

const APIContext = createContext( {} as APIContextType );

export const APIProvider = (props : Props) => {

	const { db, activeBudget, selectBudget } = useBudget();

	// State: Access token to API
	const [token, setToken] = useState(undefined as string | undefined);

	// State: Is the app currently fetching data from the API?
	const [isFetching, setIsFetching] = useState(false);

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
			'Accept': 'application/json',
		} as { [key : string] : string };

		if (token) {
			headers['Authorization'] = 'Bearer ' + token;
		}

		console.log(api + path);
		try {
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

	const syncBudget = async () => {
		if (!activeBudget || !activeBudget.id) {
			return;
		}
		const budget = await getAllDB(db, activeBudget.id);
		const mode = activeBudget.externalId ? 'sync' : 'create';
		console.log(budget);
		const result = await fetchFromAPI(`budgets/?mode=${mode}`, {
			body: budget,
		});
		console.log(result);

		if (!result.status) {
			return( result );
		}
		if (activeBudget.sync) {
			await addBudget(db, result.data.budget);
			selectBudget(result.data.budget);
		}
		return( result );
	}

	interface FetchOptions {
		body?: object,
		auth?: string,
	}

	const bp = {token, setToken, fetchFromAPI, isFetching,setIsFetching, syncBudget} as APIContextType;

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
	status: number,
	error?: string,
	data?: {
		budget?: Budget,
		accounts?: Account[],
		categories?: Category[],
		budgeted?: Budgeted[],
		payees?: Payee[],
		transactions?: Transaction[],
	}
}

export interface APIContextType {
	token : string,
	setToken : (a : string) => void,

	isFetching : boolean,
	setIsFetching : (a : boolean) => void,

	fetchFromAPI : (a : string, b? : object) => Promise<any>,

	syncBudget : () => Promise<SyncResult>,
}

