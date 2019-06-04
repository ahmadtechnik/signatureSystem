/* GLOBAL VARs */
var _PDF_FILE_DOC = null;
var _NUM_PAGES = null;
var _PDF_PAGES_AS_CANVAS = null;
var _PAGER = 1;

var _POS_DATA_ = null;
var _SENT_FILE_NAME = null;
var _SENT_FILE_TYPE = null;


var _SIGNATURE_CANVAS = null;
var _SIGNATURE_PAD_CONTAINER = null;
var _SIGNATURE_PAD_OBJECT;


var _A4_ORIGINAL_WIDTH = 2480;

var _SIGNATURIES_DATA = null;

// start geting display dimantions
var dHeight, dWidth;
//document.addEventListener('contextmenu', event => event.preventDefault());

// init socket connection... 
var socket = io.connect("/client_side_device");
socket.on("connect", () => {
    // call onClientConnectedToSocket
    comun.onClientConnectedToSocket();
    comun.emitMSG({
        msg: "clientConnected"
    });
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
    _SIGNATURE_PAD_CONTAINER = document.getElementById("signDrowSeciton");

    _SIGNATURE_CANVAS.width = 500 //$(`#signDrowSeciton`).width();
    _SIGNATURE_CANVAS.height = 200 //$(`#signDrowSeciton`).height();
    _SIGNATURE_PAD_CONTAINER.width = 500 //$(`#signDrowSeciton`).width();
    _SIGNATURE_PAD_CONTAINER.height = 200 //$(`#signDrowSeciton`).height();

    // declare signature pad object
    _SIGNATURE_PAD_OBJECT = new SignaturePad(_SIGNATURE_CANVAS, {
        onBegin: padSignatureEvent.onBegin,
        onEnd: padSignatureEvent.onEnd,
        minWidth : 0.5,
        maxWidth : 2.5,
        throttle : 10,
        velocityFilterWeight : 0.7,
        minDistance : 0,
        dotSize : 1
    });


    /** set control buttons aciton */
    $(`#clearSignaturBtn`).click(btnsActions.clearPadBtnAction)
    $(`#submitSignatureBtn`).click((evt) => {
        btnsActions.SubmitPadBtnAction(evt)
    })


});



/**********************************************************/



var comun = {
    /** on client connected to socket */
    onClientConnectedToSocket: (data) => {
        console.log("Connected to socket", data);
    },
    /** on comingRequestToClient */
    comingRequestToClient: (data) => {
        console.log(data)
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
                _OBJ_FIRST = 1;
                _SIGNATURIES_DATA = data.data;
                renderCurrentSentFile(_SIGNATURIES_DATA);
                // init first signature name
                signaturiesFilter(_SIGNATURIES_DATA, _OBJ_FIRST);
                $(`#submitSignatureBtn`).removeClass("disabled");
                _SIGNATURE_PAD_OBJECT.clear();
                _SIGNS_DATA = [];
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

var _SIGNS_DATA = [];
var _OBJ_FIRST = 1;

// buttons Actions
var btnsActions = {
    clearPadBtnAction: (evt) => {
        _SIGNATURE_PAD_OBJECT.clear();
        comun.emitMSG({
            msg: "padCleared"
        });
        comun.emitMSG({
            msg: "signPreview",
            data: _SIGNATURE_PAD_OBJECT.toDataURL()
        });
    },
    // pad signature area submit btn
    SubmitPadBtnAction: (evt) => {
        // check if the pad not empty before submiting the file
        if (!_SIGNATURE_PAD_OBJECT.isEmpty()) {
            // create new canvas to trim blanck pixels
            // before send the signature
            var oldWidth = _SIGNATURE_CANVAS.width;
            var oldHeight = _SIGNATURE_CANVAS.height;


            cropImageFromCanvas(_SIGNATURE_CANVAS.getContext("2d"), _SIGNATURE_CANVAS);

            // check if the object of the imges still lass then signaturies number .

            // add the new signature to object
            _SIGNS_DATA.push({
                signImg: _SIGNATURE_PAD_OBJECT.toDataURL("image/svg+xml"),
                signName: _SIGNATURIES_DATA.signatoriesNamesForm[_OBJ_FIRST],
                pngData: _SIGNATURE_PAD_OBJECT.toDataURL(),
                numData: _SIGNATURE_PAD_OBJECT.toData(),
                signerNum: _OBJ_FIRST
            });

            _SIGNATURE_CANVAS.width = oldWidth;
            _SIGNATURE_CANVAS.height = oldHeight;

            _OBJ_FIRST++;

            var tname = _SIGNATURIES_DATA.signatoriesNamesForm[_OBJ_FIRST];
            if (tname === "") {
                $(`#signaturiesNum`).html(`<label class="ui header">Signer number : ${_OBJ_FIRST}</label>`);
            } else {
                $(`#signaturiesName`).html(`<label class="ui header">MR/MISS : ${tname}<sup>${_OBJ_FIRST}</sup></label>`);
            }

            // that's mean all parties was signed 
            // i have to re send data to server side
            if (_OBJ_FIRST - 1 === parseInt(_SIGNATURIES_DATA.signaturiesNum)) {
                // start transmition the data to server side device,
                // to start proccessing the images to download them as PDF
                comun.emitMSG({
                    msg: "finishedSigning",
                    data: _SIGNS_DATA,
                })

                $(`#submitSignatureBtn`).addClass("disabled");

                $(`#signaturiesNum`).html("");
                $(`#signaturiesName`).html("");

                dimmerControler.showDimmer();
            }

            _SIGNATURE_PAD_OBJECT.clear();
        } else {
            // start btn to start signaturies 
        }
    }
}

// signature pad aevents
// and controler
var padSignatureEvent = {
    onBegin: (data) => {
        comun.emitMSG({
            msg: "clintStartsSigning"
        })
    },
    onEnd: (data) => {
        // create new canvas to trim blanck pixels
        // before send the signature
        if (!_SIGNATURE_PAD_OBJECT.isEmpty()) {

            // create new canvas to avoid resize old one
            var nC = document.createElement("canvas");
            nC.style.display = "none";
            var nCC = nC.getContext("2d");
            nC.width = _SIGNATURE_CANVAS.width * 4;
            nC.height = _SIGNATURE_CANVAS.height * 4;
            nCC.drawImage(_SIGNATURE_CANVAS, 0, 0);

            //append the new canvas to body document
            document.getElementsByTagName("body")[0].appendChild(nC);
            // trim the canvas before pass the data to server-side device
            cropImageFromCanvas(nCC, nC);

            // to do , send the data after end first section to server 
            // to show preview of the signature
            comun.emitMSG({
                msg: "signPreview",
                data: _SIGNATURE_PAD_OBJECT.toData(),
                asImg: nC.toDataURL(),
            });

            nC.remove();
        } else {
            console.log("PLEASE PUT SOMTHING..")
        }
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
    // reset vars to avoid problems

    _PAGER = 1;
    _PDF_FILE_DOC = null;
    _NUM_PAGES = null;

    _SENT_FILE_NAME = data.requested_file_name;;
    _POS_DATA_ = data.postions_data;
    _SENT_FILE_TYPE = data.extention;
    // get wanted file
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

/**  */
function signaturiesFilter(data, nameIndex) {
    console.log(nameIndex);
    var signatoriesNamesForm = data.signatoriesNamesForm;

    // in case was signaturies number more then 1 

    var tname = signatoriesNamesForm[nameIndex];
    var index = nameIndex
    if (tname === "") {
        $(`#signaturiesNum`).html(`<label class="ui header">Signer number : ${index}</label>`);
    } else {
        $(`#signaturiesName`).html(`<label class="ui header">MR/MISS : ${tname}<sup>${index}</sup></label>`);
    }


    $(`#submitSignatureBtn`).removeClass("disabled");

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
    var viewPort = page.getViewport(_A4_ORIGINAL_WIDTH / oWidth);

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

/**
 * to trim canvos 
 * @param {canvasContext} ctx 
 * @param {canvas} canvas 
 */
function cropImageFromCanvas(ctx, canvas) {

    var w = canvas.width,
        h = canvas.height,
        pix = {
            x: [],
            y: []
        },
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height),
        x, y, index;

    for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
            index = (y * w + x) * 4;
            if (imageData.data[index + 3] > 0) {

                pix.x.push(x);
                pix.y.push(y);

            }
        }
    }
    pix.x.sort(function (a, b) {
        return a - b
    });
    pix.y.sort(function (a, b) {
        return a - b
    });
    var n = pix.x.length - 1;

    w = pix.x[n] - pix.x[0];
    h = pix.y[n] - pix.y[0];
    var cut = ctx.getImageData(pix.x[0], pix.y[0], w, h);

    canvas.width = w;
    canvas.height = h;
    ctx.putImageData(cut, 0, 0);
}