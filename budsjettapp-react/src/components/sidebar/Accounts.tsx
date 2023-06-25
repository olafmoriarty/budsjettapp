import React from 'react';
import accountTotals from '../../functions/accountTotals';
import prettyNumber from '../../functions/prettyNumber';
import { BudgetProps } from '../../types/types';

function Accounts(props : Props) {
	const {accounts, setDialogToShow, showAccount} = props.bp;

	return (
		<div className="accounts">
			<h2>Kontoer</h2>
			{accounts.length ? accounts.map(el => {
				const balance = accountTotals(props.bp.transactions, el.id).total;
				return <div className="account" key={el.id}>
					<div className="account-name">
						<button className="link" onClick={() => showAccount(el.id)}>{el.name}</button>
					</div>
					<div className={`account-balance${balance < 0 ? " negative" : ""}`}>
						{prettyNumber(balance)}
					</div>
				</div>;
			}) : <p className="no-accounts">Ingen kontoer registrert</p>}
			<button onClick={() => setDialogToShow('newAccount')} className="button">Opprett ny konto</button>
		</div>
	)
}

interface Props {
	bp: BudgetProps,
}

export default Accounts