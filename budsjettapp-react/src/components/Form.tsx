import React, {useState, useEffect, useRef} from 'react'
import { FormField } from '../types/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

function Form(props : Props) {
	const {fields, onSubmit, outputType, onClose, autoFocus} = props;
	
	const [formId, setFormId] = useState('form');

	const firstInput = useRef<any>(null);

	const [formData, setFormData] = useState<FormFields>( fields.reduce((accumulator, value) => {
		return {...accumulator, [value.name]: value.default ? value.default : ''};
	  }, {}) );

	useEffect(() => {
		setFormId(`form-${Math.floor(Math.random() * 1000)}`);
	}, []);

	useEffect(() => {
		if (autoFocus && firstInput.current) {
			firstInput.current.focus();
		}
	}, [autoFocus]);
	
	const changeValue = (ev : React.FormEvent<HTMLInputElement>) => {
		const newFormData = { ...formData };
		newFormData[ev.currentTarget.name] = ev.currentTarget.value;
		setFormData(newFormData);
	}

	const submitForm = (ev : React.FormEvent<HTMLFormElement>) => {
		ev.preventDefault();
		console.log("Submit");
		onSubmit(formData);
	}

	if (outputType === 'table') {
		return (
			<tr className="budget-form">
				{fields.map((el, index) => <td className="input-paragraph" key={index}>
					{el.label ? <p className="label"><label htmlFor={`${formId}-${el.name}`}>{el.label}</label></p> : null}
					<input 
						name={el.name} 
						id={`${formId}-${el.name}`}
						type={el.type ? el.type : "text"} 
						value={formData[el.name]} 
						onChange={ev => changeValue(ev)}
						required={el.required ? true : false}
						form={formId}
						autoFocus={index === 0 && autoFocus ? true : false}
						defaultValue={el.default ? el.default : undefined}
					/>
				</td>)}
				<td>
					<form id={formId} onSubmit={ev => submitForm(ev)}>
						<button className="button" type="submit">Submit</button>
						{onClose ? <button type="button" className="close-form-button" onClick={() => onClose()}><FontAwesomeIcon icon={faTimes} /></button> : null}
					</form>
				</td>
			</tr>
		)
	}

	return (
		<form onSubmit={ev => submitForm(ev)}>
			<div className="budget-form">
				{fields.map((el, index) => <div className="input-paragraph" key={index}>
					<label><p>{el.label}</p>
						<p><input 
							name={el.name} 
							type={el.type ? el.type : "text"} 
							value={formData[el.name]} 
							onChange={ev => changeValue(ev)}
							required={el.required ? true : false}
							autoFocus={index === 0 && autoFocus ? true : false}
							ref={index === 0 ? firstInput : undefined}
						/></p>
					</label>
				</div>)}
			</div>
			<p><button className="button" type="submit">Submit</button></p>
		</form>
	)
}

interface Props {
	outputType?: string,
	fields: FormField[],
	onSubmit: Function,
	onClose?: Function,
	autoFocus?: boolean,
}

interface FormFields {
	[index : string]: string,
}

export default Form;