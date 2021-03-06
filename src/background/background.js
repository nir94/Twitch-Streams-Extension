"use strict"
const API_CLIENT_ID = "27rv0a65hae3sjvuf8k978phqhwy8v";
const LOGGING_ENABLED = false;

// ### Main object ###
let application = {
    startBackgroundLoop: function() {
        this.setBadgeDefaultValues();
        settingsAPI.loadSettings().then((res) => {
            if (LOGGING_ENABLED) 
                console.log("[TwitchStreams] Settings loaded");
            application.fastUpdate();
            passiveUpdateEngine.start();
        });
    },
    setBadgeDefaultValues: function() {
        browser.browserAction.setBadgeText({text: "0"});
        browser.browserAction.setBadgeBackgroundColor({color: "#6441A4"});
    },
    passiveUpdate: function() {
        setTimeout(passiveUpdateEngine.start, 180000);
    },
    fastUpdate: function() {
        // Get inital followers asynchronously
        let requestUrl = twitchAPI.follows.createUrl({ username: settingsAPI.username_cached, offset: 0 });
        twitchAPI.getAsync(requestUrl).then((response) => {
            let parsedResponse = twitchAPI.follows.parse(response.explicitOriginalTarget.response);
            //console.log(parsedResponse);
            twitchAPI.liveStream.processResult(parsedResponse.follows);
            let requestDetails = {
                getNext: (parsedResponse.follows.length > 0),
                username: settingsAPI.username_cached,
                offset: parsedResponse.follows.length,
                total: parsedResponse._total
            }
            // Process remaining follows
            while(requestDetails.offset < requestDetails.total) {
                let requestUrl = twitchAPI.follows.createUrl(requestDetails)
                requestDetails.offset += parsedResponse.follows.length;
                twitchAPI.getAsync(requestUrl).then((response) => {
                    let parsedResponse = twitchAPI.follows.parse(response.explicitOriginalTarget.response);
                    twitchAPI.liveStream.processResult(parsedResponse.follows);
                });
            }
            notificationEngine.init();
        });
    }
}

let session = {
    username: "",
    followsCount: 0,
    follows: [],
    live: []
}

let popup_state_handler = {
    popup_opened: false,
    popup_close_event_handler: function() {
        popup_state_handler.popup_opened = false;
    },
    popup_open_event_handler: function() {
        popup_state_handler.popup_opened = true;
    }
}

// PUBLIC FUNCTIONS - START

function getCurrentSession() {
    return session;
}

function getLiveStreamCount() {
    return session.live.length;
}

function getFollowsCount() {
    return userFollows.length;
}

function saveSettings(settingsSnapshot) {
    settingsAPI.setBrowserData(settingsSnapshot);
}

function getSettings() {
    return {
        username: settingsAPI.username_cached,
        sortingField: settingsAPI.sorting_field,
        sortingDirection: settingsAPI.sorting_direction,
        notificationsEnabled: settingsAPI.notifications_enabled,
        thumbnailsEnabled: settingsAPI.thumbnails_enabled
    }
}

function getUsername() {
    return session.username;
}

function getLiveStreams() {
    console.time('getLiveStreams_latency');
    const sortingDirection = settingsAPI.sorting_direction;
    const sortingField = settingsAPI.sorting_field;
    if(sortingField == "Viewers") {
        if(sortingDirection === "asc") {
            console.timeEnd('getLiveStreams_latency');
            return compiledStreams.streamsSortedByViewers;
        }
        // Descending
        console.timeEnd('getLiveStreams_latency');
        return compiledStreams.streamsSortedByViewers.slice().reverse();
    }
    if(sortingField == "Channel name") {
        if(sortingDirection === "asc") {
            console.timeEnd('getLiveStreams_latency');
            return compiledStreams.streamsSortedByChannelName;
        }
        // Descending
        console.timeEnd('getLiveStreams_latency');
        return compiledStreams.streamsSortedByChannelName.slice().reverse();
    }
    if(sortingField == "Game") {
        if(sortingDirection === "asc") {
            console.timeEnd('getLiveStreams_latency');
            return compiledStreams.streamsSortedByGame;
        }
        // Descending
        console.timeEnd('getLiveStreams_latency');
        return compiledStreams.streamsSortedByGame.slice().reverse();
    }
}

function forceRefresh() {
    application.fastUpdate();
}

// PUBLIC FUNCTIONS - END


// ### Event listeners ###
let messages = {
    "frontend_popup_closed": popup_state_handler.popup_close_event_handler,
    "frontend_popup_opened": popup_state_handler.popup_open_event_handler
};
browser.runtime.onMessage.addListener(messageReceived);
function messageReceived(message){
    if(messages.hasOwnProperty(message.title)){
        messages[message.title]();
    }
}

application.startBackgroundLoop();