/** ------------------------------------------ home page actions ------------------------------------- */
/**
 * Start socket io to 
 */

var socket = io.connect("/server_side_device" /*`${protocol}://${hostname}:${portinuse}`*/ );
socket.on("connect", () => {
    common.onServerConnected()
})
socket.on("comingRequestToServer", (data) => {
    common.onClientRequested(data);
})
// global vars .
var _QR_CODE_PLACE = null;

var _LOCATION_URL_DATA = {
    PROTOCOL: window.location.protocol,
    HOSTNAME: window.location.hostname,
    PORT: window.location.port,
    CLIENT: "client_side_home"
}
var _QR_CODE_CONTAINER = document.getElementById("qr_client_link_path");


/**
 * shortcut to emit data to server
 * side then the server shuld emit 
 * the data to client-side page
 * @param {String} key 
 * @param {object} data 
 */
var emitData = (key, data) => {
    socket.emit(key, data);
}
/** on client-side disconnected */
socket.on("newClintConnected", (d) => {})

/**
 * set document on ready
 */
$(document).ready(() => {
    /**
     * Set btn Action : to load upload JES page
     * **/
    $(`#showUploadDocumentForm`).click(loadUploadDocumentSection);
    /**
     * set hsow files history btn action 
     */
    $(`#showFilesHistory`).click(showFilesHistoryBtnAction);

    // generate qr code for client side
    new QRCode(_QR_CODE_CONTAINER, {
        text: `${_LOCATION_URL_DATA.PROTOCOL}//${_LOCATION_URL_DATA.HOSTNAME}:${_LOCATION_URL_DATA.PORT}/${_LOCATION_URL_DATA.CLIENT}`,

        width: 150,
        height: 150,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

   
})

function showFilesHistoryBtnAction(event) {
    common.emitMSG({msg : "clearPad"});
    /**
     * to close the sidebare menu after loading the page
     */
    $('.ui.sidebar').sidebar('toggle');
    /** change page title to the requsted page */
    $(`#pageTitle`).text("File history.");

    socket.emit("historyTest", {
        asdsd: "adasd"
    })

}


function loadUploadDocumentSection(event) {
    /**
     * Clean the container before receiving coming response
     */
    $(`#loadPagesSection`).html("");
    $.ajax({
        url: "upload_document",
        type: "GET",
        success: (data) => {
            $(`#loadPagesSection`).html(data);
        },

    });
    /**
     * to close the sidebare menu after loading the page
     */
    $('.ui.sidebar').sidebar('toggle');

    /** change page title to the requsted page */
    $(`#pageTitle`).text("Upload new file form.");
}


/*** -------------------------------------- upload form script --------------------------------------------- */
/**
 * 
 * @param {Object} response 
 */
function onUploadFileSuccessed(response) {
    /** 
     * in case the upload was successed, it should new 
     * to preview the file in the home page
     * **/
    if (response.status === "DONE") {
        /**
         * new the next step starts, which is to
         * select the signature places on the paper
         */
        $.ajax({
            url: "preview",
            method: "GET",
            success: (response) => {
                $(`#loadPagesSection`).html(response);
            }
        })

    }
}

/** ------------------ GENARAL FUNCTIONS --------------------- */

/**
 * progress to change the top progress bar
 */

function progressBar() {
    var xhr = $.ajaxSettings.xhr();
    xhr.onprogress = function e() {
        // For downloads
        if (e.lengthComputable) {
            var proc = (e.loaded / e.total * 100).toFixed();
            $("#uploadProgress").progress({
                percent: proc,
                onSuccess: () => {
                    $("#uploadProgress").css("display", "none");
                },
                onActive: () => {
                    $("#uploadProgress").css("display", "block");
                }
            });
        }
    };
    xhr.upload.onprogress = function (e) {
        // For uploads
        if (e.lengthComputable) {
            var proc = (e.loaded / e.total * 100).toFixed();
            $("#uploadProgress").progress({
                percent: proc,
                onSuccess: () => {
                    $("#uploadProgress").css("display", "none");
                },
                onActive: () => {
                    $("#uploadProgress").css("display", "block");
                }
            });
        }
    };
    return xhr;
}


/** requests from client  */
var common = {
    // shortcut to emit data to client-side device
    emitMSG: (msg) => {
        socket.emit("comingRequestToClient", msg);
    },
    // the first step after server connected to socket
    onServerConnected: () => {

    },
    // on client request to server 
    onClientRequested: (data) => {
        console.log(data)
        switch (data.msg) {
            case "padCleared":
                console.log("PAD CLEARED ...")
                break;

            default:
                break;
        }
    },

}