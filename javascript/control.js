const url = 'http://www.omdbapi.com/';
const chromeStorageKey = 'mfcOmdbApiKey';

document.addEventListener('DOMContentLoaded', function(event) { 
    hideAllPanels();
    initEventListeners(); 
    initPanel(); 
  });

function initEventListeners() {
    document.getElementById('setApiKey').addEventListener('click', setApiKey); 
    document.getElementById('changeApiKeyButton').addEventListener('click', changeApiKey); 
    document.getElementById('infoButton').addEventListener('click', renderInfo); 
    document.getElementById('homeButton').addEventListener('click', renderHome); 
    document.getElementById('creditsButton').addEventListener('click', renderCredits); 
}

function renderInfo() {
    hideAllPanels();
    document.getElementById('info').style.display = '';
}

function renderHome() {
    hideAllPanels();
    initPanel(); 
}

function renderCredits() {
    hideAllPanels(); 
    document.getElementById('credits').style.display = '';
}

function renderInvalid() {
    hideAllPanels(); 
    document.getElementById('invalid').style.display = '';
}
function hideAllPanels() {
    document.getElementById('notSet').style.display = 'none';
    document.getElementById('set').style.display = 'none';
    document.getElementById('info').style.display = 'none';
    document.getElementById('credits').style.display = 'none';
    document.getElementById('invalid').style.display = 'none';  
}
function initPanel() {
    chrome.storage.sync.get(chromeStorageKey, function(result) { 
        if (result && result[chromeStorageKey]) {
            console.log('set');
            document.getElementById('set').style.display = '';
            document.getElementById('notSet').style.display = 'none';
        } else {
            console.log('notSet');
            document.getElementById('notSet').style.display = '';
            document.getElementById('set').style.display = 'none';
        }
    })
}

function setApiKey() {
    let apiKey = document.getElementById('apiKeyInput').value; 
    validateApiKey(apiKey).then(valid => {
        if (valid) {
            let apiJson = {}; 
            apiJson[chromeStorageKey] = apiKey; 
            chrome.storage.sync.set(apiJson, function(result) {
                document.getElementById('notSet').style.display = 'none';
                document.getElementById('set').style.display = 'block';
            })
        } else {
            document.getElementById('notSet').style.display = 'block';
            document.getElementById('set').style.display = 'none';
        }
    })
}

function changeApiKey() {
    chrome.storage.sync.remove(chromeStorageKey, function(result) { 
        document.getElementById('notSet').style.display = 'block';
        document.getElementById('set').style.display = 'none';
    }) 
}

async function validateApiKey(apiKey) {
    const validationURL = url + "?apikey=" + apiKey; 
    response = await fetch(validationURL, {method: 'post'});
    return response.status == 200; 
}