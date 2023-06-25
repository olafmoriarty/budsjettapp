import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

function Dialog(props : Props) {

	const handleAnimation = (finished : boolean) => {
		if (props.animationFinished) {
			props.animationFinished(finished);
		}
	}

	return (<dialog open className="dialog" onAnimationStart={() => handleAnimation(false)} onAnimationEnd={() => handleAnimation(true)}>
		<button className="close-dialog-button" onClick={() => props.setDialogToShow(undefined)}><FontAwesomeIcon icon={faTimes} /></button>
		{props.children}
	</dialog>)
}

interface Props {
	children: JSX.Element[],
	setDialogToShow: Function,
	animationFinished?: Function,
}
export default Dialog;