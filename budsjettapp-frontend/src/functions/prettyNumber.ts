const prettyNumber = (num : number, options : Options, practicalFormat? : boolean) : string => {

	const {numberOfDecimals, decimalSign, thousandsSign} = options;

	const newString = num.toFixed(numberOfDecimals);

	let [kroner, øre] = newString.split('.');

	if (practicalFormat) {
		if (!num) {
			return '';
		}
	
		if (/^0+$/.test(øre)) {
			return kroner;
		}
		return kroner + decimalSign + øre;
	}

	let newKroner : string = '';

	while (kroner.length) {
		if (kroner.length > 3) {
			newKroner = kroner.substring(kroner.length - 3) + (newKroner.length ? thousandsSign : '') + newKroner;
			kroner = kroner.substring(0, kroner.length - 3);
		}
		else {
			newKroner = kroner + (newKroner.length ? thousandsSign : '') + newKroner;
			kroner = '';
		}
	}
	newKroner = newKroner.replace('-' + thousandsSign, '-');
	return (newKroner + decimalSign + øre);
}

interface Options {
	numberOfDecimals : number,
	decimalSign : string,
	thousandsSign : string,
}
export default prettyNumber;