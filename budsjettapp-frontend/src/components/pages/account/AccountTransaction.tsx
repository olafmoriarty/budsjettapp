import React, { useState } from 'react'
import { BAP, Transaction } from '../../../interfaces/interfaces';
import formatDate from '../../../functions/formatDate';
import prettyNumber from '../../../functions/prettyNumber';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import AddTransaction from './AddTransaction';
import { useBudget } from '../../../contexts/BudgetContext';
import { useAPI } from '../../../contexts/APIContext';

function AccountTransaction(props : Props) {
	const {bap, transaction, checked} = props;
	const {db, t, numberOptions, updateAccountBalances} = useBudget();
	const {syncBudget} = useAPI();
	const {categoriesById, accountsById, payeesById, transactions, setTransactions, registerCheckbox, deleteTransaction, accountId} = bap;

	const [editRow, setEditRow] = useState(false);
	const [showMenu, setShowMenu] = useState(false);

	const children = transaction.isParent ? transactions.filter(el => el.parentTransaction === transaction.id) : [];
	const totalOut = children.reduce((accumulator, currentValue) => accumulator + (currentValue.out || 0), 0);
	const totalIn = children.reduce((accumulator, currentValue) => accumulator + (currentValue.in || 0), 0);

	const updateTransaction = async (close? :  boolean, newTransaction? : Transaction | Transaction[]) => {
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
		if (close) {
			setEditRow(false);
		}
	}

	if (editRow) {
		return <AddTransaction bap={bap} updateAccount={updateTransaction} accountId={bap.accountId} transaction={transaction} childTransactions={transaction.isParent ? children : undefined} />
	}
	return (
		<tr className="transaction-row" key={transaction.id} onClick={() => registerCheckbox(transaction.id)} onDoubleClick={() => setEditRow(true)}>
			<td className="checkbox-td"><input type="checkbox" checked={checked} onChange={(event) => registerCheckbox(transaction.id, event.target.checked)} /></td>
			<td className="date-td">{formatDate(transaction.date, t.dateFormat)}</td>
			<td className="payee-td">{transaction.payeeId ? payeesById[transaction.payeeId]?.name : (transaction.counterAccount ? accountsById[transaction.counterAccount]?.name : '')}</td>
			<td className="category-td">{transaction.isParent ? children.map((el, index) => <p key={index}>{categoriesById[el.categoryId || 0].name}</p>) : (
				transaction.categoryId === undefined ? '' : categoriesById[transaction.categoryId]?.name)
			}</td>
			<td className="memo-td">{transaction.memo}</td>
			<td className="out-td">{transaction.isParent && totalOut > totalIn ? prettyNumber(totalOut - totalIn, numberOptions) : (transaction.out ? prettyNumber(transaction.out, numberOptions) : '')}</td>
			<td className="in-td">{transaction.isParent && totalIn > totalOut ? prettyNumber(totalIn - totalOut, numberOptions) : (transaction.in ? prettyNumber(transaction.in, numberOptions) : '')}</td>
			<td className="edit-td">
				<button className={`icon-block ${showMenu ? 'open' : ''}`} onClick={(event) => {
					setShowMenu(!showMenu);
					event.stopPropagation();
				}}><FontAwesomeIcon icon={faEllipsisVertical} /></button>
				{showMenu ?
				<nav className="transaction-menu">
					<ul>
						<li><button className="link" onClick={(event) => {
							setEditRow(true);
							setShowMenu(false);
							event.stopPropagation();
						}}>{t.editTransaction}</button></li>
						<li><button className="link" onClick={(event) => {
							deleteTransaction(transaction);
							event.stopPropagation();
						}}>{t.deleteTransaction}</button></li>
					</ul>
				</nav>
				: undefined}
			</td>
		</tr>
	)
}

interface Props {
	transaction: Transaction,
	bap: BAP,
	checked?: boolean,
}

export default AccountTransaction;