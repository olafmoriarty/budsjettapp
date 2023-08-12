import React from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

function Warning( props : Props) {
	return (
		<div className="warning">
			<div className="triangle"><Icon icon={faExclamationTriangle} /></div>
			{typeof props.children === 'string' ? <p>{props.children}</p> : props.children}
		</div>	
	)
}

interface Props {
	children: string | JSX.Element | JSX.Element[],
}

export default Warning;