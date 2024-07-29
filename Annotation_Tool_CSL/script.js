let selectedColor = '';
let selectedLabelName = '';
const labelColors = {
    'reference word': '#ffadad',
    'noun & verb collocation in proper form': '#ffd6a5',
    'code-switching for communicative purposes': '#fdffb6',
    'negotiation of meaning': '#caffbf',
    'tense choice to indicate interactive aims': '#9bf6ff',
    'routinized resources': '#a0c4ff',
    'subordinate clauses': '#bdb2ff',
    'backchannels': '#ff7eb9',
    'question-based responses': '#ff65a3',
    'formulaic responses': '#7afcff',
    'collaborative finishes': '#feff9c',
    'epistemic copulas': '#fff740',
    'epistemic modals': '#ff9ee7',
    'adjectives/adverbs expressing possibility': '#ffd700',
    'non-factive verb phrase structure': '#c1aff0',
    'impersonal subject + non-factive verb + NP': '#6eb5ff',
    'feedback in the next turn': '#ffc8a2',
    'topic extension with clear new context': '#a79aff',
    'topic extension under the previous direction': '#ffaaa5',
    'topic extension with the same content': '#a8e6cf',
    'repeat and no topic extension': '#dcedc1',
    'no topic extension and stop the topic at this point': '#ff8b94',
    'conversation opening：nice opening':'#ffcccb',
    'conversation opening：sounded greeting': '#ffcccb',
    'conversation opening：general greeting': '#ffcccb',
    'conversation opening：short greeting': '#ffcccb' ,
    'conversation opening：no opening': '#ffcccb', 
    'conversation closing： nice closing': '#f3d1f4',
    'conversation closing： general closing': '#f3d1f4',
    'conversation closing： beief closing': '#f3d1f4',
    'conversation closing：no closing': '#f3d1f4',
    'overall tone choice: very formal': '#d5a6bd',
    'overall tone choice: quite formal and some expressions are not that formal': '#cfe2f3',
    'overall tone choice: relatively not formal, most expressions are quite informal': '#d9ead3',
    'overall tone choice: quite informal, but some expressions are still formal': '#fce5cd',
    'overall tone choice: very informal': '#fff2cc',
};

function addCustomLabel(labelName) {
    const labelsContainer = document.getElementById('labels-container');
    const labelWrapper = document.createElement('div');
    labelWrapper.className = 'label-wrapper';

    const newButton = document.createElement('button');
    newButton.className = 'label-btn';
    newButton.textContent = labelName;

    const color = labelColors[labelName] || '#cccccc';
    newButton.style.backgroundColor = color;
    newButton.dataset.color = color;
    newButton.addEventListener('click', function() {
        selectedColor = this.dataset.color;
        selectedLabelName = labelName;
    });

    labelWrapper.appendChild(newButton);
    labelsContainer.appendChild(labelWrapper);
}

document.getElementById('add-custom-label').addEventListener('click', function() {
    const customLabelName = document.getElementById('custom-label-name').value.trim();
    if (customLabelName) {
        addCustomLabel(customLabelName);
        document.getElementById('custom-label-name').value = '';
    } else {
        alert('label name can not be empty.');
    }
});

function clearHighlights() {
    document.querySelectorAll('.highlight').forEach(highlight => {
        const textNode = document.createTextNode(highlight.textContent);
        highlight.parentNode.replaceChild(textNode, highlight);
    });
}

document.getElementById('clear-highlights').addEventListener('click', clearHighlights);

function cancelHighlight(event) {
    if (event.target.classList.contains('highlight')) {
        const textNode = document.createTextNode(event.target.textContent);
        event.target.parentNode.replaceChild(textNode, event.target);
    }
}

let isDeleteModeActive = false;
document.getElementById('delete-highlight').addEventListener('click', function() {
    const contentDiv = document.getElementById('dialogue-content');
    if (!isDeleteModeActive) {
        contentDiv.addEventListener('click', cancelHighlight, true);
        this.textContent = 'Click highlighted text to cancel highlighting';
        this.style.backgroundColor = '#aaa';
    } else {
        contentDiv.removeEventListener('click', cancelHighlight, true);
        this.textContent = 'Cancel Highlight';
        this.style.backgroundColor = '#0056b3';
    }
    isDeleteModeActive = !isDeleteModeActive;
});

document.getElementById('dialogue-content').addEventListener('mouseup', function() {
    if (selectedColor && window.getSelection().toString().trim() !== '') {
        highlightSelection(selectedColor);
    }
});

function highlightSelection(color) {
    const selection = window.getSelection();
    if (!selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.backgroundColor = color;
        span.classList.add('highlight');
        span.setAttribute('data-label', selectedLabelName);
        range.surroundContents(span);
        selection.removeAllRanges();
    }
}

document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {
            type: 'array',
            cellDates: true,
            cellNF: false,
            cellText: false
        });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        dialogues = XLSX.utils.sheet_to_json(worksheet, {
            raw: false,
            dateNF: "HH:mm:ss"
        });
    };
    reader.readAsArrayBuffer(file);
});

document.getElementById('confirm-button').addEventListener('click', function() {
    const contentDiv = document.getElementById('dialogue-content');
    contentDiv.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['Speaker', 'Content'];

    headers.forEach((headerText, index) => {
        const header = document.createElement('th');
        header.textContent = headerText;
        header.classList.add(index < 2 ? 'fixed-width' : 'content-column');
        headerRow.appendChild(header);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    dialogues.forEach(dialogue => {
        const row = document.createElement('tr');
        headers.forEach(header => {
            const cell = document.createElement('td');
            cell.textContent = dialogue[header];
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    contentDiv.appendChild(table);

    document.getElementById('download-button').style.display = 'block';
});

function collectAnnotatedData() {
    const annotatedData = [];
    const labelLevels = {
        'reference word': 'Token level',
        'noun & verb collocation in proper form': 'Token level',
        'code-switching for communicative purposes': 'Token level',
        'negotiation of meaning': 'Token level',
        'tense choice to indicate interactive aims': 'Token level',
        'routinized resources': 'Token level',
        'subordinate clauses': 'Token level',
        'backchannels': 'Utterance level',
        'question-based responses': 'Utterance level',
        'formulaic responses': 'Utterance level',
        'collaborative finishes': 'Utterance level',
        'epistemic copulas': 'Utterance level',
        'epistemic modals': 'Utterance level',
        'adjectives/adverbs expressing possibility': 'Utterance level',
        'non-factive verb phrase structure': 'Utterance level',
        'impersonal subject + non-factive verb + NP': 'Utterance level',
        'feedback in the next turn': 'Utterance level',
        'topic extension with clear new context': 'Dialogue level',
        'topic extension under the previous direction': 'Dialogue level',
        'topic extension with the same content': 'Dialogue level',
        'repeat and no topic extension': 'Dialogue level',
        'no topic extension and stop the topic at this point': 'Dialogue level',
        'conversation opening：nice opening': 'Dialogue level',
        'conversation opening：sounded greeting': 'Dialogue level',
        'conversation opening：general greeting': 'Dialogue level',
        'conversation opening：short greeting': 'Dialogue level',
        'conversation opening：no opening': 'Dialogue level', 
        'conversation closing： nice closing': 'Dialogue level',
        'conversation closing： general closing': 'Dialogue level',
        'conversation closing： beief closing': 'Dialogue level',
        'conversation closing：no closing': 'Dialogue level',
        'overall tone choice: very formal': 'Dialogue level',
        'overall tone choice: quite formal and some expressions are not that formal': 'Dialogue level',
        'overall tone choice: relatively not formal, most expressions are quite informal': 'Dialogue level',
        'overall tone choice: quite informal, but some expressions are still formal': 'Dialogue level',
        'overall tone choice: very informal': 'Dialogue level',
    };

    document.querySelectorAll('.highlight').forEach((highlight) => {
        const tableRow = highlight.closest('tr');
        if (!tableRow) return;

        const speaker = tableRow.cells[0].textContent;
        const label = highlight.getAttribute('data-label');
        const labelLevel = labelLevels[label] || 'Unknown';
        const fullText = tableRow.cells[1].textContent;
        const highlightedText = highlight.textContent;
        const formattedText = fullText.replace(highlightedText, `&&&&${highlightedText}&&&&`);

        annotatedData.push({ Speaker: speaker, Label: label, LabelLevel: labelLevel, Content: formattedText });
    });
    return annotatedData;
}

function downloadExcel(data) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Annotations');
    XLSX.writeFile(workbook, 'annotations.xlsx');
}

document.getElementById('download-button').addEventListener('click', () => {
    const data = collectAnnotatedData();
    downloadExcel(data);
});

document.addEventListener('DOMContentLoaded', function() {
    const labelsContainer = document.querySelector('#labels-container');
    const toggleBtn = document.getElementById('toggle-labels-btn');
    const bodyStyle = document.body.style;
    labelsContainer.style.display = 'none';
    bodyStyle.paddingTop = '50px';
    let labelsVisible = false;

    toggleBtn.addEventListener('click', function() {
        if (!labelsVisible) {
            labelsContainer.style.display = 'block';
            toggleBtn.textContent = 'Hide Labels';
            bodyStyle.paddingTop = '450px';
        } else {
            labelsContainer.style.display = 'none';
            toggleBtn.textContent = 'Show Labels';
            bodyStyle.paddingTop = '50px';
        }
        labelsVisible = !labelsVisible;
    });

    function addLabelsSection(titleText, labelsArray) {
        const titleLabel = document.createElement('h2');
        titleLabel.textContent = titleText;
        labelsContainer.appendChild(titleLabel);

        labelsArray.forEach(label => {
            addCustomLabel(label);
        });
    }

    addLabelsSection('Token level labels:', [
        'reference word',
        'noun & verb collocation in proper form',
        'code-switching for communicative purposes',
        'negotiation of meaning',
        'tense choice to indicate interactive aims',
        'routinized resources',
        'subordinate clauses'
    ]);

    addLabelsSection('Utterance level labels:', [
        'backchannels',
        'question-based responses',
        'formulaic responses',
        'collaborative finishes',
        'epistemic copulas',
        'epistemic modals',
        'adjectives/ adverbs expressing possibility',
        'non-factive verb phrase structure',
        'impersonal subject + non-factive verb + NP',
        'feedback in the next turn'
    ]);

    addLabelsSection('Dialogue level labels:', [
        'topic extension with clear new context',
        'topic extension under the previous direction',
        'topic extension with the same content',
        'repeat and no topic extension',
        'no topic extension and stop the topic at this point',
        'conversation opening：nice opening',
        'conversation opening：sounded greeting',
        'conversation opening：general greeting',
        'conversation opening：short greeting' ,
        'conversation opening：no opening', 
        'conversation closing： nice closing',
        'conversation closing： general closing',
        'conversation closing： beief closing',
        'conversation closing：no closing',
        'overall tone choice: very formal',
        'overall tone choice: quite formal and some expressions are not that formal',
        'overall tone choice: relatively not formal, most expressions are quite informal',
        'overall tone choice: quite informal, but some expressions are still formal',
        'overall tone choice: very informal'
    ]);
});


