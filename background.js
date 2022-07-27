const ytHandler = (tabId) => {
    chrome.tabs.get(tabId).then((tab) => {
        if (tab.url.match(/https:\/\/www\.youtube\.com\/watch\?v=(.*)/g)) {
            console.log('icone');
            chrome.action.setIcon({
                details: {
                    path: {
                        16: "icons/train-16.png",
                        32: "icons/train-32.png",
                        64: "icons/train-64.png"
                    }
                }
            });
        } else {
            chrome.action.setIcon({
                details: {
                    path: {
                        16: "icons/train-gray-16.png",
                        32: "icons/train-gray-32.png",
                        64: "icons/train-gray-64.png"
                    }
                }
            });
        }
    });
}

chrome.tabs.onActivated.addListener((activeInfo) => {
    ytHandler(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
    chrome.tabs.query({ currentWindow: true }).then((tabs) => {
        ytHandler(tabs[0].tabId);
    });
});

chrome.action.onClicked.addListener(tab => {
    if (tab.url.match(/https:\/\/www\.youtube\.com\/watch\?v=(.*)/g)) {
        const url = new URL(tab.url);
        
        if (url.searchParams.has('t')) {
            url.searchParams.delete('t');
        }

        const request = new XMLHttpRequest();
        request.open('POST', 'https://cabview.nkir.ch/api/videos');
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({ video: url }));
        request.onload = () => {
            if (request.status === 200) {
                browser.notifications.create('video-sent', {
                    type: 'basic',
                    iconUrl: browser.runtime.getURL('icons/train-64.png'),
                    title: 'CabView',
                    message: 'Vidéo envoyée avec succès !'
                });
            }

            if (request.status === 400) {
                browser.notifications.create('video-already-exists', {
                    type: 'basic',
                    iconUrl: browser.runtime.getURL('icons/train-gray-64.png'),
                    title: 'CabView',
                    message: JSON.parse(request.response).message
                });
            }
        }
    }
});