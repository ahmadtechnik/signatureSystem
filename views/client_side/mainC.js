/* GLOBAL VARs */
var _PDF_FILE_DOC = null;
var _NUM_PAGES = null;
var _PDF_PAGES_AS_CANVAS = null;

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
// start geting display dimantions
var dHeight, dWidth;


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
                showWaitModal();
                break;
            case "cancaled":
                $("#waitModal").modal("hide");
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
    $("#filePreviewSeciton").height(dHeight - (dHeight * 20 / 100));
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
    var file_name = data.requested_file_name;
    var posetions_data = data.postions_data;
    var file_extention = data.extention;

    console.log(data)

    $.ajax({
        url: "get_pdf_dile_by_name",
        method: "GET",
        contentType : "application/json",
        data: {
            fileName: file_name,
            fileType: file_extention
        },
        success: (data) => {
            window.open("data:application/pdf," + data);
            console.log(data)
            // send the comming file to pdf render
            PDFJS.getDocument(window.URL.createObjectURL(fi)).then((pdf) => {
                _PDF_FILE_DOC = pdf;
                _NUM_PAGES = pdf.numPages;
                for (let index = 0; index < _NUM_PAGES; index++) {
                    pdf.getPage(index + 1).then(page => {

                        singlePageHandling(page, index + 1);
                    })
                }
            })
        }
    })



}
/**
 * handling single page
 * _PDF_PAGES_AS_CANVAS
 */

function singlePageHandling(page, num) {
    // get orginal view port of the page
    var orginalViewPort = page.getViewport(0.5);
    var changedScal = page.getViewport(dWidth / page.getViewport(1).width);

    var xCanvas = document.createElement("canvas");
    xCanvas.setAttribute("id", "page_num_" + num);
    xCanvas.height = page.getViewport(0.5).height;
    xCanvas.width = page.getViewport(0.5).width;

    $(`#pdfRenderContainer`).append(xCanvas)


    // get canvas contaxt
    var context = xCanvas.getContext("2d");

    page.render({
        canvasContext: context,
        viewport: orginalViewPort
    })

}