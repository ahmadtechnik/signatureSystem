/** ------------------------------------------ home page actions ------------------------------------- */
/**
 * Start socket io to 
 */

var socket = io.connect("/server_side_device" /*`${protocol}://${hostname}:${portinuse}`*/ );
var _CLIENTS_COUNTR = 0;
socket.on("connect", () => {
    common.onServerConnected()
})
// on comint request to server from the client
socket.on("comingRequestToServer", (data) => {
    common.onClientRequested(data);
})

// global vars .
var _QR_CODE_PLACE = null;
var _COLLECTED_NAMES_FORM = null;

var _LOCATION_URL_DATA = {
    PROTOCOL: window.location.protocol,
    HOSTNAME: window.location.hostname,
    PORT: window.location.port,
    CLIENT: "client_side_home"
}
var _QR_CODE_CONTAINER = document.getElementById("qr_client_link_path");

// canvases after adding the signatrue on them
var canvasesAfterEditing = [];


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
    common.emitMSG({
        msg: "clearPad"
    });
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
        var timer;
        switch (data.msg) {
            case "clientConnected":
                common.client_side_device_connected();
                break;
            case "clientDisconnected":
                break;
            case "padCleared":
                console.log("PAD CLEARED ...")
                break;
            case "signPreview":
                var sign = data.data;
                // show received signature from client
                $(`#signaturePreviewImg`).attr("src", data.asImg);
                break;
            case "finishedSigning":
                // start puting data on the images
                processSignaturies(data)
                break;
            case "clintStartsSigning":
                $(`#signaturePreviewSection`).css("display", "block");
                clearTimeout(timer);
                timer = setTimeout(() => {
                    $(`#signaturePreviewSection`).css("display", "none");
                }, 5000)
                break;
        }
    },

    /** add action to count connected clients  */
    client_side_device_connected: () => {
        console.log("device added to counter")
        _CLIENTS_COUNTR++
    }
}

/** 
 * starting process puting the signature on the pages 
 * var pdfFile = null;
 * var _A4_ORIGINAL_WIDTH = 2480;
 * var imgHeight = null;
 * var pressedKeyboardKey = null;
 * var ctrlKey = false;
 * var onlicOne = false;
 * var cord = {};
 * var xCanvases = [];
 * var _PDF_DOC = null;
 * var _PDF_DOC_PAGES_NUM = 0;
 * var _PDF_PAGER = 1;
 * var storedCorns = [];
 * */


function processSignaturies(comingData) {
    // clear old canvases stored into object 
    canvasesAfterEditing = [];

    var signImgWidth = 500;
    // each the exits canvass
    $.each(xCanvases, (index, canvas) => {
        // create new canves
        var nCanvas = document.createElement("canvas");
        nCanvas.width = canvas.width;
        nCanvas.height = canvas.height;
        var nCanvasContext = nCanvas.getContext("2d");
        var pageNum = canvas.getAttribute("page_num");

        // append the new Canvas to body
        document.getElementsByTagName("body")[0].append(nCanvas);
        // draw old canvas on the new one
        nCanvasContext.drawImage(canvas, 0, 0);

        // check that there is places selected to put the signature in them
        if (storedCorns.length > 0 && labelsCounter !== 0) {
            // each the stored coords
            $.each(storedCorns, (index, obj) => {
                // be sure that the element wasent removes
                if (!obj.removed) {
                    var imgID = obj.imgID;
                    var X = obj.X;
                    var Y = obj.Y;
                    var cord_page_num = obj.pageNum;
                    var sign_num = obj.SN;

                    // in case the same page 
                    if (parseInt(cord_page_num) === parseInt(pageNum)) {
                        // now start to each the reveived data from signatur device
                        $.each(comingData.data, (index, signatureData) => {
                            // in case maches the signature number from client and server
                            if (parseInt(signatureData.signerNum) === parseInt(sign_num)) {
                                var pngData = signatureData.pngData;
                                var signName = signatureData.signName;
                                // create img element in the document.
                                var img = document.createElement("img");
                                img.width = signImgWidth;
                                img.src = pngData;

                                // append the sign to body
                                document.getElementsByTagName("body")[0].append(img);

                                // start draw the sign on the canvas 
                                nCanvasContext.drawImage(img, (X * 4) - (signImgWidth / 2), (Y * 4) - (img.height / 2));
                                console.log(`sign Name : ${signName} was drawed on the canvas num : `, pageNum)
                                // remove img
                                img.remove();
                            }
                        });
                    }
                }
            });
        } else {
            alert("NO PLACES SELECTED TO PUT THE SIGNATURE INSIDE... M1 ")
        }
        // show the changes..
        $(`img[pagenum=${pageNum}]`).attr("src", nCanvas.toDataURL("image/jpeg"));
        // push the canvas into object
        canvasesAfterEditing.push(nCanvas);

    });

    // Clear Coords object
    storedCorns = [];
    // unlock the display client sent responce .... 
    $(`#lockableModalContainer`).dimmer({
        closable: false
    }).dimmer("hide");
    // show the other buttons
    $(`.afterToolBtn`).css("display", "");
    /**
     * - get page one by one 
     * - search for on coordnts object if there any cord for thes page
     * - create copy canvas of the page
     * - add the signature into one by one
     * - then i need to hide submit action btns 
     * - show download pdf file or print btns
     */
}