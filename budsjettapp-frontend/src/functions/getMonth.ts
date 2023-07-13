const getMonth = (input : string|Date) => {

	let m, y;

	if (typeof input === "string") {
		const dateParts = input.split('-');
		m = Number(dateParts[1]) - 1;
		y = Number(dateParts[0]);
	}
	else {
		m = input.getMonth();
		y = input.getFullYear();
	}

	return ((y - 2000) * 12) + m;
}

export default getMonth;