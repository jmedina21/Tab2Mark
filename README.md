# Tab2Mark Chrome Extension

## Introduction
Tab2Mark is a Chrome extension that lets users save and manage a list of web page links with custom names. It's designed for researchers, students, and anyone who needs to keep track of web resources and thoughts about them. Export/copy all the saved links as a markdown file. Easily organize a list of links and paste them in your favorite markdown editor like Notion, Obsidian, IaWriter, etc. No more back and forward between your browser and your editor.

## Features
- Save links with custom names from the current tab.
- Manage multiple lists of links with individual titles.
- Navigate between different lists.
- Import and export lists in Markdown format.
- Copy the list to the clipboard in Markdown format.
- Local storage persistence to keep your data between browser sessions.

## Installation
1. Download from chrome webstore `https://chromewebstore.google.com/detail/tab2mark/iieofemdmlppbhikdeknlbjkichfmnmo` or Clone the repository or download the extension package.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable Developer Mode by clicking the toggle switch next to "Developer mode".
4. Click the "Load unpacked" button and select the extension directory.

## Usage
- Click on the extension icon in the toolbar to open the main interface.
- Use the input field to add a note and the current tab's link to the list.
- Change the name of the list using the 'List Name' field.
- Navigate through lists using the left and right arrow buttons.
- Open the options modal with the 'Options' button to access more features:
  - Create a new list.
  - Export the current list or all lists to Markdown.
  - Delete the current list or all lists.
  - Copy the current list to the clipboard in Markdown format.
- Click the minus icon next to an item to remove it from the list.

## Managing Lists
- **New List**: Creates a new blank list.
- **Export List**: Saves the current list to a Markdown file.
- **Import List**: Allows you to select a Markdown file to import multiple lists.
- **Delete List**: Removes all items from the current list.
- **Export All**: Exports all lists to a single Markdown file.
- **Delete All**: Removes all lists and resets the extension to its initial state.

## Contributing
Your contributions are welcome! Please follow these steps to contribute:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add YourFeature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.