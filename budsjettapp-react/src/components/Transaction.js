function Transaction(props) {
	const {details} = props;
	return (
		<tr>
			<td>{details.date}</td>
			<td>{details.payeeName}</td>
			<td>{details.categoryName}</td>
			<td>{details.memo}</td>
			<td>{details.in}</td>
			<td>{details.out}</td>
			<td>{details.synced}</td>
		</tr>
	)
}

export default Transaction;