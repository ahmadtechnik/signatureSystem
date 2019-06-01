/* GLOBAL VARs */
var _PDF_FILE_DOC = null;
var _NUM_PAGES = null;
var _PDF_PAGES_AS_CANVAS = null;
var _PAGER = 1;

var _POS_DATA_ = null;
var _SENT_FILE_NAME = null;
var _SENT_FILE_TYPE = null;


var _SIGNATURE_CANVAS = null;
var _SIGNATURE_PAD_OBJECT;



// start geting display dimantions
var dHeight, dWidth;
//document.addEventListener('contextmenu', event => event.preventDefault());

// init socket connection... 
var socket = io.connect("/client_side_device");
socket.on("connect", () => {
    // call onClientConnectedToSocket
    comun.onClientConnectedToSocket();
})
// on new message to client-side device 
socket.on("comingRequestToClient", (data) => {
    comun.comingRequestToClient(data)
})

$(document).ready(() => {
    /** to change elements sizes if the display resized */
    elementsSizing();
    setNewSignatureTakerPace()
    $(window).resize(() => {
        elementsSizing();
        setNewSignatureTakerPace()
    });

    _SIGNATURE_CANVAS = document.getElementById("signDrowSecitonCanvas");
    _SIGNATURE_CANVAS.width = $(`#signDrowSeciton`).width();
    _SIGNATURE_CANVAS.height = $(`#signDrowSeciton`).height();

    // declare signature pad object
    _SIGNATURE_PAD_OBJECT = new SignaturePad(_SIGNATURE_CANVAS, {
        onBegin: padSignatureEvent.onBegin,
        onEnd: padSignatureEvent.onEnd,
        backgroundColor: "black",
        penColor: "white",

    });




    /** set control buttons aciton */
    $(`#clearSignaturBtn`).click(btnsActions.clearPadBtnAction)
    $(`#submitSignatureBtn`).click(btnsActions.SubmitPadBtnAction)
});

/********************************************************* */



var comun = {
    /** on client connected to socket */
    onClientConnectedToSocket: (data) => {
        console.log("Connected to socket", data);
    },
    /** on comingRequestToClient */
    comingRequestToClient: (data) => {
        var msg = data.msg;
        switch (msg) {
            case "confirmed":
                dimmerControler.showDimmer();
                break;
            case "cancaled":
                dimmerControler.hideDimmer();
                break;
            case "serverDis":
                window.location.reload();
                break;
            case "canvases":
                console.log(data);
                break;
            case "_signature_data":
                renderCurrentSentFile(data.data);
                break;
            case "clearPad":
                _SIGNATURE_PAD_OBJECT.clear();
                break;
            case "changePenColor":
                _SIGNATURE_PAD_OBJECT.penColor = data.newColor;
                break
            case "refresh":
                window.location.reload();
                break;
        }
    },
    // shortcut to emit message to server-side device
    emitMSG: (data) => {
        socket.emit("comingRequestToServer", data);
    }
}

// to control loading page show or hide
var dimmerControler = {
    showDimmer: () => {
        $(`.loadingDimmer`).dimmer({
            closable: false
        }).dimmer('show');
    },
    hideDimmer: () => {
        $(`.loadingDimmer`).dimmer({
            closable: false
        }).dimmer('hide');
    }
}

// buttons Actions
var btnsActions = {
    clearPadBtnAction: (evt) => {
        _SIGNATURE_PAD_OBJECT.clear();
        comun.emitMSG({
            msg: "padCleared"
        });
    },
    SubmitPadBtnAction: (evt) => {
        // check if the pad not empty before submiting the file
        if (!_SIGNATURE_PAD_OBJECT.isEmpty()) {
            _SIGNATURE_PAD_OBJECT.toDataURL("image/svg+xml");
        } else {
            alert("PLEASE SIGN THERE")
        }
    }
}

// signature pad aevents
// and controler
var padSignatureEvent = {
    onBegin: (data) => {},
    onEnd: (data) => {
        // to do , send the data after end first section to server 
        // to show preview of the signature
        comun.emitMSG(_SIGNATURE_PAD_OBJECT.toDataURL());
    }
}


/**
 * 
 */
function elementsSizing() {
    dHeight = $(window).height();
    dWidth = $(window).width();
    // set size of preview seciotn
    $("#filePreviewSeciton").height(dHeight - (dHeight * 20 / 100) - 3);
    $("#filePreviewSeciton").width(dWidth);
    // set size of signature section
    $("#signatureTakerSection").height(dHeight * 20 / 100);
    $("#signatureTakerSection").width(dWidth);
}
/**
 * 
 */
function setNewSignatureTakerPace() {
    $('#signaturiesInfoSeciton').css({
        right: "20px",
        top: "10px"
    })
}

/**
 * starting render pdf File
 */

function renderCurrentSentFile(data) {
    $(`#filePreviewSeciton`).html("");

    _SENT_FILE_NAME = data.requested_file_name;;
    _POS_DATA_ = data.postions_data;
    _SENT_FILE_TYPE = data.extention;

    console.log(data)

    $.ajax({
        url: "get_pdf_dile_by_name",
        method: "GET",
        contentType: "application/json",
        data: {
            fileName: _SENT_FILE_NAME,
            fileType: _SENT_FILE_TYPE
        },

        // after geting binary PDF from Server .
        success: (data) => {
            // read pdf document
            PDFJS.getDocument({
                data: data
            }).then((pdf) => {
                // make document global
                _PDF_FILE_DOC = pdf;
                _NUM_PAGES = pdf.numPages;
                pdf.getPage(_PAGER).then(singlePageHandling)
            })
        }
    })


}

/**
 * handling single page
 * _PDF_PAGES_AS_CANVAS
 */
function singlePageHandling(page) {
    // get orginal view port of the page
    // sotre basic dimantion of port view
    var oWidth = page.getViewport(1).width;
    var oHeight = page.getViewport(1).height;
    var cWidth = $(`#filePreviewSeciton`).width();
    var cHeight = $(`#filePreviewSeciton`).height();

    // store width of the new scaled sizes
    var viewPort = page.getViewport(cWidth / oWidth);

    // create new canvas to drow the page
    var xCanvas = document.createElement("canvas");
    xCanvas.setAttribute("id", "page_num_");
    xCanvas.height = viewPort.height;
    xCanvas.width = viewPort.width;
    xCanvas.style.display = "none"
    $(`#filePreviewSeciton`).append(xCanvas)


    // get canvas contaxt
    var context = xCanvas.getContext("2d");

    page.render({
        canvasContext: context,
        viewport: viewPort
    }).then(() => {
        // create image object 
        var imgObj = $(`<img/>`)
        imgObj.attr("src", xCanvas.toDataURL());
        imgObj.width(cWidth);
        $(`#filePreviewSeciton`).append(imgObj);
        if (_PAGER !== _NUM_PAGES) {
            _PAGER++;
            _PDF_FILE_DOC.getPage(_PAGER).then(singlePageHandling);
            $(`#filePreviewSeciton`).append("<hr>");
        } else {
            dimmerControler.hideDimmer();
        }
        $(`#pageAmountContainer`).text(_PAGER);
    })
}