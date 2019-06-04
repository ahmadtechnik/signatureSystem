/**
 * import importants libs
 */
var httpManagment = require("./HTTPs/httpserver");
//var electronManager = require("./electron/electronManager");
var socketIOManager = require("./socket.ioManager/socket-io");

var os = require("os")
var socketIOImport = require("./socket.ioManager/socket-io");

// start with electron
var electronObj = require("./electron/electronManager");

var ip;
getIPv4()
electronObj.initElectronApp.initAppOnReady();
/**
 * first step, opening the HTTP and HTTPS services
 */
httpManagment.startListen((started, openPorts) => {
  electronObj.initElectronApp.initAppOnReady();
  /** in case https and http from modul started*/
  if (started) {
    //get HTTP and HTTPS objects to cotrol them
    var https = openPorts.https;
    var expressApp = openPorts.expressApp;
    // start socket io with the same server 
    socketIOImport.socketObjectSetter(https);
    // print hostname to terminal 
    console.log("HOSTNAME : ", os.hostname());

    // start main node app 
    electronObj.initElectronApp.mainWinLoadURL(`https://${ip}:3000/server_side_home`);
    console.log(`https://${getIPv4()}:3000/server_side_home`);
    serverStarted = true;
  }

});


// to get IPv4 
function getIPv4() {
  var ifaces = os.networkInterfaces();
  Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;

    ifaces[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }
      if (alias >= 1) {} else {
        // this interface has only one ipv4 adress
        if (ifname === "Ethernet") {
          ip = iface.address;
          return iface.address;
        }
      }
      ++alias;
    });
  });
}