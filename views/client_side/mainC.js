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
                showWaitModal();
                break;
            case "cancaled":
                $("#waitModal").modal("hide");
                break;
            default:
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