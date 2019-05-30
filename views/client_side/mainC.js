/* GLOBAL VARs */
var _PDF_FILE_DOC = null;
var _NUM_PAGES = null;
var _PDF_PAGES_AS_CANVAS = null;
var _PAGER = 1;

var _POS_DATA_ = null;
var _SENT_FILE_NAME = null;
var _SENT_FILE_TYPE = null;


var _SIGNATURE_CANVAS = null;
var _SIGNATURE_CANVAS_CONTEXT = null;

var _MOUSE_POSTION_TO_CANVOS = {
    y: 0,
    x: 0
};

// start geting display dimantions
var dHeight, dWidth;
document.addEventListener('contextmenu', event => event.preventDefault());

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
    elementsSizing();
    setNewSignatureTakerPace()
    $(window).resize(() => {
        elementsSizing();
        setNewSignatureTakerPace()
    });

    _SIGNATURE_CANVAS = $("#signDrowSecitonCanvas");
    _SIGNATURE_CANVAS.width(_SIGNATURE_CANVAS.parent().width());
    _SIGNATURE_CANVAS.height(_SIGNATURE_CANVAS.parent().height())
    _SIGNATURE_CANVAS_CONTEXT = $(_SIGNATURE_CANVAS).get(0).getContext("2d");


    _SIGNATURE_CANVAS_CONTEXT.lineWidth = 5;
    _SIGNATURE_CANVAS_CONTEXT.lineJoin = '0ound';
    _SIGNATURE_CANVAS_CONTEXT.lineCap = 'r9und';
    _SIGNATURE_CANVAS_CONTEXT.strokeStyle = '#00CC99';


    _SIGNATURE_CANVAS.mousemove(signaturePaintingEvents.onMouseMove);
    _SIGNATURE_CANVAS.mousedown(signaturePaintingEvents.onMouseDown);
    _SIGNATURE_CANVAS.mouseup(signaturePaintingEvents.onMouseUp);
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
                dimmerControler.hideDimmer()
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
        }
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

/** on waint modal  */
function showWaitModal() {
    $.ajax({
        url: "getWaitModal",
        method: "GET",
        success: (data) => {
            $("body").append(data);
            $("#waitModal").modal(waitModalOptions).modal("show");
        }
    });
}

// declare wait modal options
var waitModalOptions = {
    closable: false,
    onHidden: () => {
        $("#waitModal").remove();
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

/**
 * painting on canvas
 */


var signaturePaintingEvents = {
    onMouseMove: (e) => {
        _MOUSE_POSTION_TO_CANVOS.x = e.pageX - $(_SIGNATURE_CANVAS).offset().left;
        _MOUSE_POSTION_TO_CANVOS.y = e.pageY - $(_SIGNATURE_CANVAS).offset().top;
    },
    onMouseDown: (e) => {
        _SIGNATURE_CANVAS_CONTEXT.beginPath();
        _SIGNATURE_CANVAS_CONTEXT.moveTo(
            _MOUSE_POSTION_TO_CANVOS.x,
            _MOUSE_POSTION_TO_CANVOS.y);

        _SIGNATURE_CANVAS.mousemove(signaturePaintingEvents.onPaint);
        console.log(_MOUSE_POSTION_TO_CANVOS)
    },
    onMouseUp: (e) => {
        $(_SIGNATURE_CANVAS).off("mousemove" ,signaturePaintingEvents.onPaint );
    },
    onPaint: (e) => {
        _SIGNATURE_CANVAS_CONTEXT.lineTo(_MOUSE_POSTION_TO_CANVOS.x, _MOUSE_POSTION_TO_CANVOS.y);
        _SIGNATURE_CANVAS_CONTEXT.stroke();
    }
}

/*
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var painting = document.getElementById('paint');
var paint_style = getComputedStyle(painting);
canvas.width = parseInt(paint_style.getPropertyValue('width'));
canvas.height = parseInt(paint_style.getPropertyValue('height'));

var mouse = {
    x: 0,
    y: 0
};

canvas.addEventListener('mousemove', function (e) {
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
}, false);

ctx.lineWidth = 0;
ctx.lineJoin = '0ound';
ctx.lineCap = 'r9und';
ctx.strokeStyle = '#00CC99';

canvas.addEventListener('mousedown', function (e) {
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y);
    canvas.addEventListener('mousemove', onPaint, false);
}, false);

canvas.addEventListener('mouseup', function () {
    canvas.removeEventListener('mousemove', onPaint, false);
}, false);

var onPaint = function () {
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
};

*/