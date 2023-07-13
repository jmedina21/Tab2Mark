const noteInput = document.getElementById('note-input')
const ulEL = document.getElementById('ul-el')
let noteArray = []

if(localStorage.getItem('noteArray')){
    noteArray = JSON.parse(localStorage.getItem('noteArray'))
    render()
}

document.addEventListener('keyup',function(e){
    if(e.key === 'Enter'){
        saveToArray()
    }
})

document.addEventListener('click',function(e){
    if(e.target.id === 'save-btn'){
        saveToArray()
    }else if(e.target.id === 'clear-btn'){
        localStorage.removeItem('noteArray')
        noteArray = []
        render()
    }else if(e.target.dataset.remove){
        removeLiItem(e.target.dataset.remove)
    }else if(e.target.id === 'export-btn'){
        exportArray()
    }else if(e.target.id === 'copy-markdown-btn'){
        copyToClipboard()
        tooltipStyle()
    }
})

function saveToArray(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        if(noteInput.value){
            noteArray.push({
                note: encodeHTML(noteInput.value),
                url: tabs[0].url,
            })
        }else{
            noteArray.push({
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
    noteArray.splice(id, 1)
    localStorage.setItem('noteArray',JSON.stringify(noteArray))
    render()
}

function exportArray(){
    let exportData =noteArray.map(function(item){
        return `- [${item.note}]` + `(${item.url})`
    }).join('\n');
    let blob = new Blob([exportData], {type: "text/markdown;charset=utf-8"})
    saveAs(blob, "Saved Tabs.md")
}

function copyToClipboard(){
    let exportArray =noteArray.map(function(item){
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
    let listHtml = ''
    noteArray.forEach(function(item, index){
        listHtml += `
        <div class="li-container">
            <li>
                <div class='ellipsis-text'>
                    <a href="${item.url}" target="_blank">${item.note}</a>
                </div>
            </li>
            <img 
                src= 'images/delete svg.svg' 
                class="delete-btn drop-shadow" 
                data-remove="${index}">
        </div>
        `
    })
    ulEL.innerHTML = listHtml
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