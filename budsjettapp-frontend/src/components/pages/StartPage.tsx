import React, {useState, useEffect} from 'react'
import getBudgets from '../../functions/database/getBudgets';
import { Budget } from '../../interfaces/interfaces';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowDown } from '@fortawesome/free-solid-svg-icons';

import { useNavigate } from 'react-router-dom';
import { useBudget } from '../../contexts/BudgetContext';
import { useAPI } from '../../contexts/APIContext';
import Loading from '../Loading';
import ErrorMessage from '../utils/ErrorMessage';

function StartPage() {
	const {t, db, selectBudget, openDialog} = useBudget();
	const {fetchFromAPI, isFetching, setIsFetching, syncBudget} = useAPI();
	const [allBudgets, setAllBudgets] = useState([] as Budget[]);
	const [showAllBudgets, setShowAllBudgets] = useState(false);
	const [loggedIn, setLoggedIn] = useState(false);
	const [showLoginForm, setShowLoginForm] = useState(false);
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [downloadComplete, setDownloadComplete] = useState(false);
	const [error, setError] = useState('');

	const budgetsToShow = 3;

	const navigate = useNavigate();

	useEffect(() => {
		if (db) {
			getBudgets(db)
			.then((value) => {
				setAllBudgets(Array.isArray(value) ? value : []);
			});
		}
	}, [db]);

	useEffect(() => {
		if (loggedIn) {
			fetchBudgets();
		}
	}, [loggedIn]);

	const fetchBudgets = async () => {
		const result = await fetchFromAPI('budgets/', {
			method: 'GET',
		});

		if (result.status === 1) {
			setLoggedIn(true);
			let newAllBudgets = [ 
				...allBudgets,
				...result.data
				.map((el : {
					id : number,
					name : string,
					role : number,
					updated : string,
				}) => {
					return {
						name: el.name,
						externalId: el.id,
						lastSyncDate: el.updated,
					} as Budget;
				})
				.filter((el : Budget) => el.externalId && !allBudgets.map(el2 => el2.externalId || 0).includes(el.externalId))
			];
			setDownloadComplete(true);
			setAllBudgets(newAllBudgets);
			setShowAllBudgets(true);
		}
		else {
			if (result.error === 'USER_NOT_AUTHENTICATED') {
				setShowLoginForm(true);
			}
		}
	}

	const onLoginSubmit = async (event : React.FormEvent) => {
		event.preventDefault();		
		if (!username || !password) {
			return;
		}
		setIsFetching(true);
		let result;
		const auth = 'Basic ' + window.btoa(`${username}:${password}`);
		result = await fetchFromAPI('users/', {
			auth: auth,
		});
		setIsFetching(false);
		console.log(result);
		if (result.status === 0) {
			setError(result.error);
		}
		else {
			setLoggedIn(true);
			setShowLoginForm(false);
		}
	}

	return (
		<main className="settings">
			<h1 className="app-name">{t.appName}</h1>
			{allBudgets
				.sort((a, b) => {
					const date1 = a.lastSyncDate || '';
					const date2 = b.lastSyncDate || '';
					if (date1 >= date2) {
						return -1;
					}
					return 1;
				})
				.slice(0, showAllBudgets ? undefined : budgetsToShow)
				.map((el, index) => el.id ? <button 
				className={`button select-budget`}
				onClick={() => {
					selectBudget(el);
					navigate('/');
				}}
				key={index}
				>
					{el.name}
				</button> : <button 
					className='button select-budget cloud-budget'
					onClick={async () => {
						const importedBudget = await syncBudget({
							import: el.externalId,
						})
						selectBudget(importedBudget.budget);
						navigate('/');
					}}
					key={index}
					>
						{!el.id ? <FontAwesomeIcon icon={faCloudArrowDown} /> : undefined}
						<span>{el.name}</span>
					</button>)}
			{allBudgets.length > budgetsToShow && !showAllBudgets ? <button className="button select-budget" onClick={() => setShowAllBudgets(true)}>{t.showAllBudgets}</button> : undefined}
			<button className="button" onClick={() => openDialog('addBudget')}>{t.newBudget}</button>
			{error ? <ErrorMessage text={t[`error_${error}`] ? t[`error_${error}`] : error} setError={setError} /> : undefined}
			{
				downloadComplete || isFetching ? undefined :
				(showLoginForm
				?
				<form className='dialog-form budget-select-login' onSubmit={onLoginSubmit}>
					<h2>{t.logIn}</h2>
					<p><label htmlFor="username">{t.username}</label></p>
					<input type="text" name="username" id="username" required autoComplete='username' value={username} onChange={(event) => setUsername(event.target.value)} />
					<p><label htmlFor="password">{t.password}</label></p>
					<input type="password" name="password" id="password" required autoComplete='current-password' value={password} onChange={(event) => setPassword(event.target.value)} />
					{isFetching ? <Loading /> : <button type="submit" className="button">{t.logIn}</button>}
				</form>
					: 
				<button className="button" onClick={() => fetchBudgets()}>{t.downloadBudget}</button>)
			}
		</main>
	)
}

export default StartPage;