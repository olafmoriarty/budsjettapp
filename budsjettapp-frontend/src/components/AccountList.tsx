import React from 'react';
import { Link } from 'react-router-dom';

import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import { DefaultProps } from '../interfaces/interfaces';

function AccountList(props : DefaultProps) {
	const {t, accounts} = props.bp;

	return (
		<section className="account-list">
			<div className="account-list-header">
				<h2>{t.accounts}</h2>
				<button className="icon" onClick={() => props.bp.openDialog('addAccount') }><Icon icon={faPlus} /></button>
			</div>
			{accounts.length ? accounts.map(el => <div className="account-list-account" key={el.id}>
				<p><Link to={el.id ? `/account/${el.id}` : '/'}>{el.name}</Link></p>
				<p>1 000,00</p>
				</div>) : <p className="no-accounts">{t.noAccountsCreated}</p>}
		</section>
	)
}

export default AccountList;