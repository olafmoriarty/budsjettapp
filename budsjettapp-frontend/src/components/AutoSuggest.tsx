import React, { useEffect, useState } from 'react'
import { DictionaryEntry } from '../interfaces/interfaces';

function AutoSuggest( props : Props ) {
	const {dictionary, originalValue, setValue, options, form, tabIndex, required} = props;
	const [text, setText] = useState('');
	const [selectedIndex, setSelectedIndex] = useState(undefined as number | undefined);

	let selection = [ ...dictionary ];

	useEffect(() => {
		setText(originalValue.value);
	}, [originalValue]);

	if (text) {
		const selectionStartsWith = dictionary.filter((el) => el.value.toLowerCase().startsWith(text.toLowerCase()));

		const selectionContains = dictionary.filter((el) => el.value.toLowerCase().includes(text.toLowerCase()));
	
		selection = selectionStartsWith.concat( selectionContains.filter( el => !selectionStartsWith.map(el2 => el2.key).includes(el.key)) );

	}

	if (selection.length > (options || 8)) {
		selection = selection.slice(0, (options || 8));
	}

	const onFocus = (event : React.FormEvent) => {
		setSelectedIndex(undefined);
	}

	const onBlur = (event : React.FormEvent) => {
		setSelectedIndex(undefined);
	}

	const onKeyDown = (event : React.KeyboardEvent) => {
		if (!selection.length) {
			return;
		}

		if (['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) {
			event.preventDefault();
		}
		
		if (event.key === 'ArrowUp') {
			setSelectedIndex( selectedIndex ? selectedIndex - 1 : selection.length - 1 );
		}

		if (event.key === 'ArrowDown') {
			setSelectedIndex( selectedIndex !== undefined && selectedIndex < selection.length - 1 ? selectedIndex + 1 : 0 );
		}
		
		if (event.key === 'Enter' && selectedIndex !== undefined) {
			setValue({
				key: selection[selectedIndex].key,
				value: selection[selectedIndex].value});
			setText(selection[selectedIndex].value);
			setSelectedIndex(0);
		}
	}

	const updateText = (newText : string) => {
		setText(newText);
		const search = dictionary.filter((el) => el.value.toLowerCase() === newText.toLowerCase());
		if  (search.length) {
			setValue({ key: search[0].key, value: search[0].value});
		}
		else {
			setValue({key: undefined, value: newText });
		}
	}

	return (
		<div className="autocomplete">
			<input type="text" value={text} onChange={(event) => updateText(event.target.value)} autoComplete='off' onKeyDown={event => onKeyDown(event)} onFocus={event => onFocus(event)} onBlur={event => onBlur(event)} form={form} tabIndex={tabIndex} className={required ? (originalValue.key ? 'valid' : 'invalid') : ''} />
			{selection.length ? <div className="autocomplete-options">{
				selection.map((el, index) => <div className={index === selectedIndex ? 'selected' : ''} key={el.key}>{el.displayValue || el.value}</div>)
			}</div> : undefined}
		</div>
	)
}

interface Props {
	dictionary : DictionaryEntry[],
	originalValue : DictionaryEntry,
	setValue : ( a : DictionaryEntry ) => void,
	options? : number,
	form? : string,
	tabIndex? : number,
	required? : boolean,
}


export default AutoSuggest;