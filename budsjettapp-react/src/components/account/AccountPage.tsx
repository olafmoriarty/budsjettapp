import React, { useState } from 'react';
import accountTotals from '../../functions/accountTotals';
import prettyNumber from '../../functions/prettyNumber';
import { BudgetProps } from '../../types/types';
import AccountTransaction from './AccountTransaction';
import NewTransaction from './NewTransaction';

function AccountPage(props : Props) {
	const transactions = props.bp.transactions.filter(el => el.accountId === props.bp.accountToShow);
	const accountDetails = props.bp.accounts.filter(el => el.id === props.bp.accountToShow)[0];

	const [showNewForm, setShowNewForm] = useState(false);

	const balances = accountTotals(transactions, props.bp.accountToShow);

	return (
		<main className="account-page">
			<h1>{accountDetails.name}</h1>
			<table>
				<thead>
					<tr>
						<th>Dato</th>
						<th>Fra/til</th>
						<th>Kategori</th>
						<th>Kommentar</th>
						<th>Inn</th>
						<th>Ut</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{transactions.map(el => <AccountTransaction showAccount={false} details={el} key={el.id} />)}
					{showNewForm ? <NewTransaction setShowNewForm={setShowNewForm} /> : undefined}
				</tbody>
			</table>
			<div className="account-settings">
				<button className="button" onClick={() => setShowNewForm(true)}>Ny transaksjon</button>
			</div>

			<div className="account-balances">
				{prettyNumber(balances.total)}
			</div>
		</main>
	)
}

interface Props {
	bp: BudgetProps,
}

export default AccountPage;