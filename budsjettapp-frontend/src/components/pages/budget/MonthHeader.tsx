import React from 'react'
import prettyNumber from '../../../functions/prettyNumber';
import { BBP } from '../../../interfaces/interfaces';
import { useBudget } from '../../../contexts/BudgetContext';

function MonthHeader(props : Props) {
	const {monthId, bbp} = props;
	const {t} = useBudget();
	const {budgetNumbers} = bbp;
	const year = (Math.floor(monthId / 12) + 2000).toString();
	let monthString = t.monthNames[monthId % 12];

	const income = budgetNumbers[monthId]?.[0]?.spentTotal || 0;

	const budgetedTotal = budgetNumbers[monthId] ? Object.keys(budgetNumbers[monthId]).reduce((accumulator, value) => accumulator + budgetNumbers[monthId][Number(value)].budgetedTotal, 0) : 0;

	const numberOptions = {
		numberOfDecimals: Number(t.numberOfDecimals),
		decimalSign: t.decimalSign,
		thousandsSign: t.thousandsSign,
	};

	return (
	<div className="month-header">
		<p className="month-name">{monthString + ' ' + year}</p>
		<p className={`money-to-budget ${income - budgetedTotal < 0 ? 'negative-number' : (income === budgetedTotal ? 'green-number' : '')}`}>{prettyNumber(income - budgetedTotal, numberOptions)}</p>
		<p className={`to-budget ${income - budgetedTotal < 0 ? 'negative-number' : ''}`}>{income - budgetedTotal < 0 ? t.overbudgeted : t.toBudget}</p>
		<div className="b-o-b">
			<div>{t.budget}</div>
			<div>{t.outflows}</div>
			<div>{t.balance}</div>
		</div>
	</div>
  )
}

interface Props {
	monthId: number,
	bbp: BBP,
}

export default MonthHeader