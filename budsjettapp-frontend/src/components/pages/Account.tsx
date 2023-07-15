import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Account as AccountType, Category, DefaultProps, Payee, Transaction } from '../../interfaces/interfaces'
import getTransactionsDB from '../../functions/database/getTransactionsDB';
import prettyNumber from '../../functions/prettyNumber';
import AddTransaction from './account/AddTransaction';
import formatDate from '../../functions/formatDate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil } from '@fortawesome/free-solid-svg-icons';

function Account(props : DefaultProps) {
	const {accounts, categories, payees, t, activeBudget, db, numberOptions, accountBalances} = props.bp;
	const params = useParams();
	const [transactions, setTransactions] = useState([] as Transaction[]);
	const [showAddNew, setShowAddNew] = useState('' as string);
	const accountId = Number(params.id);
	const [selectedTransactions, setSelectedTransactions] = useState([] as number[]);

	const account = accounts.filter(el => el.id === accountId).length ? accounts.filter(el => el.id === accountId)[0] : undefined;

	const categoriesById = categories.reduce((accumulator, value) => ({ ...accumulator, [value.id || -1]: value }), {} as {[key : number]: Category});
	categoriesById[0] = {budgetId: activeBudget.id || 0, name: t.income};

	const payeesById = payees.reduce((accumulator, value) => ({ ...accumulator, [value.id || -1]: value }), {} as {[key : number]: Payee});

	const accountsById = accounts.reduce((accumulator, value) => ({ ...accumulator, [value.id || -1]: value }), {} as {[key : number]: AccountType});

	useEffect(() => {
		if (account) {
			getTransactionsDB(db, activeBudget.id || 0, { account: accountId})
			.then((value) => {
				if (value) {
					setTransactions(value);
				}
			})
		}
	}, [accounts, accountId, activeBudget]);

	const updateAccount = (close? :  boolean, newTransaction? : Transaction) => {
		if (newTransaction) {
			const newTransactions = [ ... transactions.filter((el) => el.id !== newTransaction.id), newTransaction ];
			setTransactions(newTransactions);
		}
		if (close) {
			setShowAddNew('');
		}
	}

	const registerCheckbox = (id : number | undefined, value? : boolean)  => {
		let includeId : boolean;
		if (value === undefined) {
			includeId = !selectedTransactions.includes(id || -1);
		}
		else {
			includeId = value;
		}

		if (!id) {
			return;
		}
		if (includeId && selectedTransactions.includes(id)) {
			return;
		}
		if (includeId) {
			setSelectedTransactions([ ...selectedTransactions, id ]);
			return;
		}
		setSelectedTransactions(selectedTransactions.filter(el => el !== id));
		return;
	}

	if (!account) {
		return <main><p>{t.accountNotFound}</p></main>;
	}

	return (
		<main className="account-page">
			<div className="account-header">
				<div className="top-row">
					<h2>{account.name}</h2>
					<div className="account-searchbar">
						<input type="search" name="q" autoComplete='off' />
					</div>
				</div>
				<div className="second-row">
					<div className="account-header-buttons">
						<button className="button new-transaction-button" onClick={() => setShowAddNew('transaction')}>{t.newTransaction}</button>
						<button className="button" onClick={() => setShowAddNew('transfer')}>{t.newTransfer}</button>
						<button className="button">{t.scheduledPayments?.replace('{x}', '0')}</button>
						<button className="button">{t.reconcileAccount}</button>
						<button className="button">{t.accountSettings}</button>
					</div>
					<div className="account-balance">
						<h3>{t.accountBalance}</h3>
						<p className="account-balance-amount">{account.id && accountBalances[account.id] ? prettyNumber(accountBalances[account.id], numberOptions) : ''}</p>
					</div>
				</div>
			</div>
			<table className="transaction-list">
				<thead>
					<tr>
						<th className="checkbox-td"></th>
						<th className="date-td">{t.date}</th>
						<th className="payee-td">{t.payee}</th>
						<th className="category-td">{t.category}</th>
						<th className="memo-td">{t.memo}</th>
						<th className="out-td">{t.out}</th>
						<th className="in-td">{t.in}</th>
						<th className="edit-td"></th>
					</tr>
				</thead>
				<tbody>
					{showAddNew && account.id ? <AddTransaction bp={props.bp} updateAccount={updateAccount} accountId={account.id} isTransfer={showAddNew === 'transfer'} /> : undefined}
					{transactions
					.sort((a, b) => {
						if (a.date < b.date) {
							return 1;
						}
						if (a.date > b.date) {
							return -1;
						}
						if (a.id && b.id && a.id < b.id) {
							return 1;
						}
						return -1;
					})
					.map((el) => <tr className="transaction-row" key={el.id} onClick={() => registerCheckbox(el.id)}>
						<td className="checkbox-td"><input type="checkbox" checked={selectedTransactions.includes(el.id || -1)} onChange={(event) => registerCheckbox(el.id, event.target.checked)} /></td>
						<td className="date-td">{formatDate(el.date, t.dateFormat)}</td>
						<td className="payee-td">{el.payeeId ? payeesById[el.payeeId]?.name : (el.counterAccount ? accountsById[el.counterAccount]?.name : '')}</td>
						<td className="category-td">{el.categoryId === undefined ? '' : categoriesById[el.categoryId]?.name}</td>
						<td className="memo-td">{el.memo}</td>
						<td className="out-td">{el.out ? prettyNumber(el.out, numberOptions) : ''}</td>
						<td className="in-td">{el.in ? prettyNumber(el.in, numberOptions) : ''}</td>
						<td className="edit-td"><button className="icon-block"><FontAwesomeIcon icon={faPencil} /></button></td>
					</tr>)}
				</tbody>
			</table>
		</main>
	)
}

export default Account