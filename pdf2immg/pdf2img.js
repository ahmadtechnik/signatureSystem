/**
 * this modul responsible for converting pdf files to IMG
 */

var fs = require("fs");

exports.convertPDF = (filePath, outputDIR, size) => {

    var PDFImage = require("pdf-image").PDFImage;

    var pdfImage = new PDFImage(filePath, {
        outputDirectory: outputDIR
    });
    console.log(pdfImage)
    pdfImage.convertFile().then(function (imagePaths) {
        // [ /tmp/slide-0.png, /tmp/slide-1.png ]
        console.log(imagePaths);
        imagePaths.forEach(element => {
            fs.existsSync(element)
        });
    });
}

/**
 * convert the cames file to pics then review the pisc into 
 * previe modal
 */