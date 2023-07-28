import React, { useEffect, useState } from 'react'
import Collapsible from '../utils/Collapsible';
import { useBudget } from '../../contexts/BudgetContext';

function LogIn() {
	const {t, activeBudget} = useBudget();

	const [mode, setMode] = useState((activeBudget?.externalId ? "login" : "create") as 'login' | 'create');

	useEffect(() => {
		setMode(activeBudget?.externalId ? "login" : "create");
	}, [activeBudget]);

  return (
	<main className="subsettings">
		<h2 className="main-heading">{mode === 'login' ? t.logIn : t.createUser}</h2>
		<p><button className="link">{t.iHaveAnUser}</button></p>
		<form className='dialog-form'>
			<p><label htmlFor="username">{mode === 'login' ? t.username : t.pleaseSelectAnUsername}</label></p>
			<input type="text" name="username" id="username" />
			<p><label htmlFor="password">{mode === 'login' ? t.username : t.pleaseSelectAPassword}</label></p>
			<input type="password" name="password" id="password" />
			<p>{t.aboutCloudStorage}</p>
			<Collapsible linkText={t.createUserWhyPay} text={<ul className="why-pay">{[1, 2, 3, 4].map(el => <li key={el}>{t[`advantagesBullet${el}`]}</li>)}</ul>} />
			<Collapsible linkText={t.createUserWhatHappensIfCancelled} text={t.createUserWhatHappensIfCancelledText} />
			<button type="submit" className="button">{t.startFreeTrial}</button>
		</form>
	</main>
  )
}

export default LogIn