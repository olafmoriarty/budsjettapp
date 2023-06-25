const prettyDate = (date : string) => {
	const explodedDate = date.split('-');

	return (explodedDate[2] + '.' + explodedDate[1] + '.' + explodedDate[0]);
}

export default prettyDate;