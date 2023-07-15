import React, { useEffect, useState } from 'react'
import { BP, Category, DictionaryEntry, Transaction, BudgetNumbers } from '../../../interfaces/interfaces'
import NumberInput from '../../NumberInput'
import AutoSuggest from '../../AutoSuggest';
import prettyNumber from '../../../functions/prettyNumber';
import getMonth from '../../../functions/getMonth';
import addPayeeDB from '../../../functions/database/addPayeeDB';
import addTransactionDB from '../../../functions/database/addTransactionDB';
import getBudgetNumbersDB from '../../../functions/database/getBudgetNumbersDB';

function AddTransaction(props : Props) {
	const {updateAccount, accountId, isTransfer} = props;
	const {db, t, defaultDate, setDefaultDate, categories, activeBudget, payees, setPayees, accounts, updateAccountBalances} = props.bp;

	const [date, setDate] = useState(defaultDate);
	const [payee, setPayee] = useState( {key : undefined, value: ''} as DictionaryEntry );
	const [counterAccount, setCounterAccount] = useState( {key : undefined, value: ''} as DictionaryEntry );
	const [budgetNumbers, setBudgetNumbers] = useState( {} as BudgetNumbers);
	const [category, setCategory] = useState( {key : undefined, value: ''} as DictionaryEntry );
	const [memo, setMemo] = useState('');
	const [amountIn, setAmountIn] = useState(0);
	const [amountOut, setAmountOut] = useState(0);

	let month = getMonth(date);

	useEffect(() => {
		resetForm();
	}, [accountId]);

	useEffect(() => {
		getBudgetNumbersDB(db, activeBudget.id, month, month)
		.then(numbers => {
			setBudgetNumbers(numbers);
		});
	}, [month]);

	const resetForm = () => {
		setDate(defaultDate);
		setPayee({key : undefined, value : ''});
		setCategory({key : undefined, value : ''});
		setCounterAccount({key : undefined, value : ''});
		setMemo('');
		setAmountIn(0);
		setAmountOut(0);
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
		<p className="category-option-balance">{prettyNumber(budgetNumbers[month] && el.id && budgetNumbers[month][el.id] ? budgetNumbers[month][el.id].budgetedTotal - budgetNumbers[month][el.id].spentTotal : 0, props.bp.numberOptions)}</p>
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
			newPayee = await addPayeeDB(db, {budgetId: activeBudget.id, name: payee.value });
			setPayees([ 
				...payees, 
				{budgetId: activeBudget.id, name: payee.value, id: newPayee} 
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
			synced: false,
		} as Transaction;

		if (!isTransfer) {
			newTransaction.payeeId = newPayee;
			newTransaction.categoryId = category.key;
		}
		else {
			newTransaction.counterAccount = counterAccount.key;
		}

		const newId = await addTransactionDB(db, newTransaction);
		newTransaction.id = newId;

		if (isTransfer) {
			let counterTransaction = { ...newTransaction };
			delete(counterTransaction.id);
			counterTransaction.accountId = counterAccount.key || 0;
			counterTransaction.counterTransaction = newId;
			counterTransaction.counterAccount = accountId;
			counterTransaction.in = newTransaction.out;
			counterTransaction.out = newTransaction.in;

			const counterId = await addTransactionDB(db, counterTransaction);

			newTransaction.counterTransaction = counterId;
			await addTransactionDB(db, newTransaction);
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
			<input type="date" id="date" value={date} onChange={(event) => setDate(event.target.value)} autoFocus form="newTransactionForm" tabIndex={1} />
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
				tabIndex={2}
			/> : 
			<AutoSuggest 
			setValue={setPayee}
			originalValue={payee}
			form="newTransactionForm"
			tabIndex={2}
			dictionary={ payees.sort((a, b) => {
				const aLastUsed = a.lastUsed || 0;
				const bLastUsed = b.lastUsed || 0;

				if (aLastUsed < bLastUsed) {
					return 1;
				}
				if (aLastUsed > bLastUsed) {
					return -1;
				}
				return 0;

			}).map(el => {
				return {key: el.id, value: el.name};
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
			<input id="memo" type="text" value={memo} onChange={(event) => setMemo(event.target.value)}  form="newTransactionForm" tabIndex={5} /></td>
		<td className="out-td">
			<label htmlFor="out">{t.out}</label>
			<NumberInput bp={props.bp} name="out" id="out" amount={amountOut} setAmount={setAmountOut}
			form="newTransactionForm"
			tabIndex={category.key === 0 ? 7 : 6}
		/></td>
		<td className="in-td">
			<label htmlFor="in">{t.in}</label>
			<NumberInput bp={props.bp} name="in" id="in" amount={amountIn} setAmount={setAmountIn}
		form="newTransactionForm"
		tabIndex={category.key === 0 ? 6 : 7}
 /></td>
		<td className="edit-td"></td>
		<td className="new-transaction-buttons">
			<form id="newTransactionForm" onSubmit={(event) => onSubmit(event, true)}>
				<button className="button submit" type="submit" tabIndex={8}>{t.save}</button>
				<button className="button submit" onClick={(event) => onSubmit(event, false)} tabIndex={9}>{t.saveAndAdd}</button>
				<button className="button abort" onClick={(event) => updateAccount(true)} tabIndex={10}>{t.cancel}</button>
			</form>
		</td>
	</tr>
	)
}

interface Props {
	bp: BP,
	transaction?: Transaction,
	updateAccount: (c? : boolean | undefined, t? : Transaction | undefined) => void,
	accountId: number,
	isTransfer?: boolean,
}
export default AddTransaction