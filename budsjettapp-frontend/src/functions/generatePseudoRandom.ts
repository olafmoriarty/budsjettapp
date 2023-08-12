const generatePseudoRandom = (length : number) => {
	let theString = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	while (theString.length < length) {
		theString += characters.charAt(Math.floor(Math.random() * 62));
	}
	return theString;
}

export default generatePseudoRandom;