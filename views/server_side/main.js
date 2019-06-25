/** ------------------------------------------ home page actions ------------------------------------- */
/**
 * Start socket io to 
 */

var socket = io.connect("/server_side_device" /*`${protocol}://${hostname}:${portinuse}`*/ );


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

//
var _CLIENTS_COUNTR = [];
socket.on("connect", () => {
    common.onServerConnected();
    checkCleintSideDevicesFilter();
})
// on comint request to server from the client
socket.on("comingRequestToServer", (data) => {
    common.onClientRequested(data);
});
/**
 * this varable holding client-side devices IDs 
 * in case was this varable null or empty
 * the server should not do any thing befor
 * the user turn the client-side device on
 * to be sure that after all steps will never 
 * lost the data
 */
var _ALL_CLIENTS_SIDE_DEVICES_IDs = null;
/**
 * in case client device was disconnected to remove the device from list
 * - in this case i have to inform the server side devie user that 
 * - the client with the current ID was loged out from socket
 */
/** back response from getAllClientRequest */
socket.on("takeHereAllClients", (data) => {
    $(`.deviceIconBtn`).remove();
    var colors = ["blue", "red", "black", "orange", "tral", "yellow", "violet", "purple", "pink", "brown", "grey"];
    $.each(data, (element, index) => {
        var random = colors[Math.floor(Math.random() * colors.length)]
        var btn = $(`<div id="${element}" myColor="${random}" class="ui ${random} button icon  deviceIconBtn" data-position="right center"></div>`);
        btn.append(`<i class="laptop icon"></i>`);
        $(`#clientSideDevicesSimples`).append(btn);
        btn.popup({
            content: ".." + element.substr(element.length - 6)
        });
        btn.click(onClientSideDeviceBtnIcon);
    });
    _ALL_CLIENTS_SIDE_DEVICES_IDs = data;
    checkCleintSideDevicesFilter();
});

/** 
 * this function will filter the connected devices in case 
 * there was not any device connected it should alarm the 
 * user to turn the at least one client-side device on
 */
var _HIDER_TIMER = null;
var _INVERTEL = null;

function checkCleintSideDevicesFilter() {
    if (false) {
        var bodyDimmer = $(`body`).dimmer({
            closable: false,
            transition: "horizontal flip"
        });
        var modals = $(`.modal`);
        /**
         * make sure that the client devices container is not null object
         */
        var coverDimmer = bodyDimmer.dimmer("is active");

        var counter = $(`#timerCounter`);
        if (_ALL_CLIENTS_SIDE_DEVICES_IDs !== null) {
            /**
             * after making sure the client-side devices object is not null 
             * now we have to check if that object contain any device or not 
             * in case was not contain any device it should show alarm to
             * server-side device 
             */
            if (Object.keys(_ALL_CLIENTS_SIDE_DEVICES_IDs).length > 0) {
                bodyDimmer.dimmer('hide');
                // now pause the timer
                if (_HIDER_TIMER !== null) {
                    _HIDER_TIMER.pause();
                    _HIDER_TIMER = null;
                    _INVERTEL !== null ? clearInterval(_INVERTEL) : null;
                    console.log("Timer/interval Cleared ...");
                }
                counter.html("").transition("hide");
            } else {

                _HIDER_TIMER = new timer(() => {
                    /* show body dimmer to user */
                    bodyDimmer.dimmer('show');
                }, 10000);
                /** to get the left time from timer */
                _INVERTEL = setInterval(() => {
                    if (_HIDER_TIMER !== null) {
                        /** check if dimmer of body is not active to start showing counter */
                        if (_HIDER_TIMER.getTimeLeft() >= 0) {
                            counter.html((_HIDER_TIMER.getTimeLeft() / 1000).toFixed()).transition("show");
                        } else {
                            counter.html("").transition("hide");
                            _INVERTEL = null;
                            clearInterval(_INVERTEL);
                            _HIDER_TIMER = null;
                            clearTimeout(_HIDER_TIMER);
                        }
                    }
                }, 1000);
                modals.modal("hide");
            }
        } else {

        }
    }
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
    /**
     * get signature as png to copy it and past it anywhere
     */
    $(`#getSignAsPng`).click(getSignAsPng);


    // generate qr code for client side
    new QRCode(_QR_CODE_CONTAINER, {
        text: `${protocol}://${ipv4}:${portinuse}/${_LOCATION_URL_DATA.CLIENT}`,
        width: 150,
        height: 150,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    // make QR code draggable

    $(_QR_CODE_CONTAINER).draggable({
        containment: "body",
        scroll: false
    });

    /** request all clients from server */
    socket.emit("giveMeAllClients");
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
            case "padCleared":
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
                }, 5000);
                break;
            case "signaturesAsPngData":
                /** 
                 * this action will be active after the client send the data to server
                 * @signaturesData {object} signatures object to hold object of data
                 *  */
                var signaturesData = data.data;
                var holderElement = $(`#communClientSectionPNGGetter`);
                $.each(signaturesData, (index, value) => {
                    var signatureData = value.signData;
                    var signautreIndex = value.signIndex;

                    var img = $(`<div class="ui segment" id="img_${index + 1}"><img class="signaturePNGimg" src="${signatureData}"/></div>`);

                    var imgHolder = $(`<div class="ui column SignaturePNGimageContainer" ></div>`);
                    var copyBtn = $(`<div class="ui button blue icon mini copyImageToClipboard"><i class="copy icon"></i></div>`);

                    copyBtn.click(() => {

                    });

                    imgHolder.append(img);
                    imgHolder.append(`<span>Signum : ${index + 1}</span>`);
                    imgHolder.append(copyBtn);
                    holderElement.append(imgHolder);
                });
                break;
        }
    },

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
    // remove previos Canvass 
    $(`.afterCanvas`).remove();
    // clear old canvases stored into object 
    canvasesAfterEditing = [];

    var signImgWidth = 400;
    // each the exits canvass
    $.each(xCanvases, (index, canvas) => {
        // create new canves
        var nCanvas = document.createElement("canvas");
        nCanvas.width = canvas.width;
        nCanvas.height = canvas.height;
        var nCanvasContext = nCanvas.getContext("2d");
        var pageNum = canvas.getAttribute("page_num");

        nCanvas.setAttribute("class", "afterCanvas");

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
                                nCanvasContext.drawImage(
                                    img,
                                    X * 5 - (signImgWidth / 2),
                                    Y * 5 - (img.height / 2),
                                    signImgWidth,
                                    img.height
                                );
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


// to observe any element added to other element
var onAppend = function (elem, f) {
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
            if (m.addedNodes.length) {
                f(m.addedNodes)
            }
        })
    })
    observer.observe(elem, {
        childList: true
    });
}

/**
 * @param {object} evt 
 */
var getSignAsPng = (evt) => {
    var response = $.ajax({
        async: false,
        url: "getSignAsPNG",
        success: (data) => {
            
        }
    });
    if (response.status === 200) {
        $(`#loadPagesSection`).html(response.responseText);
    }
    $('.ui.sidebar').sidebar('toggle');
};

// on connected device icon btn
// in case server-side device user clicked
// on some device-button refresh the device
// 
function onClientSideDeviceBtnIcon() {
    /** get  the device id */
    var deviceID = $(this).attr("id");
    common.emitMSG({
        msg: "spacRefresh",
        targetedClient: deviceID,
    });
    $(this).remove();
}

/**
 * in case i want get leaft time in timersetout function
 * in this case i choose the timer then
 */

var nativeSetTimeout = window.setTimeout;
window.bindTimeout = function (listener, interval) {

    function setTimeout(code, delay) {
        var elapsed = 0,
            h;

        h = window.setInterval(function () {
            elapsed += interval;
            if (elapsed < delay) {
                listener(delay - elapsed);
            } else {
                window.clearInterval(h);
            }
        }, interval);
        return nativeSetTimeout(code, delay);
    }

    window.setTimeout = setTimeout;
    setTimeout._native = nativeSetTimeout;
};




function timer(callback, delay) {
    var id, started, remaining = delay,
        running

    this.start = function () {
        running = true
        started = new Date()
        id = setTimeout(callback, remaining)
    }

    this.pause = function () {
        running = false
        clearTimeout(id)
        remaining -= new Date() - started
    }

    this.getTimeLeft = function () {
        if (running) {
            this.pause()
            this.start()
        }

        return remaining
    }

    this.getStateRunning = function () {
        return running
    }

    this.start()
}

/**
 * @param {element} element 
 * this function to copy the image from signature image 
 * to clipboard.
 */

function SelectText(element) {
    var doc = document;
    if (doc.body.createTextRange) {
        var range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (window.getSelection) {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}