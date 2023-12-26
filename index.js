const noteInput = document.getElementById('note-input')
const ulEL = document.getElementById('ul-el')
const listNameInput = document.getElementById('list-name')
let noteArray = []
let currentList = 0

if(localStorage.getItem('currentList')){
    currentList = JSON.parse(localStorage.getItem('currentList'))
}

if(localStorage.getItem('noteArray')){
    noteArray = JSON.parse(localStorage.getItem('noteArray'))
}

document.addEventListener('keyup',function(e){
    if(e.key === 'Enter'){
        saveToArray()
    }
})

document.addEventListener('click',function(e){
    if(e.target.id === 'save-btn'){
        saveToArray()
    }else if(e.target.id === 'right-btn'){
        currentList++
        if(currentList > noteArray.length - 1){
            currentList = 0
        }
        localStorage.setItem('currentList', JSON.stringify(currentList))
        render()
    }else if(e.target.id === 'left-btn'){
        currentList--
        if(currentList < 0){
            currentList = noteArray.length - 1
        }
        localStorage.setItem('currentList', JSON.stringify(currentList))
        render()
    }else if(e.target.id === 'clear-btn'){
        localStorage.removeItem('noteArray')
        noteArray = []
        render()
    }else if(e.target.id === 'export-btn'){
        exportArray()
    }else if(e.target.id === 'copy-markdown-btn'){
        copyToClipboard()
        tooltipStyle()
    }else if(e.target.dataset.remove){
        removeLiItem(e.target.dataset.remove)
    }
})

// document.getElementById('import-btn').addEventListener('change', importList)

function importList(e, listName = 'Imported List') {
    let file = e.target.files[0];
    if (!file) {
        return;
    }

    let reader = new FileReader();
    reader.onload = (e) => {
        let contents = e.target.result;
        let lines = contents.split('\n');
        let links = lines.map(line => {
            let matches = line.match(/\-\[([^\]]+)\]\s+\+\s+\[([^\]]+)\]\(([^)]+)\)/);
            if (matches && matches.length === 4) {
                return {
                    favIconUrl: matches[1],
                    note: matches[2],
                    url: matches[3]
                };
            }
            return null;
        }).filter(item => item !== null);

        let newList = {
            listName: listName,
            links: links
        };

        noteArray.push(newList);
        localStorage.setItem('noteArray', JSON.stringify(noteArray));

        render();
    };
    reader.readAsText(file);
};

function saveToArray(){
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        if(noteInput.value){
            noteArray[currentList].links.push({
                favIconUrl: tabs[0].favIconUrl,
                note: encodeHTML(noteInput.value),
                url: tabs[0].url,
            })
        }else{
            noteArray[currentList].links.push({
                favIconUrl: tabs[0].favIconUrl,
                note: tabs[0].title,
                url: tabs[0].url,
            })
        }
        localStorage.setItem('noteArray',JSON.stringify(noteArray))
        render()
        noteInput.value = ''
        noteInput.focus()
    })
}

function removeLiItem(id){
    noteArray[currentList].links.splice(id, 1)
    localStorage.setItem('noteArray',JSON.stringify(noteArray))
    render()
}

function exportArray() {
    const heading = `# ${noteArray[currentList].listName}\n\n`;
    let exportData = heading + noteArray[currentList].links.map(function(item) {
        return `-[${item.favIconUrl}] + [${item.note}](${item.url})`;
    }).join('\n');

    let blob = new Blob([exportData], {type: "text/markdown;charset=utf-8"});
    saveAs(blob, "Saved Tabs.md");
}


function copyToClipboard(){
    let exportArray =noteArray[currentList].links.map(function(item){
        return `- [${item.note}]` + `(${item.url})`
    })
    navigator.clipboard.writeText(exportArray.join('\n'))
}

function tooltipStyle(){
    const tooltip = document.getElementById('copy-tooltip');
    tooltip.style.visibility = 'visible';
    tooltip.style.opacity = 1;
    setTimeout(function(){
        tooltip.style.transition = 'opacity 0.3s ease';
        tooltip.style.opacity = 0;
    }, 1200);
    setTimeout(function(){
    tooltip.style.visibility = 'hidden';
    }, 2000);
}

function render(){
    listNameInput.value = noteArray[currentList].listName
    let listHtml = ''
    noteArray[currentList].links.forEach((item, index) => {
        listHtml += `
        <div class="li-container">
            <li class="img-link">
                <div class='ellipsis-text'>
                    <img src="${item.favIconUrl || "./images/placeholder-favicon.svg"}" class="favicon">
                    <a class="text-link" href="${item.url}" target="_blank">${item.note}</a>
                </div>
            </li>
            <img 
                src="images/delete svg.svg"
                class="delete-btn drop-shadow" 
                data-remove="${index}">
        </div>
        `
    })
    ulEL.innerHTML = listHtml
}

noteInput.focus()
// chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
// noteInput.placeholder = tabs[0].title
// })

function encodeHTML(text) {
    let element = document.createElement("div");
    element.textContent = text;
    return element.innerHTML;
}

render()