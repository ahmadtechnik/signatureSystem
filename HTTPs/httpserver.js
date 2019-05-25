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
    portscanner.findAPortNotInUse(3000, 3020, '0.0.0.0', function (error, port_) {
        console.log('HTTP ON PORT : ' + port_);
        httpServer.listen(port_, "0.0.0.0", (err) => {
            /**
             * in case there is no errors listening to port
             */
            if (!err) {
                /**
                 * in case there was no error opening http port
                 * it will start open the https port
                 * Start Check port in range from 20 to 100 to open httpsserver
                 */
                portscanner.findAPortNotInUse(3000, 3020, '0.0.0.0', function (error, port) {
                    console.log('HTTPS ON PORT : ' + port);
                    /**
                     *  start listening to HTTPS port
                     */
                    httpsServer.listen(port);
                    started(true, {
                        http: httpServer,
                        https: httpsServer,
                        expressApp: app
                    });


                })
            }
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
/**
 * use main dir server side
 */
app.use("/", express.static("views/server_side/"))

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
    res.render("server_side/index.ejs", {
        hostname: os.hostname(),
        portinuse: localPort,
        pagetitle: "K1 Computer Signature System"
    });
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
    var parserFrom = form.parse(req, onParse)
        .on("field", onField)
        .on("file", onFile)
        .on("fileBegin", onFileBegin)
        .on("progress", onProgress)
        .on("error", onError)
        .on("end", onEnd);
        
    /**
     * add listener on onParse for the form
     */
    function onParse(err, fields, files) {

    }
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
        console.log('Uploaded ' + file.name);
    };
    /**
     * set event on file uploading progrssing
     */
    function onProgress(bytesReceived, bytesExpected) {
        //console.log(((bytesReceived / fileSizeBytes) * 100).toFixed() + "%");
    };
    /**
     * 
     * on end action
     */
    function onEnd() {
        res.json({
            status: "DONE"
        })
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