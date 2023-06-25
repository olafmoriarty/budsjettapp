import React from 'react';
import Form from '../Form';

function NewTransaction(props : Props) {

	const newTransaction = () => {
	}

	const onClose = () => {
		props.setShowNewForm(false);
	}

	return (
		<Form outputType="table" fields={[
			{ name: 'date', label: 'Dato', type: 'date', required: true },
			{ name: 'payee', label: 'Mottaker/avsender', required: true },
			{ name: 'category', label: 'Kategori', required: true },
			{ name: 'memo', label: 'Kommentar' },
			{ name: 'in', label: 'Inn' },
			{ name: 'out', label: 'Ut' },
		]} onSubmit={newTransaction} onClose={onClose} autoFocus={true} />
	)
}

interface Props {
	setShowNewForm : Function,
}

export default NewTransaction;