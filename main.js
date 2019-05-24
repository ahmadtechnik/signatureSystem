/**
 * import importants libs
 */
var httpManagment = require("./HTTPs/httpserver");
//var electronManager = require("./electron/electronManager");
var socketIOManager = require("./socket.ioManager/socket-io");

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
    var http = openPorts.http;
    var https = openPorts.https;
    var expressApp = openPorts.expressApp;
    
  }
});