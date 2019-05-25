/** ------------------------------------------ home page actions ------------------------------------- */

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



})

function showFilesHistoryBtnAction(event) {

    /**
     * to close the sidebare menu after loading the page
     */
    $('.ui.sidebar').sidebar('toggle');
    /** change page title to the requsted page */
    $(`#pageTitle`).text("File history.");
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

    }
    console.log(response)
}


/** ------------------ GENARAL FUNCTIONS --------------------- */