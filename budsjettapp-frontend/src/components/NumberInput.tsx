import React, {useState, useEffect, useRef} from 'react'
import prettyNumber from '../functions/prettyNumber';
import { BBP, BP, BudgetNumbersSingleCategory, Budgeted } from '../interfaces/interfaces';

function NumberInput(props : Props) {
	const {bp, amount, setAmount, tabIndex, form} = props;
	const {numberOptions} = bp;

	const inputRef = useRef();

	const [inputValue, setInputValue] = useState(prettyNumber(amount, numberOptions));
	const [localAmount, setLocalAmount] = useState(amount);

	useEffect(() => {
		const newValue = prettyNumber(amount, numberOptions, inputRef.current === document.activeElement);
		if (amount !== localAmount) {
			setInputValue(newValue);
		}
	}, [amount]);

	const changeInputValue = (event : React.FormEvent<HTMLInputElement>) => {
		setInputValue(event.currentTarget.value);
		const newFloat = parseFloat(event.currentTarget.value.replaceAll(' ', '').replaceAll(bp.t.thousandsSign, '').replace(bp.t.decimalSign, '.')) || 0;
		setAmount(newFloat);
		setLocalAmount(newFloat);
	}

	const onFocus = () => {
		setInputValue(prettyNumber(amount, numberOptions, true));
		if (props.onFocus) {
			props.onFocus();
		}
	}

	const onBlur = () => {
		setInputValue(prettyNumber(amount, numberOptions));
		if (props.onBlur) {
			props.onBlur();
		}
	}

	return (
		<input 
			type="text"
			name={props.name}
			id={props.id}
			inputMode="numeric"
			className={`number-input${props.className ? ' ' + props.className : ''}`}
			value={inputValue}
			onChange={(event) => changeInputValue(event)} 
			onFocus={() => onFocus()} 
			tabIndex={tabIndex} 
			form={form}
			onBlur={() => onBlur()}
			autoComplete='off'
			ref={inputRef.current}
		/>
	)
}

interface Props {
	bp: BP,
	name : string,
	id : string,
	amount : number,
	className? : string,
	tabIndex? : number,
	form?: string,
	setAmount : (a : number) => void,
	onFocus? : () => void,
	onBlur? : () => void,
}

export default NumberInput;