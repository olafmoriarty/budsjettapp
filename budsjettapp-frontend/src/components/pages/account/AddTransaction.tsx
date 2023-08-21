import React, { useEffect, useState, useRef } from 'react'
import { Category, DictionaryEntry, Transaction, BudgetNumbers, BAP, Payee } from '../../../interfaces/interfaces'
import NumberInput from '../../NumberInput'
import AutoSuggest from '../../AutoSuggest';
import prettyNumber from '../../../functions/prettyNumber';
import getMonth from '../../../functions/getMonth';
import addPayeeDB from '../../../functions/database/addPayeeDB';
import addTransactionDB from '../../../functions/database/addTransactionDB';
import getBudgetNumbersDB from '../../../functions/database/getBudgetNumbersDB';
import { useBudget } from '../../../contexts/BudgetContext';

function AddTransaction(props : Props) {
	const {bap, updateAccount, accountId, transaction} = props;
	const {db, t, defaultDate, setDefaultDate, categories, activeBudget, payees, setPayees, accounts, updateAccountBalances, numberOptions} = useBudget();

	const isTransfer = props.isTransfer || (transaction && transaction.counterAccount);

	const firstField = useRef<HTMLInputElement>(null);

	let startDate = defaultDate;
	let startPayee = {key: undefined, value: ''} as DictionaryEntry;
	let startCategory = {key: undefined, value: ''} as DictionaryEntry;
	let startCounterAccount = {key: undefined, value: ''} as DictionaryEntry;
	let startMemo = '';
	let startAmountIn = 0;
	let startAmountOut = 0;

	if (transaction) {
		startDate = transaction.date;
		startPayee = {key : transaction.payeeId, value: transaction.payeeId ? bap.payeesById[transaction.payeeId].name : ''};
		startCounterAccount = {key : transaction.counterAccount, value: transaction.counterAccount ? bap.accountsById[transaction.counterAccount].name : ''};
		startCategory = {key : transaction.categoryId, value: transaction.categoryId !== undefined ? bap.categoriesById[transaction.categoryId].name : ''};
		startMemo = transaction.memo || '';
		startAmountIn = transaction.in || 0;
		startAmountOut = transaction.out || 0;
	}

	const [date, setDate] = useState(startDate);
	const [payee, setPayee] = useState(startPayee);
	const [counterAccount, setCounterAccount] = useState(startCounterAccount);
	const [budgetNumbers, setBudgetNumbers] = useState( {} as BudgetNumbers);
	const [category, setCategory] = useState(startCategory);
	const [memo, setMemo] = useState(startMemo);
	const [amountIn, setAmountIn] = useState(startAmountIn);
	const [amountOut, setAmountOut] = useState(startAmountOut);

	let month = getMonth(date);

	useEffect(() => {
		resetForm();
	}, [accountId]);

	useEffect(() => {
		if (transaction && payee.key === transaction.payeeId) {
			setCategory({
				key: transaction.categoryId,
				value: transaction.categoryId ? bap.categoriesById[ transaction.categoryId ].name : '',
			})
		}
		else if (payee.key) {
			const payeeCategories = bap.transactions.filter(el => el.payeeId === payee.key).map(el => el.categoryId || 0);
			if (payeeCategories.length) {
				setCategory({
					key: payeeCategories[0],
					value: bap.categoriesById[payeeCategories[0]].name,
				});
			}
		}
		else {
			setCategory({
				key: undefined,
				value: '',
			});
		}
	}, [payee]);
	useEffect(() => {
		getBudgetNumbersDB(db, activeBudget.id, month, month)
		.then(numbers => {
			setBudgetNumbers(numbers);
		});
	}, [month]);

	const resetForm = () => {
		firstField.current?.focus();
		setPayee(startPayee);
		setCategory(startCategory);
		setCounterAccount(startCounterAccount);
		setMemo(startMemo);
		setAmountIn(startAmountIn);
		setAmountOut(startAmountOut);
		getBudgetNumbersDB(db, activeBudget.id, month, month)
		.then(numbers => {
			setBudgetNumbers(numbers);
		});
	}

	let categoryIndex = {} as { [key : number]: Category };
	categories.forEach(el => {
		if (el.id) {
			categoryIndex[el.id] = el;
		}
	})

	const payeeValues = [] as number[];
	bap.transactions.sort((a, b) => {
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
	}).map(el => el.payeeId || 0).forEach(el => {
		if (el && !payeeValues.includes(el)) {
			payeeValues.push(el);
		}
	});
	payees.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1).forEach(el => {
		if (el.id && !payeeValues.includes(el.id)) {
			payeeValues.push(el.id);
		}
	});


	const categoryValues = [
		{
			key: 0 as number | undefined,
			value: t.income,
			displayValue: <div className="category-option-box">
			<p className="category-option-name">{t.income}</p>
			</div>,
		}
	]
	.concat(categories.filter(el => el.parent && !el.deleted && !el.hidden).sort((a, b) => {
		const parentA = categoryIndex[a.parent || 0];
		const parentB = categoryIndex[b.parent || 0];

		if ((parentA.sort || 100) < (parentB.sort || 100)) {
			return -1;
		}

		if ((parentA.sort || 100) > (parentB.sort || 100)) {
			return 1;
		}

		if ((a.sort || 100) < (b.sort || 100)) {
			return -1;
		}

		if ((a.sort || 100) > (b.sort || 100)) {
			return 1;
		}

		return 0;
	}).map(el => {
		const displayValue = <div className="category-option-box">
		<p className="category-option-parent">{categoryIndex[el.parent || 0]?.name} &gt;</p>
		<p className="category-option-name">{el.name}</p>
		<p className="category-option-balance">{prettyNumber(budgetNumbers[month] && el.id && budgetNumbers[month][el.id] ? budgetNumbers[month][el.id].budgetedTotal - budgetNumbers[month][el.id].spentTotal : 0, numberOptions)}</p>
		</div>;

		return {key: el.id, value: el.name, displayValue: displayValue };
	}))

	const onSubmit = async (event : React.FormEvent, close? : boolean) => {
		event.preventDefault();
		// Check that all fields are correctly filled in
		if (!activeBudget || !activeBudget.id || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || (!isTransfer && category.key === undefined) || (isTransfer && !counterAccount.key)) {
			return;
		}

		let newPayee;
		if (payee.key) {
			newPayee = payee.key;
		}
		else if (payee.value) {
			newPayee = await addPayeeDB(db, {budgetId: activeBudget.id, name: payee.value, sync: 1, });
			setPayees([ 
				...payees, 
				{budgetId: activeBudget.id, name: payee.value, id: newPayee, sync: 1} 
			]);
		}
		else {
			newPayee = 0;
		}

		let newTransaction = {
			budgetId: activeBudget.id,
			date: date,
			month: getMonth(date),
			accountId: accountId,
			payeeId: newPayee,
			memo: memo,
			in: amountIn,
			out: amountOut,
			sync: 1,
		} as Transaction;

		if (!isTransfer) {
			newTransaction.payeeId = newPayee;
			newTransaction.categoryId = category.key;
		}
		else {
			newTransaction.counterAccount = counterAccount.key;
		}

		if (transaction) {
			newTransaction = { ...transaction, ...newTransaction };
		}

		const newId = await addTransactionDB(db, newTransaction);
		newTransaction.id = newId;

		if (isTransfer) {
			let counterTransaction = { ...newTransaction };
			if (transaction) {
				counterTransaction.id = transaction.counterTransaction;
			}
			else {
				delete(counterTransaction.id);
			}
			counterTransaction.accountId = counterAccount.key || 0;
			counterTransaction.counterTransaction = newId;
			counterTransaction.counterAccount = accountId;
			counterTransaction.in = newTransaction.out;
			counterTransaction.out = newTransaction.in;

			const counterId = await addTransactionDB(db, counterTransaction);

			if (!transaction) {
				newTransaction.counterTransaction = counterId;
				await addTransactionDB(db, newTransaction);
			}
		}

		setDefaultDate(date);
		updateAccountBalances();
		resetForm();
		updateAccount(close, newTransaction);
	}

	return (
	<tr className="new-transaction">
		<td className="checkbox-td"></td>
		<td className="date-td">
			<label htmlFor='date'>{t.date}</label>
			<input type="date" id="date" value={date} onChange={(event) => setDate(event.target.value)} autoFocus form="newTransactionForm" tabIndex={1} ref={firstField} />
		</td>
		<td className="payee-td">
			<label htmlFor='payee'>{t.payee}</label>
			{isTransfer ? <AutoSuggest
				id="payee"
				originalValue={counterAccount}
				setValue={setCounterAccount}
				dictionary={accounts.filter(el => el.id !== accountId).map(el => {
					return {key: el.id, value: el.name}
				})
				}
				form="newTransactionForm"
				required
				tabIndex={2}
			/> : 
			<AutoSuggest 
			setValue={setPayee}
			originalValue={payee}
			form="newTransactionForm"
			tabIndex={2}
			dictionary={ payeeValues.map(el => {
				return {key: el, value: bap.payeesById[el].name};
			}) } />}
			</td>
		<td className="category-td">
			{isTransfer ? undefined : <>
				<label htmlFor="category">{t.category}</label>
				<AutoSuggest id="category" dictionary={categoryValues} setValue={setCategory} originalValue={category} options={5} form="newTransactionForm" tabIndex={4} required />
			</>}
		</td>
		<td className="memo-td">
			<label htmlFor="memo">{t.memo}</label>
			<input id="memo" type="text" value={memo} onChange={(event) => setMemo(event.target.value)}  form="newTransactionForm" tabIndex={6} /></td>
		<td className="out-td">
			<label htmlFor="out">{t.out}</label>
			<NumberInput name="out" id="out" amount={amountOut} setAmount={setAmountOut}
			form="newTransactionForm"
			tabIndex={category.key === 0 ? 8 : 7}
		/></td>
		<td className="in-td">
			<label htmlFor="in">{t.in}</label>
			<NumberInput name="in" id="in" amount={amountIn} setAmount={setAmountIn}
		form="newTransactionForm"
		tabIndex={category.key === 0 ? 7 : 8}
 /></td>
		<td className="edit-td"></td>
		<td className="new-transaction-buttons">
			<form id="newTransactionForm" onSubmit={(event) => onSubmit(event, true)}>
				<button className="button submit" type="submit" tabIndex={9}>{t.save}</button>
				{transaction ? undefined : 
				<button className="button submit" onClick={(event) => onSubmit(event, false)} tabIndex={10}>{t.saveAndAdd}</button>}
				<button className="button abort" onClick={(event) => updateAccount(true)} tabIndex={11}>{t.cancel}</button>
			</form>
		</td>
	</tr>
	)
}

interface Props {
	bap: BAP,
	transaction?: Transaction,
	updateAccount: (c? : boolean | undefined, t? : Transaction | undefined) => void,
	accountId: number,
	isTransfer?: boolean,
}
export default AddTransaction