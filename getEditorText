async function getAllEditorContent() {
  // Select the scrollable container and the contenteditable element
  let onTop = false
  const editorContainer = document.querySelector('.cm-scroller');
  const contentEditable = document.querySelector('.cm-content');
  const lineNumbersContainer = document.querySelector('.cm-lineNumbers'); // Line numbers container
  let contentLines = []; // Use an array to preserve order
  let capturedLineNumbers = new Set(); // Track line numbers to avoid duplicates

  if (!editorContainer || !contentEditable || !lineNumbersContainer) {
    console.error("Editor elements not found");
    return;
  }

  // Function to scroll down and wait for content to load
  function scrollEditor(position) {
    return new Promise((resolve) => {
      editorContainer.scrollTo({ top: position });
      setTimeout(resolve, 50); // Wait for content to load after scrolling
    });
  }

  // Helper function to extract visible text from the editor, including text between spans
  function extractVisibleText() {
    const lineNumbers = Array.from(lineNumbersContainer.querySelectorAll('.cm-gutterElement')).slice(1); // Get all line numbers, skip the first
    let lines = contentEditable.querySelectorAll('.cm-line, .cm-gap'); // Get all lines and gaps

    let myText = Array.from(lines).map((line, index) => {
      let lineText = "";
      if (line.classList.contains('cm-line')) {
        // Extract text between spans and inside spans in the correct order
        line.childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            lineText += node.textContent || ""; // Text between spans
          } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SPAN') {
            lineText += node.innerText || ""; // Text inside spans
          }
        });
        return lineText.trim(); // Return the collected line text
      } else if (line.classList.contains('cm-gap')) {
        return ""; // Return an empty string for gaps
      }
    });

    let myLineNumbers = lineNumbers.map(item => item.textContent); // Extract the line numbers as text

    if (myLineNumbers.length > 0 && myLineNumbers[0] === '1') {
      onTop = true; // Check if we are on top of the document
    }

    // Remove the first three elements if we are on top
    if (onTop) {
      myText = myText.slice(3);

      // If there are more lines than line numbers, trim the lines array to match line numbers
      if (lines.length > myLineNumbers.length) {
        myText = myText.slice(0, myLineNumbers.length); // Slice the myText array to match the length of lineNumbers
      }

      // console.log(myText); // Log the text for each line
      // console.log(myLineNumbers); // Log the corresponding line numbers

      // Iterate over both myText and myLineNumbers and construct the contentLines array
      myText.forEach((text, index) => {
        const lineNumber = myLineNumbers[index]; // Get the corresponding line number
        if (lineNumber && !capturedLineNumbers.has(lineNumber)) {
          if (text.trim()) {
            contentLines.push(`${lineNumber}: ${text}`); // Add line number and text
          } else {
            contentLines.push(`${lineNumber}: \n`); // Empty line with a line number
          }
          capturedLineNumbers.add(lineNumber); // Mark the line number as captured
        }
      });

      // console.log(contentLines); // Log the full content with line numbers
    }
  }

  // Keep track of the scroll position and height
  let position = 0;
  let aux = 1
  // Loop until we've scrolled to the bottom and no more content is being loaded
  while (position < editorContainer.scrollHeight) {
    // console.log('Current position:', position, 'Scroll height:', editorContainer.scrollHeight);

    // Extract visible text after each scroll
    extractVisibleText();
    if (aux === 1) {
      aux = 0
    }
    // Move the scroll position down
    await scrollEditor(position); // Scroll down

    // Update the scroll position
    position = editorContainer.scrollTop + editorContainer.clientHeight;

    // Check if we've reached the bottom
    if (Math.ceil(position) >= editorContainer.scrollHeight) {
      break;
    }
  }

  // Join the lines in the order they were captured
  const fullText = contentLines.join('\n');

  // console.log("Full editor content:", fullText);
  return fullText; // Ensure we return the full extracted text
}

// Call the function to get the editor's content
getAllEditorContent().then((text) => {
  // Do something with the extracted text, e.g., save or process it
  console.log("Extracted Text:", text);
});

