var pdf2pic = require("../pdf2immg/pdf2img")
var root_app = require("app-root-path");
var fileManger = require("../fileManager/fileManager");
var dateFormat = require('dateformat');

/**
 * init socket
 */
var socketObject = null;
var socket = null;
var clientSide
var serverside



exports.socketObjectSetter = (server) => {
    /**
     * Add socket io lib
     */
    const sockIO = require("socket.io")(server);
    socketObject = sockIO;
    sockIO.on("connection", onClientConnection);
    clientSide = sockIO.of("/client_side_device");
    serverside = sockIO.of("/server_side_device");

    /** --------------------------------- cleint side room ---------------------------------- */
    clientSide.on("connection", onClientSideConnected)

    /** --------------------------------- server side room ---------------------------------- */
    serverside.on("connection", onServerSideConnected);

}

/** export the total socket object */
exports.socketObjectGetter = () => {
    return socketObject;
}


/** socket getter */
exports.socketGetter = () => {
    return socket;
};

/** on client server side connected */
var onClientConnection = (client) => {

}
/** --------------------------------- cleint side room ---------------------------------- */
/** on client client-side connected  */
var onClientSideConnected = (client) => {
    console.log("client from client side connected ... " + client.id);
    client.on("disconnect", onClientSideDeviceDisconnected);
    /** inform server side home page, that there is an client connected..  */
    serverside.emit("newClintConnected", {
        clientConnected: client.id
    });

    /** on receiving message from client to server */
    client.on("comingRequestToServer", onComingRequestToServer)
}
/** on client client-side disconnected */
var onClientSideDeviceDisconnected = () => {
    console.log("client-side device disconnected");
    /** emit to server-side device that there an client-client side device is disconnected */
    serverside.emit("clientDisconnected", {});
}

var onComingRequestToServer = (data) => {
    serverside.emit("comingRequestToServer", data);
}

/** --------------------------------- server side room ---------------------------------- */
/** on client server-side connected */
var onServerSideConnected = (client) => {

    console.log("device connected to server side : " + client.id);
    client.on("disconnect", onServerSideDeviceDisconnected)

    /* on Cordinations serverSidePage */

    /** confirm file button cliecked onserver side */
    client.on("comingRequestToClient", comingRequestToClient)
    // on store imgages timp from server-side page
    client.on("storeTemp", onStoreTemp)
}
/** on client server-side disconnected */
var onServerSideDeviceDisconnected = () => {
    console.log("server-side device disconnected : ");
}


/**
 * on server side send message to client that 
 * there is an coming new file need to be signed
 */
var comingRequestToClient = (data) => {
    /** emit notifi  to client side to show wait page */
    clientSide.emit("comingRequestToClient", data)
}

/**
 * to save images in server in order to convert them
 * leter to PDF file using PDFkit 
 */
var onStoreTemp = (data) => {
    var canvass = data.canvs;
    var newFileName = data.fileName;
    var date = dateFormat(new Date(), "dd-mm-yyyy#");

    var newDirName = date + newFileName;
    console.log(newDirName);
    /**
     * in order to creating new folder for the new dir in temp folder
     */
    // to create new folder for the coming data
    var path = fileManger.createFolderIfNotExist(root_app + "/storage/tmp/" + newDirName);
    canvass.forEach((canvs, indx) => {
        // start storing the img in tmp file
        var base64Data = canvs.replace(/^data:image\/png;base64,/, "");

        require("fs").writeFileSync(path + "/" + newFileName + indx + ".png", base64Data, 'base64', function (err) {
            console.log(err)
        });
    });
}