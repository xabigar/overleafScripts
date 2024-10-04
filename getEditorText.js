static async getAllEditorContent () {
    let onTop = false
    const editorContainer = document.querySelector('.cm-scroller')
    const contentEditable = document.querySelector('.cm-content')
    const lineNumbersContainer = document.querySelector('.cm-lineNumbers')
    let contentLines = []
    let capturedLineNumbers = new Set()

    if (!editorContainer || !contentEditable || !lineNumbersContainer) {
      console.error('Editor elements not found')
      return
    }

    function scrollEditor (position) {
      return new Promise((resolve) => {
        editorContainer.scrollTo({ top: position })
        setTimeout(resolve, 250)
      })
    }

    function extractVisibleText () {
      const lineNumbers = Array.from(lineNumbersContainer.querySelectorAll('.cm-gutterElement')).slice(1)
      let lines = contentEditable.querySelectorAll('.cm-line, .cm-gap')

      let myText = Array.from(lines).map((line) => {
        let lineText = ''
        if (line.classList.contains('cm-line')) {
          line.childNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              lineText += node.textContent || ''
            } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SPAN') {
              lineText += node.innerText || ''
            }
          })
          return lineText.trim()
        } else if (line.classList.contains('cm-gap')) {
          return ''
        }
      })

      let myLineNumbers = lineNumbers.map((item) => item.textContent)

      if (myLineNumbers.length > 0 && myLineNumbers[0] === '1') {
        onTop = true
      }
      if (onTop) {
        if (myLineNumbers[0] !== '1') {
          // check from already saved content the first five myLineNumbers and myText correspond;
          let isAligned = false
          const maxCheckLength = 5 // Let's check the first five lines for alignment
          let offset = 0
          // Compare saved content to find where the mismatch happens
          while (!isAligned && offset < maxCheckLength) {
            isAligned = true; // Assume alignment is correct at the start

            // Check the first few stored line numbers and text to ensure alignment
            for (let i = 0; i < Math.min(myText.length, maxCheckLength); i++) {
              const savedContentLine = contentLines.find(line => line.startsWith(`${myLineNumbers[i]}:`))
              const currentLine = `${myLineNumbers[i]}: ${myText[i] || '\n'}` // Create new line to compare (with line number)

              // If there's a mismatch between stored and new line number:text, it's not aligned
              if (savedContentLine && savedContentLine !== currentLine) {
                isAligned = false // If any mismatch is found, set to false
                break
              }
            }

            // If not aligned, remove the first element of myText (shift) and increment the offset
            if (!isAligned) {
              myText = myText.slice(1) // Remove the first element of the text
              offset++ // Move forward to recheck
            }
          }
        }
        // Ensure the text length matches the line numbers length if more lines are added
        if (myText.length > myLineNumbers.length) {
          myText = myText.slice(0, myLineNumbers.length)
        }
        // Loop over the line numbers and match with the text content
        myLineNumbers.forEach ((lineNumber, index) => {
          const text = myText[index] // Get the corresponding text for this line number
          if (lineNumber && !capturedLineNumbers.has(lineNumber)) {
            if (text) {
              contentLines.push(`${lineNumber}: ${text}`) // Add the line number and the corresponding text
            } else {
              contentLines.push(`${lineNumber}: \n`) // Handle the empty text case
            }
            capturedLineNumbers.add(lineNumber) // Mark the line number as captured
          }
        })
      }
    }

    let position = 0
    while (position < editorContainer.scrollHeight) {
      extractVisibleText()
      await scrollEditor(position)
      position = editorContainer.scrollTop + editorContainer.clientHeight
      if (Math.ceil(position) + 1 >= editorContainer.scrollHeight) {
        break
      }
    }
    let fullText = contentLines.join('\n')
    console.log('Full text:', fullText)
    fullText = contentLines
      .map(line => line.replace(/^\d+:\s*/, '')) // Remove the leading '{number}: ' pattern
      .join('\n')
    return fullText
  }

// Call the function to get the editor's content
getAllEditorContent().then((text) => {
  // Do something with the extracted text, e.g., save or process it
  console.log("Extracted Text:", text);
});

