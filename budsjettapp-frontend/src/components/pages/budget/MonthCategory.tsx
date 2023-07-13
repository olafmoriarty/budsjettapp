import React, {useState, useEffect} from 'react'
import prettyNumber from '../../../functions/prettyNumber';
import { BBP, BP, BudgetNumbersSingleCategory, Budgeted } from '../../../interfaces/interfaces';
import addBudgeted from '../../../functions/database/addBudgeted';

function MonthCategory(props : Props) {
	const {bp, month, categoryIndex, isMasterCategory, category} = props;
	const {budgetNumbers, setBudgetNumbers, currentMonth} = props.bbp;

	const numberOptions = {
		numberOfDecimals: Number(bp.t.numberOfDecimals),
		decimalSign: bp.t.decimalSign,
		thousandsSign: bp.t.thousandsSign,
	};

	const monthNumbers = isMasterCategory ? bp.categories.filter((el) => el.parent === category).map(el => budgetNumbers[month] && el.id && budgetNumbers[month][el.id] ? budgetNumbers[month][el.id ? el.id : 0] : {budgeted: 0, budgetedTotal: 0, spent: 0, spentTotal: 0}).reduce((accumulator, currentValue) => { 
		return {
			budgeted: accumulator.budgeted + currentValue.budgeted, budgetedTotal: accumulator.budgetedTotal + currentValue.budgetedTotal,
			spent: accumulator.spent + currentValue.spent,
			spentTotal: accumulator.spentTotal + currentValue.spentTotal,
		}
		
	}, {budgeted: 0, budgetedTotal: 0, spent: 0, spentTotal: 0}) : (budgetNumbers[month] ? budgetNumbers[month][category] : undefined);

	const [inputValue, setInputValue] = useState(prettyNumber(monthNumbers ? monthNumbers.budgeted : 0, numberOptions));
	const [inputValueFloat, setInputValueFloat] = useState(monthNumbers ? monthNumbers.budgeted : 0);

	useEffect(() => {
		setInputValue(prettyNumber(monthNumbers ? monthNumbers.budgeted : 0, numberOptions));
		setInputValueFloat(monthNumbers ? monthNumbers.budgeted : 0);
	}, [monthNumbers]);

	const changeInputValue = (event : React.FormEvent<HTMLInputElement>) => {
		setInputValue(event.currentTarget.value);
		setInputValueFloat(parseFloat(event.currentTarget.value.replaceAll(' ', '').replaceAll(bp.t.thousandsSign, '').replace(bp.t.decimalSign, '.')) || 0);
	}

	const onFocus = () => {
		setInputValue(prettyNumber(inputValueFloat, numberOptions, true));
	}

	const onBlur = () => {
		setInputValue(prettyNumber(inputValueFloat, numberOptions));
		let newValue = {
			budgetId: bp.activeBudget.id,
			month: month, 
			category: category,
			amount: inputValueFloat,
		} as Budgeted;
		if (monthNumbers && monthNumbers.id) {
			newValue.id = monthNumbers.id;
		}
		addBudgeted(bp.db, newValue)
			.then((id) => {
				let newTotal = monthNumbers ? monthNumbers.budgetedTotal - monthNumbers.budgeted + inputValueFloat : inputValueFloat;
				let newMonthNumbers = {
					id: id,
					budgeted: inputValueFloat,
					budgetedTotal: newTotal,
					spent: monthNumbers ? monthNumbers.spent : 0,
					spentTotal : monthNumbers ? monthNumbers.spentTotal : 0,
				} as BudgetNumbersSingleCategory;

				let newBudgetNumbers = { ...budgetNumbers };
				if (!newBudgetNumbers[month]) {
					newBudgetNumbers[month] = {};
				}
				newBudgetNumbers[month][category] = newMonthNumbers;

				for (let i = month + 1; i <= currentMonth + 1; i++) {
					if (!newBudgetNumbers[i]) {
						newBudgetNumbers[i] = {};
					}

					newTotal = newTotal + (newBudgetNumbers[i][category] ? newBudgetNumbers[i][category].budgeted : 0);

					newBudgetNumbers[i][category] = {
						id: newBudgetNumbers[i][category] ? newBudgetNumbers[i][category].id : undefined,
						spent: newBudgetNumbers[i][category] ? newBudgetNumbers[i][category].spent : 0,
						spentTotal: newBudgetNumbers[i][category] ? newBudgetNumbers[i][category].spentTotal : 0,
						budgeted: newBudgetNumbers[i][category] ? newBudgetNumbers[i][category].budgeted : 0,
						budgetedTotal: newTotal,
					};
				}
				setBudgetNumbers(newBudgetNumbers);
			});
	}

	return (
		<div className="b-o-b">
			<div>{isMasterCategory ? prettyNumber(monthNumbers ? monthNumbers.budgeted : 0, numberOptions) : <input 
				name={`amount-${category ? category : 'xxx'}-${month}`} inputMode="numeric" value={inputValue} onChange={(event) => changeInputValue(event)} 
				onFocus={() => onFocus()} 
				tabIndex={(month * 400) + categoryIndex} 
				onBlur={() => onBlur()}
					
			 />}</div>
			<div>{prettyNumber(monthNumbers ? monthNumbers.spent : 0, numberOptions)}</div>
			<div className={monthNumbers && monthNumbers.budgetedTotal + monthNumbers.spentTotal < 0 ? "negative-number" : ""}>{prettyNumber(monthNumbers ? monthNumbers.budgetedTotal + monthNumbers.spentTotal : 0, numberOptions)}</div>
		</div>
	)
}

interface Props {
	isMasterCategory?: boolean,
	month: number,
	category: number,
	categoryIndex: number,
	bp: BP,
	bbp: BBP,
}

export default MonthCategory;