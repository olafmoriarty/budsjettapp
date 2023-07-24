import React from 'react'
import prettyNumber from '../../../functions/prettyNumber';
import { BBP, BP } from '../../../interfaces/interfaces';

function MonthHeader(props : Props) {
	const {monthId, bp, bbp} = props;
	const {t} = bp;
	const {budgetNumbers} = bbp;
	const year = (Math.floor(monthId / 12) + 2000).toString();
	let monthString = bp.t.monthNames[monthId % 12];

	const income = budgetNumbers[monthId]?.[0]?.spentTotal || 0;

	const budgetedTotal = budgetNumbers[monthId] ? Object.keys(budgetNumbers[monthId]).reduce((accumulator, value) => accumulator + budgetNumbers[monthId][Number(value)].budgetedTotal, 0) : 0;

	const numberOptions = {
		numberOfDecimals: Number(bp.t.numberOfDecimals),
		decimalSign: bp.t.decimalSign,
		thousandsSign: bp.t.thousandsSign,
	};

	return (
	<div className="month-header">
		<p className="month-name">{monthString + ' ' + year}</p>
		<p className="money-to-budget">{prettyNumber(income - budgetedTotal, numberOptions)}</p>
		<p className="to-budget">{t.toBudget}</p>
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
	bp: BP,
	bbp: BBP,
}

export default MonthHeader