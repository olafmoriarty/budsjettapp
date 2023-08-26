import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Account as AccountType, Category, Payee, Transaction } from '../../interfaces/interfaces'
import getTransactionsDB from '../../functions/database/getTransactionsDB';
import prettyNumber from '../../functions/prettyNumber';
import AddTransaction from './account/AddTransaction';
import AccountTransaction from './account/AccountTransaction';
import { useBudget } from '../../contexts/BudgetContext';
import { useAPI } from '../../contexts/APIContext';
import deleteTransactionDB from '../../functions/database/deleteTransactionDB';

function Account() {
	const {accounts, categories, payees, t, activeBudget, db, numberOptions, accountBalances, openDialog, updateAccountBalances} = useBudget();
	const {syncBudget} = useAPI();
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

	useEffect(() => {
		syncBudget();
	}, [transactions]);

	const deleteTransaction = async (transactionToDelete : Transaction) => {
		await deleteTransactionDB(db, transactionToDelete);
		updateAccountBalances();
		const newTransactions = [ ... transactions.filter((el) => el.id !== transactionToDelete.id)];
		setTransactions(newTransactions);
		await syncBudget();
	}

	const updateAccount = async (close? :  boolean, newTransaction? : Transaction | Transaction[]) => {
		if (close) {
			setShowAddNew('');
		}
		if (newTransaction) {
			const newTransactions = Array.isArray(newTransaction) ? [ ...transactions.filter(el => !newTransaction.map(el2 => el2.id).includes(el.id)) ].concat(newTransaction) : [ ...transactions.filter((el) => el.id !== newTransaction.id), newTransaction ];
			setTransactions(newTransactions);
			const syncedResult = await syncBudget();
			if (syncedResult.status !== 0) {
				const syncedTransactions = syncedResult.transactions?.filter(el => el.accountId === accountId) || [];
				const unsyncedTransactions = newTransactions.filter(el => !syncedTransactions?.map(syncedEl => syncedEl.id).includes(el.id));
				setTransactions([ ...unsyncedTransactions, ...syncedTransactions ])
			}
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

	const bap = {payeesById, categoriesById, accountsById, registerCheckbox, accountId, transactions, setTransactions, deleteTransaction};
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
						<button className="button" onClick={() => openDialog(['editAccount', {
							account: account,
						}])}>{t.accountSettings}</button>
					</div>
					<div className="account-balance">
						<h3>{t.accountBalance}</h3>
						<p className={`account-balance-amount ${account.id && accountBalances[account.id] && accountBalances[account.id] < 0 ? 'negative' : ''}`}>{account.id && accountBalances[account.id] !== undefined ? prettyNumber(accountBalances[account.id], numberOptions) : ''}</p>
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
					{showAddNew && account.id ? <AddTransaction bap={bap} updateAccount={updateAccount} accountId={account.id} isTransfer={showAddNew === 'transfer'} /> : undefined}
					{transactions
					.filter(el => !el.parentTransaction && !el.deleted)
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
					.map((el) => <AccountTransaction bap={bap} transaction={el} checked={selectedTransactions.includes(el.id || -1)} key={el.id} />)}
				</tbody>
			</table>
		</main>
	)
}

export default Account;