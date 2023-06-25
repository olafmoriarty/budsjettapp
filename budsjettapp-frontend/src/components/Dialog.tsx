import React, {useState} from 'react';

import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { BP } from '../interfaces/interfaces';
import AddBudget from './dialogs/AddBudget';
import AddAccount from './dialogs/AddAccount';

function Dialog(props : DialogProps) {
	const {bp, dialogToShow} = props;
	const {dialogBox} = bp;

	const [closeDialog, setCloseDialog] = useState(false);

	const closeDialogBox = (event : React.AnimationEvent) => {
		if (dialogBox && dialogBox.current && (event.animationName === 'hide-dialog' || event.animationName === 'hide-and-move-dialog')) {
			console.log(event.animationName);
			setCloseDialog(false);
			dialogBox.current.close();
		}
	}

	let selectedCompontent : JSX.Element = <div></div>;
	switch (dialogToShow) {
		case 'addAccount':
			selectedCompontent = <AddAccount bp={bp} />;
			break;
		case 'addBudget':
			selectedCompontent = <AddBudget bp={bp} />;
			break;
	}

	return (
	<dialog ref={dialogBox} className={`modal ${closeDialog ? 'hide' : ''}`} onAnimationEnd={(event) => closeDialogBox(event)}>
		<button className="modal-close" onClick={() => setCloseDialog(true)}><Icon icon={faTimes} /></button>
		{selectedCompontent}
	</dialog>
  )
}

interface DialogProps {
	bp : BP,
	dialogToShow : string,
}

export default Dialog;