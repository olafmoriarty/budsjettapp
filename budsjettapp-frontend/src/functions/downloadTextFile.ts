/**
 * Takes a text, turns it into a downloadable txt file and lets the
 * user download it.
 * 
 * Except for a few tiny functionality changes,
 *  this code is almost verbatim stolen from
 *  https://stackoverflow.com/questions/3665115/how-to-create-a-file-in-memory-for-user-to-download-but-not-through-server
 * 
 * @param filename The filename to download as.
 * @param text The text to add to the file.
 */
function downloadTextFile(text : string, filename : string, format? : 'text' | 'json') {

	// Create a link
	const element = document.createElement('a');

	// Link to the text string
	element.setAttribute('href', `data:${format === 'json' ? 'application/json' : 'text/plain'};charset=utf-8,${encodeURIComponent(text)}`);

	// Set the link to download with the given filename
	element.setAttribute('download', filename);
  
	// Make the link invisible
	element.style.display = 'none';

	// Add the link to the body
	document.body.appendChild(element);
  
	// Click the link
	element.click();
  
	// Remove the link from the document
	document.body.removeChild(element);
}

export default downloadTextFile;