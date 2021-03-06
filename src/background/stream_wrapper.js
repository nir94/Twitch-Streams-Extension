"use strict"

function compileLiveStreamData(compilationParameters){
    let uuid = uuidv4();
    return {
        uuid,
        channelName: compilationParameters.data.channelName,
        sorting: {
            viewers: compilationParameters.data.viewers,
            channelName: compilationParameters.data.channelName,
            gameName: compilationParameters.data.game
        },
        misc: {
            showThumbnails: compilationParameters.settings.thumbnailsEnabled
        },
        streamFrame: `
            <a href="#" class="stream_link" id="${uuid}">
                <div class="stream_link_wrapper">
                    ${buildStreamFrame(compilationParameters)}
                </div>
            </a>`
    };
}

function buildStreamFrame(compilationParameters) {
    return `
        <div class="upper_framme">
            ${buildUpperFramePart(compilationParameters)}
        </div>
        <div class="stream_header_separator"></div>
        <div class="stream_frame">
            <div class="live_stream_information_frame">
                ${buildStreamInformationFrame(compilationParameters)}
            </div>
            ${buildStreamImageFrame(compilationParameters)}
        </div>`;
}

function buildUpperFramePart(compilationParameters) {
    let viewersWithSpaces = compilationParameters.data.viewers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return `
        <div class="upper_channel_name">${compilationParameters.data.channelName}</div>
        <div class="upper_channel_viewers">(${viewersWithSpaces})</div>
        <div class="upper_channel_uptime">Live: ${compilationParameters.data.channelUptime}</div>`;
}

function buildLowerFramePart(compilationParameters) {
    return `
        <div class="live_stream_information_frame">
            ${buildStreamInformationFrame(compilationParameters)}
        </div>`;
}

function buildStreamInformationFrame(compilationParameters) {
    let channelTitle = "";
    if(compilationParameters.settings.thumbnailsEnabled == true && compilationParameters.data.channelTitle.length > 80) {
        channelTitle = compilationParameters.data.channelTitle.substring(0, 80) + "...";
    } else if (compilationParameters.settings.thumbnailsEnabled == false && compilationParameters.data.channelTitle.length > 120){
        channelTitle = compilationParameters.data.channelTitle.substring(0, 120) + "...";
    } else {
        channelTitle = compilationParameters.data.channelTitle;
    }

    return `
        <div class="channel_game">${compilationParameters.data.game}</div>
        <div class="channel_title">${channelTitle}</div>`
}

function buildStreamImageFrame(compilationParameters) {
    if(compilationParameters.settings.thumbnailsEnabled){
        return `
            <div class="live_stream_image">
                <img src="${compilationParameters.data.previewImageUrl}" class="channel_image" />
            </div>`;
    }
    return '';
}

// Helper function
function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
  }