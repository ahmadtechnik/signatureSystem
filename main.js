/**
 * import importants libs
 */
var httpManagment = require("./HTTPs/httpserver");
//var electronManager = require("./electron/electronManager");
var socketIOManager = require("./socket.ioManager/socket-io");

var os = require("os")
var socketIOImport = require("./socket.ioManager/socket-io");

/**
 * first step, opening the HTTP and HTTPS services
 */
httpManagment.startListen((started, openPorts) => {
  /**
   * in case https and http from modul started
   */
  if (started) {

    /**
     * get HTTP and HTTPS objects to cotrol them
     */
    var https = openPorts.https;
    var expressApp = openPorts.expressApp;

    /** 
     * start socket io with the same server 
     * */
    socketIOImport.socketObjectSetter(https);



    /** print hostname to terminal */
    console.log("HOSTNAME : ", os.hostname());

  }
});