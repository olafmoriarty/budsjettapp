const formatDate = (date : string, format : string) => {
	const explodedDate = date.split('-');
	let formattedDate = format
		.replace('{yyyy}', explodedDate[0])
		.replace('{mm}', explodedDate[1])
		.replace('{dd}', explodedDate[2])
	return formattedDate;
}

export default formatDate;