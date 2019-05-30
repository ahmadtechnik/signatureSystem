/* GLOBAL VARs */
var _PDF_FILE_DOC = null;
var _NUM_PAGES = null;
var _PDF_PAGES_AS_CANVAS = null;
var _PAGER = 1;
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
    })
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
    var file_name = data.requested_file_name;
    var posetions_data = data.postions_data;
    var file_extention = data.extention;

    console.log(data)

    $.ajax({
        url: "get_pdf_dile_by_name",
        method: "GET",
        contentType: "application/json",
        data: {
            fileName: file_name,
            fileType: file_extention
        },

        success: (data) => {
            PDFJS.getDocument({
                data: data
            }).then((pdf) => {
                _PDF_FILE_DOC = pdf;
                _NUM_PAGES = pdf.numPages;
                pdf.getPage(_PAGER).then(singlePageHandling)

            })
        }
    })


    /**
     * 
     *             // send the comming file to pdf render
            PDFJS.getDocument(window.URL.createObjectURL(new File([data] ,file_name ))).then((pdf) => {
                _PDF_FILE_DOC = pdf;
                _NUM_PAGES = pdf.numPages;
                for (let index = 0; index < _NUM_PAGES; index++) {
                    pdf.getPage(index + 1).then(page => {

                        singlePageHandling(page, index + 1);
                    })
                }
            })
     */

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