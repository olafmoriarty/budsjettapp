import React from 'react'
import prettyNumber from '../../functions/prettyNumber';
import { BudgetProps } from '../../types/types';

function MonthCategory(props : Props) {
	const {month, categoryIndex, bp, isMasterCategory} = props;
	return (
		<div className="b-o-b">
			<div>{isMasterCategory ? prettyNumber(0) : <input value={prettyNumber(0)} tabIndex={(month * 400) + categoryIndex} />}</div>
			<div>{prettyNumber(0)}</div>
			<div>{prettyNumber(0)}</div>
		</div>
	)
}

interface Props {
	isMasterCategory?: boolean,
	month: number,
	category: number,
	categoryIndex: number,
	bp: BudgetProps,
}

export default MonthCategory