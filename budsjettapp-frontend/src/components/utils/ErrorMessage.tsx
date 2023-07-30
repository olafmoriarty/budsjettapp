import React, {useEffect, useRef} from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useBudget } from '../../contexts/BudgetContext';

function ErrorMessage( props : Props ) {
	const {t} = useBudget();
	const errorRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		errorRef.current?.scrollIntoView({behavior: 'smooth'});
	}, [])

	return (
		<div className="error" ref={errorRef}>
			<strong>{t.error}</strong> {props.text}
			<button className="icon" onClick={() => {
				if (props.setError) {
					props.setError('');
				}
			}}><Icon icon={faTimes} /></button>
		</div>
	)
}

interface Props {
	text : string,
	setError? : (a : string) => void,
}

export default ErrorMessage;