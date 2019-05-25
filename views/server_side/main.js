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
}


/** ------------------ GENARAL FUNCTIONS --------------------- */
