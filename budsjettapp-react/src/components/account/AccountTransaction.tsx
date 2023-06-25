import React from 'react';
import { Transaction } from '../../types/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import prettyNumber from '../../functions/prettyNumber';
import prettyDate from '../../functions/prettyDate';

function AccountTransaction(props : Props) {
	const {details} = props;
	return (
		<tr>
			<td className="account-date">{prettyDate(details.date)}</td>
			<td className="account-payee">{details.payeeId}</td>
			<td className="account-category">{details.categoryId}</td>
			<td className="account-memo">{details.memo}</td>
			<td className="account-in">{details.in ? prettyNumber(details.in) : ''}</td>
			<td className="account-out">{details.out ? prettyNumber(details.out) : ''}</td>
			<td className="account-buttons">
				<button className="link"><FontAwesomeIcon icon={faPen} /></button>
				{details.synced ? 1 : <FontAwesomeIcon icon={faTriangleExclamation} />}
			</td>
		</tr>
	)
}

interface Props {
	showAccount: boolean,
	details: Transaction,
}

export default AccountTransaction;