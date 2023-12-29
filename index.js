const noteInput = document.getElementById('note-input')
const linksList = document.getElementById('links-ul')
const listNameInput = document.getElementById('list-name')
const modal = document.getElementById('modal')
const optionsBtn = document.getElementById('options-btn')
let currentList = 0
let noteArray = [{
    listName: 'New List',
    links: []
}]
let isOptionsOpen = false

if(localStorage.getItem('currentList')){
    currentList = JSON.parse(localStorage.getItem('currentList'))
}

if(localStorage.getItem('noteArray')){
    noteArray = JSON.parse(localStorage.getItem('noteArray'))
    if (!noteArray[0].hasOwnProperty('listName') && !noteArray[0].hasOwnProperty('links')) {
        let updatedArray = [{
            listName: "My List",
            links: noteArray
        }];
        noteArray = updatedArray;
        localStorage.setItem('noteArray', JSON.stringify(noteArray));
    }
}

if(localStorage.getItem('noteArray')){
    noteArray = JSON.parse(localStorage.getItem('noteArray'))
}

document.addEventListener('change',function(e){
    if(e.target.id === 'list-name'){
        noteArray[currentList].listName = listNameInput.value
        localStorage.setItem('noteArray', JSON.stringify(noteArray))
    }if(e.target.id ==='import-btn'){
        importMultipleLists(e)
        document.getElementById('import-btn').value = ''
    }
})

listNameInput.addEventListener('focus', function(e) {
    e.target.select();
});

document.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
        if (document.activeElement === listNameInput) {
            listNameInput.blur();
        } else {
            saveToArray();
        }
    }
});

document.addEventListener('click',function(e){
    if(e.target.id === 'save-btn'){
        saveToArray()
    }if(e.target.id === 'right-btn'){
        if(noteArray.length === 1){
            tooltipStyle('list')
        }else{
            currentList++
            if(currentList > noteArray.length - 1){
                currentList = 0
            }
            localStorage.setItem('currentList', JSON.stringify(currentList))
            render()
        }
    }if(e.target.id === 'left-btn'){
        if(noteArray.length === 1){
            tooltipStyle('list')
        }else{
            currentList--
            if(currentList < 0){
                currentList = noteArray.length - 1
            }
            localStorage.setItem('currentList', JSON.stringify(currentList))
            render()
        }
    }if(e.target.id === 'options-btn'){
        if(!isOptionsOpen){
            openModal()
        }else{
            closeModal()
        }
    }if(e.target.id === 'new-list'){
        noteArray.push({
            listName: 'New List',
            links: []
        })
        currentList = noteArray.length - 1
        listNameInput.focus()
        localStorage.setItem('currentList', JSON.stringify(currentList))
        localStorage.setItem('noteArray', JSON.stringify(noteArray))
        closeModal();
        render()
    }if(e.target.id === 'export-list'){
        exportArray()        
    }if(e.target.id === 'delete-list'){
        noteArray.splice(currentList, 1)
        if(noteArray.length === 0){
            noteArray = [{
                listName: 'New List',
                links: []
            }]
            currentList = 0
            localStorage.setItem('noteArray', JSON.stringify(noteArray))
            localStorage.setItem('currentList', JSON.stringify(currentList))
        }else {
            currentList --
            if(currentList < 0){
                currentList = noteArray.length - 1
            }
            localStorage.setItem('noteArray', JSON.stringify(noteArray))
            localStorage.setItem('currentList', JSON.stringify(currentList))
        }
        closeModal();
        render()
    }if(e.target.id === 'export-lists'){
        exportAllLists()
    }if(e.target.id === 'delete-all-lists'){
        document.getElementById('confirm-dialog').showModal()
    }if(e.target.id === 'confirm-btn'){
        noteArray = [{
            listName: 'New List',
            links: []
        }]
        currentList = 0
        localStorage.setItem('noteArray', JSON.stringify(noteArray))
        localStorage.setItem('currentList', JSON.stringify(currentList))
        document.getElementById('confirm-dialog').close()
        closeModal();
        render()
    }else if(e.target.id === 'cancel-btn'){
        document.getElementById('confirm-dialog').close()
    }if(e.target.id === 'clear-btn'){
        localStorage.removeItem('noteArray')
        noteArray = []
        render()
    }if(e.target.id === 'copy-markdown-btn'){
        copyToClipboard()
        tooltipStyle('copy')
    }if(e.target.dataset.remove){
        removeLiItem(e.target.dataset.remove)
    }
})

function closeModal() {
    optionsBtn.src = './images/DotsThreeCircleVertical.svg';
    linksList.style.display = 'block';
    modal.style.display = 'none';
    isOptionsOpen = !isOptionsOpen;
}

function openModal() {
    optionsBtn.src = './images/XCircle.svg';
    linksList.style.display = 'none';
    modal.style.display = 'block';
    isOptionsOpen = !isOptionsOpen;
}

function saveToArray(){
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        if(noteInput.value){
            noteArray[currentList].links.push({
                note: encodeHTML(noteInput.value),
                url: tabs[0].url,
            })
        }else{
            noteArray[currentList].links.push({
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
        return `-[${item.note}](${item.url})`;
    }).join('\n');

    let blob = new Blob([exportData], {type: "text/markdown;charset=utf-8"});
    saveAs(blob, "Saved Tabs.md");
}

function exportAllLists() {
    let exportData = "";

    noteArray.forEach(list => {
        const heading = `# ${list.listName}\n\n`;
        const linksMarkdown = list.links.map(item => {
            return `-[${item.note}](${item.url})`;
        }).join('\n');
        
        exportData += heading + linksMarkdown + '\n\n';
    });

    let blob = new Blob([exportData], {type: "text/markdown;charset=utf-8"});
    saveAs(blob, "Saved Tabs.md");
}

function importMultipleLists(e) {
    let file = e.target.files[0];
    if (!file) {
        return;
    }

    let reader = new FileReader();
    reader.onload = (e) => {
        const contents = e.target.result;
        const listSections = contents.split(/(?=# )/);
        let allLists = [];

        listSections.forEach(section => {
            let lines = section.trim().split('\n');
            if (lines.length > 0) {
                const listName = lines[0].replace(/^# /, '');

                const links = lines.slice(1).map(line => {
                    let matches = line.match(/\-\[(.*?)\]\((.*?)\)/);
                    if (matches && matches.length === 3) {
                        return {
                            note: matches[1],
                            url: matches[2]
                        };
                    }
                    return null;
                }).filter(item => item !== null);

                allLists.push({
                    listName: listName,
                    links: links
                });
            }
        });

        currentList = noteArray.length - 1;
        noteArray = noteArray.concat(allLists);
        currentList++;
        localStorage.setItem('noteArray', JSON.stringify(noteArray));
        localStorage.setItem('currentList', JSON.stringify(currentList));

        closeModal();
        render();
    };

    reader.readAsText(file);
}



function copyToClipboard(){
    let exportArray =noteArray[currentList].links.map(function(item){
        return `- [${item.note}]` + `(${item.url})`
    })
    navigator.clipboard.writeText(exportArray.join('\n'))
}

function tooltipStyle(action){
    const tooltip = document.getElementById(`${action}-tooltip`);
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
                    <a class="text-link" href="${item.url}" target="_blank">${item.note}</a>
                </div>
            </li>
            <img 
                src="./images/MinusCircle.svg"
                class="delete-btn drop-shadow" 
                data-remove="${index}">
        </div>
        `
    })
    linksList.innerHTML = listHtml
}

noteInput.focus()

chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    noteInput.placeholder = tabs[0].title
})

function encodeHTML(text) {
    let element = document.createElement("div");
    element.textContent = text;
    return element.innerHTML;
}

render()