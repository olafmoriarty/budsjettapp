import React, { useEffect, useState } from 'react';
import Collapsible from '../utils/Collapsible';
import { useBudget } from '../../contexts/BudgetContext';
import { useAPI } from '../../contexts/APIContext';
import Loading from '../Loading';
import ErrorMessage from '../utils/ErrorMessage';
import Warning from '../utils/Warning';
import { useNavigate } from 'react-router-dom';

function LogIn() {
	const {t, activeBudget} = useBudget();
	const {fetchFromAPI, isFetching, setIsFetching} = useAPI();

	const [mode, setMode] = useState((activeBudget?.externalId ? "login" : "create") as 'login' | 'create');

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const [error, setError] = useState('');

	const navigate = useNavigate();
	useEffect(() => {
		setMode(activeBudget?.externalId ? "login" : "create");
	}, [activeBudget]);

	const onSubmit = async (event : React.FormEvent) => {
		event.preventDefault();		
		if (!username || !password) {
			return;
		}
		setIsFetching(true);
		let result;
		if (mode === 'create') {
			result = await fetchFromAPI('users/?mode=create', {
				body: {
					username: username,
					password: password,
				}
			});
		}
		else {
			const auth = 'Basic ' + window.btoa(`${username}:${password}`);
			result = await fetchFromAPI('users/', {
				auth: auth,
			});
		}
		setIsFetching(false);
		if (result.status === 0) {
			setError(result.error);
		}
		else {
			navigate('/');
		}
	}

	let newUserInfo = null as JSX.Element | null;

	if (mode === 'create') {
		newUserInfo = <>
			<p><strong>{t.aboutCloudStorage}</strong></p>
			<Collapsible linkText={t.createUserWhyPay} text={<ul className="why-pay">{[1, 2, 3, 4].map(el => <li key={el}>{t[`advantagesBullet${el}`]}</li>)}</ul>} />
			<Collapsible linkText={t.createUserWhatHappensIfCancelled} text={t.createUserWhatHappensIfCancelledText} />
		</>

	}
	return (
	<main className="subsettings">
		<h2 className="main-heading">{mode === 'login' ? t.logIn : t.createUser}</h2>
		{mode === 'create' && activeBudget?.externalId ? <Warning>{t.warningUserProbablyExists}</Warning> : undefined}
		{error ? <ErrorMessage text={t[`error_${error}`] ? t[`error_${error}`] : error} setError={setError} /> : undefined}
		<p>{mode === 'login' ?
		<button className="link" onClick={() => setMode('create')}>{t.iDontHaveAnUser}</button> :
		<button className="link" onClick={() => setMode('login')}>{t.iHaveAnUser}</button>}</p>
		<form className='dialog-form' onSubmit={onSubmit}>
			<p><label htmlFor="username">{mode === 'login' ? t.username : t.pleaseSelectAnUsername}</label></p>
			<input type="text" name="username" id="username" required autoComplete='username' value={username} onChange={(event) => setUsername(event.target.value)} />
			<p><label htmlFor="password">{mode === 'login' ? t.password : t.pleaseSelectAPassword}</label></p>
			<input type="password" name="password" id="password" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} />
			{newUserInfo}
			{isFetching ? <Loading /> : <button type="submit" className="button">{mode === 'login' ? t.logIn : t.startFreeTrial}</button>}
		</form>
	</main>
	)
}

export default LogIn;