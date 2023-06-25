import React from 'react'
import prettyNumber from '../../functions/prettyNumber';
import { BP } from '../../interfaces/interfaces';

function MonthHeader(props : Props) {
	const {monthId, bp} = props;
	const year = (Math.floor(monthId / 12) + 2000).toString();
	let monthString = bp.t.monthNames[monthId % 12];
	const toBudget = 0;
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
	bp: BP,
}

export default MonthHeader