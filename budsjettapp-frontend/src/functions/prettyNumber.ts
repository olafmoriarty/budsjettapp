const prettyNumber = (num : number) : string => {
	const newString = num.toFixed(2);

	let [kroner, øre] = newString.split('.');

	let newKroner : string = '';

	while (kroner.length) {
		if (kroner.length > 3) {
			newKroner = kroner.substring(kroner.length - 3) + (newKroner.length ? '\u00A0' : '') + newKroner;
			kroner = kroner.substring(0, kroner.length - 3);
		}
		else {
			newKroner = kroner + (newKroner.length ? '\u00A0' : '') + newKroner;
			kroner = '';
		}
	}
	newKroner = newKroner.replace('-\u00A0', '-');
	return (newKroner + ',' + øre);
}

export default prettyNumber;