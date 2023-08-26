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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import deleteTransactionDB from '../../../functions/database/deleteTransactionDB';

function AddTransaction(props : Props) {
	const {bap, updateAccount, accountId, transaction, isChild} = props;
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
		startCategory = {key: transaction.categoryId, value: transaction.categoryId !== undefined ? bap.categoriesById[transaction.categoryId].name : ''};
		if (transaction.isParent) {
			startCategory = {key: -1, value: t.split};
		}
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

	const [showInOrOut, setShowInOrOut] = useState('out');
	const [children, setChildren] = useState(transaction?.isParent && props.childTransactions?.length ? props.childTransactions.map((el, index) => {
		return {id: el.id,
			category: el.categoryId,
			memo: el.memo,
			in: el.in,
			out: el.out,
		} as ChildContent;
	}) : [{}, {}] as ChildContent[]);
	const isParent = category.key === -1 && !isChild ? true : false;
	let month = getMonth(date);

	useEffect(() => {
		resetForm();
	}, [accountId]);

	const updateChildren = (row : number, updatedChild : ChildContent) => {
		const newChildren = children.map((el, index) => index === row ? updatedChild : el);
		setChildren(newChildren);
	}

	const addRow = () => {
		const newChildren = [ ...children, {} ];
		setChildren(newChildren);
	}

	const deleteRow = (row : number) => {
		const newChildren = children.map((el, index) => index !== row ? el : {id: el.id, deleted: true});
		setChildren(newChildren);
	}
	
	useEffect(() => {
		if (isChild && props.childRowNumber !== undefined && props.updateInParent) {
			props.updateInParent(props.childRowNumber, {
				id: transaction?.id,
				category: category.key,
				memo: memo,
				in: amountIn,
				out: amountOut,
			})
		}
	}, [category.key, memo, amountIn, amountOut]);

	useEffect(() => {
		if (transaction && payee.key === transaction.payeeId && transaction.isParent) {
			return;
		}
		if (transaction && payee.key === transaction.payeeId) {
			setCategory({
				key: transaction.categoryId === 0 && transaction.monthOffset ? 0.5 : transaction.categoryId,
				value: transaction.categoryId !== undefined ? (transaction.categoryId === 0 ? t.incomeMonth.replace('{m}', t.monthNames[(transaction.month + (transaction.monthOffset || 0)) % 12]) : bap.categoriesById[ transaction.categoryId ].name) : '',
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

	const selectInOutOption = (event : React.FormEvent<HTMLInputElement>) => {
		setShowInOrOut(event.currentTarget.value);
	}

	const resetForm = () => {
		if (!transaction) {
			return;
		}
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
			value: t.incomeMonth.replace('{m}', t.monthNames[month % 12]),
			displayValue: <div className="category-option-box">
			<p className="category-option-name">{t.incomeMonth.replace('{m}', t.monthNames[month % 12])}</p>
			</div>,
		},
		{
			key: 0.5 as number | undefined,
			value: t.incomeMonth.replace('{m}', t.monthNames[(month + 1) % 12]),
			displayValue: <div className="category-option-box">
			<p className="category-option-name">{t.incomeMonth.replace('{m}', t.monthNames[(month + 1) % 12])}</p>
			</div>,
		},
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
		<p className={`category-option-balance ${el.id && budgetNumbers[month] && budgetNumbers[month][el.id] && budgetNumbers[month][el.id].budgetedTotal + budgetNumbers[month][el.id].spentTotal < 0 ? "negative-number" : ""}`}>{prettyNumber(budgetNumbers[month] && el.id && budgetNumbers[month][el.id] ? budgetNumbers[month][el.id].budgetedTotal + budgetNumbers[month][el.id].spentTotal : 0, numberOptions)}</p>
		</div>;

		return {key: el.id, value: el.name, displayValue: displayValue };
	}));

	if (!isChild) {
		categoryValues.unshift({
			key: -1,
			value: t.split,
			displayValue: <div className="category-option-box">{t.split}</div>,
		});
	}

	const onSubmit = async (event : React.FormEvent, close? : boolean) => {
		event.preventDefault();
		// Check that all fields are correctly filled in
		if (!activeBudget || !activeBudget.id || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || (!isTransfer && category.key === undefined) || (isTransfer && !counterAccount.key)) {
			return;
		}

		if (isChild && props.onSubmit) {
			props.onSubmit(event, close);
			return;
		}

		let newPayee : number | undefined;
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
			if (category.key === 0.5) {
				newTransaction.monthOffset = 1;
				newTransaction.categoryId = 0;
			}
			if (category.key === -1) {
				newTransaction.isParent = true;
				delete(newTransaction.categoryId);
				delete(newTransaction.in);
				delete(newTransaction.out);
			}
		}
		else {
			newTransaction.counterAccount = counterAccount.key;
		}

		if (transaction) {
			newTransaction = { ...transaction, ...newTransaction };
			if (transaction.monthOffset && category.key !== 0.5) {
				delete(newTransaction.monthOffset);
			}
		}
		
		const newId = await addTransactionDB(db, newTransaction);
		newTransaction.id = newId;
		let returnArray = [] as Transaction[];

		if (isParent) {
			const childrenById = props.childTransactions?.reduce((accumulator, value) => ({ ...accumulator, [value.id || -1]: value }), {} as {[key : number]: Transaction});
			returnArray.push(newTransaction);
			for (let i = 0; i < children.length; i++) {
				const el = children[i];
				if (el.deleted) {
					if (el.id && childrenById && childrenById[el.id]) {
						const oldTransaction = childrenById[el.id];
						await deleteTransactionDB(db, oldTransaction );

						const newTransaction = {
							id: oldTransaction.id,
							externalId: oldTransaction.externalId,
							budgetId: oldTransaction.budgetId,
							date: '',
							month: 0,
							accountId: 0,
							sync: 1,
							deleted: true,
						} as Transaction;
						returnArray.push(newTransaction);
			
					}
					continue;
				}
				let childTransaction = {
					budgetId: activeBudget.id,
					date: date,
					month: getMonth(date),
					accountId: accountId,
					payeeId: newPayee,
					categoryId: el.category,
					memo: el.memo,
					in: el.in,
					out: el.out,
					sync: 1,
					parentTransaction: newId,
				} as Transaction;
				if (el.id) {
					const oldTransaction = childrenById?.[el.id];
					if (oldTransaction) {
						childTransaction = {
							...oldTransaction,
							...childTransaction,
						};
					}
				}
				const childId = await addTransactionDB(db, childTransaction);
				childTransaction.id = childId;
				returnArray.push(childTransaction);
			}
		}

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
		console.log(returnArray);
		updateAccount(close, isParent ? returnArray : newTransaction);
	}

	const tabIndexOffset = props.childRowNumber !== undefined ? (props.childRowNumber + 1) * 20 : 0;
	const totalOut = children.reduce((accumulator, currentValue) => accumulator + (currentValue.out || 0), 0);
	const totalIn = children.reduce((accumulator, currentValue) => accumulator + (currentValue.in || 0), 0);
	return (
		<>
	<tr className={`new-transaction ${isParent || isChild ? 'split-transaction' : ''} ${isChild ? 'split-transaction-child' : ''} ${isParent ? 'split-transaction-parent' : ''}`}>
		<td className="checkbox-td"></td>
		<td className="date-td">{
			!isChild ?
			<>
				<label htmlFor='date'>{t.date}</label>
				<input type="date" id="date" value={date} onChange={(event) => setDate(event.target.value)} autoFocus form="newTransactionForm" tabIndex={1} ref={firstField} />
			</>
			: <button className="icon" onClick={() => props.deleteRow ? props.deleteRow(props.childRowNumber !== undefined ? props.childRowNumber : -1) : null}><FontAwesomeIcon icon={faTrashCan} /></button>
			}
		</td>
		<td className="payee-td">
			
		{!isChild ?
			<>
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
			</> : undefined}
			</td>
		<td className="category-td">
			{isTransfer ? undefined : <>
				<label htmlFor="category">{t.category}</label>
				<AutoSuggest id="category" dictionary={categoryValues} setValue={setCategory} originalValue={category} options={5} form="newTransactionForm" tabIndex={tabIndexOffset + 4} required />
			</>}
		</td>
		<td className="memo-td">
			<label htmlFor="memo">{t.memo}</label>
			<input id="memo" type="text" value={memo} onChange={(event) => setMemo(event.target.value)}  form="newTransactionForm" tabIndex={tabIndexOffset + 6} /></td>
		<td className="select-in-or-out">
			<label tabIndex={tabIndexOffset + 5}><input type="radio" name={`selectInOrOut${isChild ? '-' + props.childRowNumber : ''}`} value="out" checked={showInOrOut === 'out'} onChange={selectInOutOption} /> {t.outVerbose}</label>
			<label tabIndex={tabIndexOffset + 6}><input type="radio" name={`selectInOrOut${isChild ? '-' + props.childRowNumber : ''}`} value="in" checked={showInOrOut === 'in'} onChange={selectInOutOption} /> {t.inVerbose}</label>
		</td>
		<td className="out-td">
			{!isParent ?
				<NumberInput 
				name="out" 
				id="out" 
				amount={amountOut} 
				setAmount={setAmountOut}
				form="newTransactionForm"
				tabIndex={tabIndexOffset + (category.key === 0 ? 10 : 9)}
				/>
			: (totalOut > totalIn ? prettyNumber( totalOut - totalIn, numberOptions) : "")}</td>
		<td className="in-td">
			{!isParent ?
				<NumberInput 
				name="in" 
				id="in" 
				amount={amountIn} 
				setAmount={setAmountIn}
				form="newTransactionForm"
				tabIndex={tabIndexOffset + (category.key === 0 ? 9 : 10)}
				/>
			: (totalIn > totalOut ? prettyNumber( totalIn - totalOut, numberOptions) : "")}
		</td>
		<td className="edit-td"></td>
		{(!isParent && !isChild) || props.isLastChild ? 
			<td className="new-transaction-buttons">
			<form id="newTransactionForm" onSubmit={(event) => onSubmit(event, true)}>
				{isChild ? <button className="button" type="button" onClick={props.addRow} tabIndex={tabIndexOffset + 12}><FontAwesomeIcon icon={faPlus} /></button> : undefined}
				<button className="button submit" type="submit" tabIndex={tabIndexOffset + 12}>{t.save}</button>
				{transaction ? undefined : 
				<button className="button submit" onClick={(event) => onSubmit(event, false)} tabIndex={tabIndexOffset + 13}>{t.saveAndAdd}</button>}
				<button className="button abort" onClick={(event) => updateAccount(true)} tabIndex={tabIndexOffset + 14}>{t.cancel}</button>
			</form>
			</td>
		: undefined}
	</tr>
	{isParent ? children.map((el, index) => 
		el.deleted ? undefined :
		<AddTransaction 
			bap={bap} 
			updateAccount={updateAccount} 
			onSubmit={onSubmit} 
			accountId={accountId} 
			isChild={true} 
			isLastChild={index + 1 === children.length || children.slice(index + 1).filter(el => !el.deleted).length === 0}
			updateInParent={updateChildren} 
			childRowNumber={index} 
			transaction={{
				budgetId: activeBudget.id || 0, 
				date: date, 
				month: month, 
				accountId: accountId, 
				id: el.id, 
				categoryId: el.category, 
				memo: el.memo, 
				in: el.in, 
				out: el.out
			}}
			addRow={addRow} 
			deleteRow={deleteRow} 
			key={index}
		/>) : undefined}
	</>
	)
}

interface Props {
	bap: BAP,
	transaction?: Transaction,
	updateAccount: (c? : boolean | undefined, t? : Transaction | Transaction[] | undefined) => void,
	accountId: number,
	isTransfer?: boolean,

	childTransactions?: Transaction[],
	isChild?: boolean,
	isLastChild?: boolean,
	childRowNumber?: number,
	onSubmit?: (event: React.FormEvent, close?: boolean) => void,
	updateInParent?: (a : number, b : ChildContent) => void,
	addRow?: () => void,
	deleteRow?: (a : number) => void,
}

interface ChildContent {
	id?: number,
	category?: number,
	memo?: string,
	in?: number,
	out?: number,
	deleted?: boolean,
}
export default AddTransaction