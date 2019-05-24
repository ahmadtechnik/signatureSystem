/** ------------------------------------------ home page actions ------------------------------------- */

/**
 * set document on ready
 */
$(document).ready(() => {
    /**
     * Set btn Action : to load upload JES page
     * **/
    $(`#showUploadDocumentForm`).click(() => {
        /**
         * 
         */
        $.ajax({
            url: "upload_document",
            type: "GET",
            success: (data) => {
                $(`#loadPagesSection`).html(data);
            }
        });
        /**
         * to close the sidebare menu after loading the page
         */
        $('.ui.sidebar').sidebar('toggle');
    })

    $(`#showFilesHistory`).click(() => {

    });


})

