import React from 'react'
import getCategoryTotals from '../../functions/getCategoryTotals';
import prettyNumber from '../../functions/prettyNumber';
import { BudgetProps } from '../../types/types'

function MonthHeader(props : Props) {
	const {monthId, bp} = props;
	const year = (Math.floor(monthId / 12) + 2000).toString();
	let monthString = bp.t.monthNames[monthId % 12];
	const toBudget = getCategoryTotals(bp.transactions, monthId, 1).monthTotal;
	console.log(toBudget);
  return (
	<div className="month-header">
		<p className="month-name">{monthString + ' ' + year}</p>
		<p className="money-to-budget">{prettyNumber(toBudget)}</p>
		<p className="to-budget">å fordele</p>
		<div className="b-o-b">
			<div>Budsjett</div>
			<div>Forbruk</div>
			<div>Balanse</div>
		</div>
	</div>
  )
}

interface Props {
	monthId: number,
	bp: BudgetProps,
}

export default MonthHeader