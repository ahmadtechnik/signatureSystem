var pdf2pic = require("../pdf2immg/pdf2img")
var root_app = require("app-root-path");
var fileManger = require("../fileManager/fileManager");
/**
 * init socket
 */
var socketObject = null;
var socket = null;


exports.socketObjectSetter = (server) => {

    /**
     * Add socket io lib
     */

    const sockIO = require("socket.io")(server);
    socketObject = sockIO;


    sockIO.on("connection", onClientConnection);
    var clientSide = sockIO.of("/client_side_device");
    var serverside = sockIO.of("/server_side_device");
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
}
/** on client client-side disconnected */
var onClientSideDeviceDisconnected = () => {
    console.log("client-side device disconnected : ");
}




/** --------------------------------- server side room ---------------------------------- */
/** on client server-side connected */
var onServerSideConnected = (client) => {
    console.log("device connected to server side : " + client.id);
    client.on("disconnect", onServerSideDeviceDisconnected)
    /** on order to convert pdf file by file name */
    client.on("orderToConverTheFile", pdfToPICconverter)
}
/** on client server-side disconnected */
var onServerSideDeviceDisconnected = () => {
    console.log("server-side device disconnected : ");
}

/** order to convert the pdf file */
var pdfToPICconverter = (data) => {
    /** call the pdf2pic converter */

}