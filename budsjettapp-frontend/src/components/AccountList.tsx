import React from 'react';
import { Link } from 'react-router-dom';

import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import prettyNumber from '../functions/prettyNumber';
import { useBudget } from '../contexts/BudgetContext';

function AccountList() {
	const {t, accounts, accountBalances, numberOptions, setShowSidebar, openDialog} = useBudget();

	return (
		<section className="account-list">
			<div className="account-list-header">
				<h2>{t.accounts}</h2>
				<button className="icon" onClick={() => openDialog('addAccount') }><Icon icon={faPlus} /></button>
			</div>
			{accounts.length ? accounts.map(el => <div className="account-list-account" key={el.id}>
				<p><Link to={el.id ? `/account/${el.id}` : '/'} onClick={() => setShowSidebar(false)}>{el.name}</Link></p>
				<p>{prettyNumber(accountBalances[el.id || 0] || 0, numberOptions)}</p>
				</div>) : <p className="no-accounts" onClick={() => openDialog('addAccount')}>{t.noAccountsCreated}</p>}
		</section>
	)
}

export default AccountList;