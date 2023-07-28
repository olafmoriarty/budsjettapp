import React, { useState } from 'react'

function Collapsible( props : Props ) {
	const [show, setShow] = useState(false);

	const content = typeof props.text === "string" ? <p>{props.text}</p> : props.text;

	const toggleContent = (event : React.FormEvent) => {
		event.preventDefault();
		setShow(!show);
	}

	return (
		<div className="collapsible">
			<p><button className="link" onClick={toggleContent}>{props.linkText}</button></p>
			{show ? content : undefined}
		</div>
	)
}

interface Props {
	linkText : string,
	text : string | JSX.Element,
}

export default Collapsible