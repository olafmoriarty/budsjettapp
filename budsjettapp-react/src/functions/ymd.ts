function ymd(inDate? : Date) {
	const date = inDate ? inDate : new Date();
	const year = date.getFullYear().toString();
	const month = (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1).toString();
	const day = (date.getDate() < 10 ? '0' : '') + date.getDate().toString();
	return year + '-' + month + '-' + day;

}

export default ymd;