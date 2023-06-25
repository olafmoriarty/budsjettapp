import React, {useState} from 'react';
import ymd from '../../functions/ymd';
import { BudgetProps, FormField } from '../../types/types';
import Dialog from '../Dialog';
import Form from '../Form';

function NewAccount(props : Props) {

	const [focus, setFocus] = useState(false);

	const fields : FormField[] = [
		{
			name: 'name',
			label: 'Navn på konto:',
			required: true,
		},
		{
			name: 'balance',
			label: 'Inngående balanse:',
			required: true,
		},
		{
			name: 'balanceDate',
			label: 'Dato for balanse:',
			type: 'date',
			required: true,
			default: ymd(),
		},
	];

	const handleAnimation = (val : boolean) => {
		setFocus(val);
	}

	return (
		<Dialog setDialogToShow={props.bp.setDialogToShow} animationFinished={handleAnimation}>
			<h2>Opprett ny konto</h2>
			<Form 
				fields={fields}
				onSubmit={props.bp.addAccount}
				autoFocus={focus}
			/>
		</Dialog>
	)
}

interface Props {
	bp : BudgetProps,
}

export default NewAccount;