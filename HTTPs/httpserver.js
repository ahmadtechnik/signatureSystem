var net = require("net");
var fs = require('fs');
var http = require('http');
var https = require('https');
var portscanner = require("portscanner");
var path = require('path');
var root_app = require("app-root-path");
var os = require("os");
var formidable = require("formidable");
var util = require("util");
var io = require("./../socket.ioManager/socket-io");

/**
 * SSL cert
 */
var privateKey = fs.readFileSync("./HTTPs/localhost.key", 'utf8');
var certificate = fs.readFileSync('./HTTPs/localhost.cert', 'utf8');
var credentials = {
    key: privateKey,
    cert: certificate
};


var express = require('express');
var app = express();
var router = express.Router();
var os = require("os");

/**
 * refrence to modul of node app
 * bootstrab
 */

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);


module.exports.startListen = function (started) {
    /**
     * 
     * Start Check port in range from 20 to 100 to open httpserver
     */


    /**
     * in case there was no error opening http port
     * it will start open the https port
     * Start Check port in range from 20 to 100 to open httpsserver
     */
    portscanner.findAPortNotInUse(3000, 3020, "0.0.0.0", function (error, port) {
        console.log('HTTPS ON PORT : ' + port);
        /**
         *  start listening to HTTPS port
         */
        httpsServer.listen(port, "0.0.0.0");

        started(true, {
            https: httpsServer,
            expressApp: app
        });


    })


}

/**
 * Set views dir
 */
app.set("views", root_app + '/views');
/**
 * Set engine to render ejs files
 */
app.engine('ejs', require('ejs').renderFile);
/**
 * Set type of engine 
 */
app.set('view engine', 'ejs');
/**
 * serve:
 *  bootstrap lib
 *  jquery
 *  jquery ui
 *  semantic ui CSS and JS
 */
app.use("/bootstrap", express.static("node_modules/bootstrap/dist/"));
app.use("/jquery", express.static("node_modules/jquery/dist/"));
app.use("/jquery-ui", express.static("node_modules/jquery-ui/"));
app.use("/semantic-ui", express.static("node_modules/semantic-ui-css/"));
app.use("/socket.io", express.static("node_modules/socket.io-client/dist/"));
app.use("/assets", express.static("views/assets/"));

app.use("/storage", express.static("storage/"));
/**
 * use main dir server side
 */
app.use("/", express.static("views/server_side/"));

/** use main dir client side  */
app.use("/", express.static("views/client_side/"));

/**
 * Select the home page for express server.
 */
app.get("/server_side_home", function (req, res) {
    /** 
     * store the local port of the server 
     * */
    var localPort = req.socket.localPort;

    /**
     * if user send get to get the server side main page
     * i have to send importatnt data to the view
     * pass data (hostname, port, page tilte)
     */
    getIPv4((ipv4) => {
        if (ipv4 !== false) {
            res.render("server_side/index.ejs", {
                hostname: os.hostname(),
                portinuse: localPort,
                pagetitle: "K1 Computer Signature System",
                protocol: req.protocol,
                route: "server_side_home",
                ipv4: ipv4
            });
        } else {
            console.log("in this device exist more then one ethernet device");
        }
    })
})

/**
 * To render upload EJS file
 */
app.get("/upload_document", (req, res) => {
    /** 
     * store the local port of the server 
     * */
    var localPort = req.socket.localPort;
    res.render("server_side/upload.ejs", {
        hostname: os.hostname(),
        portinuse: localPort,
        pagetitle: "K1 Computer Signature System"
    });
});

/**
 * set post action to receive file from client
 */
app.post("/uploaded_file", (req, res) => {
    /**
     * init formidable object to start receive data form
     */
    var form = new formidable.IncomingForm;
    /**
     * start parsing the reqest from client
     */
    var parserFrom = form.parse(req)
        .on("field", onField)
        .on("file", onFile)
        .on("fileBegin", onFileBegin)
        .on("progress", onProgress)
        .on("error", onError)
        .on("end", onEnd);
    /**
     * to get other params in the passed form data
     */
    function onField(name, filed) {

    };
    /**
     * store file's size in varible
     */
    var fileSizeBytes = parserFrom.bytesExpected;
    /**
     * set event on fileBegin
     */
    function onFileBegin(name, file) {
        file.path = root_app + '/storage/' + file.name;
    };
    /**
     * set event on file moved to Server
     */
    function onFile(name, file) {
        /** print uploaded file name */
        console.log('Uploaded ' + file.name, name);
    };
    /**
     * set event on file uploading progrssing
     */
    function onProgress(bytesReceived, bytesExpected) {};
    /**
     * 
     * on end action
     */
    function onEnd() {
        res.json({
            status: "DONE",
            fileLocation: root_app + '/storage/'
        });
    }
    /**
     * on Error action
     */
    function onError(err) {
        res.json({
            status: "ERR",
            err: err
        });
    }


})

/** 
 * on server side 
 * requst to get preview modal
 */
app.get("/preview", (req, res) => {
    res.sendFile(root_app + "/views/server_side/preview.html");
})
/**
 * on request to get pagesSelectorModal
 * 
 */
app.get(`/getPagesSelectorModal`, (req, res) => {
    res.sendFile(root_app + "/views/server_side/modules/pagesSelectorModal.html");
})
/**  --------------------------- CLIENT SIDE REQEQUSTS ----------------------- */
// send home page for client side
app.get("/client_side_home", (req, res) => {
    res.sendFile(root_app + "/views/client_side/index.html");
});

// send wait modal to client
app.get("/getWaitModal", (req, res) => {
    res.sendFile(root_app + "/views/client_side/modules/waiting.html");
})

// send pdf file by name
app.get("/get_pdf_dile_by_name", (response, request) => {
    var fileName = response.query.fileName;
    var fileType = response.query.fileType;
    var filePath = root_app + '/storage/' + fileName;
    request.writeHead(200, {
        'Content-Type': fileName,
        'Content-Disposition': `attachment; filename="${fileName}"`
    });
    console.log()
    request.end(fs.readFileSync(filePath, "binary"));
})



// extra 
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