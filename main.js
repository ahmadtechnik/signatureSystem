/**
 * import importants libs
 */
var httpManagment = require("./HTTPs/httpserver");
//var electronManager = require("./electron/electronManager");
var socketIOManager = require("./socket.ioManager/socket-io");

var os = require("os")
var socketIOImport = require("./socket.ioManager/socket-io");

// start with electron
//var electronObj = require("./electron/electronManager");


//electronObj.initElectronApp.initAppOnReady();
/**
 * first step, opening the HTTP and HTTPS services
 */
httpManagment.startListen((started, openPorts) => {
  //electronObj.initElectronApp.initAppOnReady();
  /** in case https and http from modul started*/
  if (started) {
    //get HTTP and HTTPS objects to cotrol them
    var https = openPorts.https;
    var expressApp = openPorts.expressApp;
    // start socket io with the same server 
    socketIOImport.socketObjectSetter(https);

    getIPv4((ip4) => {
      console.log(ip4);
    })

  }

});


// to get IPv4 
function getIPv4(ipGetter) {
  var ifaces = os.networkInterfaces();
  Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;
    ifaces[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }
      if (alias >= 1) {
        ipGetter(false);
      } else {
        // this interface has only one ipv4 adress
        if (ifname === "Ethernet") {
          ipGetter(iface.address);
        }
      }
      ++alias;
    });
  });
}