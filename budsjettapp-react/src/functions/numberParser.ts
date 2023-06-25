function numberParser( str : string ) {
	let value = parseFloat(str.replace(' ', '').replace(',', '.'));

	if (isNaN(value)) {
		value = 0;
	}
	return value;
}

export default numberParser;