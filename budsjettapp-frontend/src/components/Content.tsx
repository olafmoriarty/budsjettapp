import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Loading from './Loading';
import StartPage from './pages/StartPage';
import Settings from './pages/Settings';
import Account from './pages/Account';
import EditBudget from './pages/settings/EditBudget';
import LogIn from './pages/LogIn';
import { useBudget } from '../contexts/BudgetContext';

const ExportBudget = lazy(() => import('./pages/settings/ExportBudget'));
const BudgetScreen = lazy(() => import('./pages/BudgetScreen'));

function Content() {
	const bp = useBudget();

	const [password, setPassword] = useState('');
	const [loggedIn, setLoggedIn] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		const isLoggedIn = localStorage.getItem('isLoggedIn');
		if (isLoggedIn !== 'YES') {
			setLoggedIn(false);
		}
	}, []);

	const checkPassword = (event : React.FormEvent) => {
		event.preventDefault();
		if (password === 'Hallgeir') {
			localStorage.setItem('isLoggedIn', 'YES');
			setLoggedIn(true);
		}
		else {
			setError(true);
		}
	}

	if (!loggedIn) {
		return <main className="settings">
			<form className="dialog-form budget-select-login" onSubmit={checkPassword}>
			<h2>Oppgi invitasjonskode</h2>
			{error ? <p className="error">Feil kode</p> : undefined}
				<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
				<button className="button" type="submit">Få tilgang til Budsjett.app</button>
			</form>
			<p><a href="https://app.us9.list-manage.com/subscribe?u=7df3c4c3a46685b44f7d8682c&id=d09257588c">Send meg ein e-post når appen er tilgjengelig</a></p>
		</main>
	}

	if (!bp.activeBudget) {
		return <StartPage />
	}

	return <Suspense fallback={<Loading />}>
		<Routes>
			<Route path="/settings" element={<Settings />} />
			<Route path="/settings/select-budget" element={<StartPage />} />
			<Route path="/settings/edit-budget" element={<EditBudget />} />
			<Route path="/settings/export-budget" element={<ExportBudget />} />
			<Route path="/account/:id" element={<Account />} />
			<Route path="/log-in" element={<LogIn />} />
			<Route path="/*" element={<BudgetScreen />} />
		</Routes>
	</Suspense>
}
export default Content;