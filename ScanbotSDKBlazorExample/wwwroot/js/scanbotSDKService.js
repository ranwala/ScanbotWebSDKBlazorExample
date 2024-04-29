let scanbotSDK
let documentScanner = undefined;
let barcodeScanner = undefined;
let documentResult = [];

/** Initialise Scanbot SDK */
export async function initialiseSDK() {
    try {
        scanbotSDK = await ScanbotSDK.initialize({
            licenseKey: "",
            // If you have downloaded the SDK, you can use the following folder to specify engine path:
            engine: '/wasm/'
        });

        console.log(scanbotSDK);
    } catch (e) {
        console.log(e.name + ': ' + e.message);
    }
}

/** Check the validity of the license */
export async function licenseValidate() {
    try {
        const info = await scanbotSDK.getLicenseInfo();
        return JSON.stringify(info);
    } catch (e) {
        console.log(e.name + ': ' + e.message);
    }
}

/** Start the Document Scanner */
export async function startDocumentScanner() {
    const config = {
        containerId: "documentscannerid",
        acceptedAngleScore: 60,
        acceptedSizeScore: 60,
        autoCaptureSensitivity: 0.66,
        autoCaptureEnabled: true,
        ignoreBadAspectRatio: false,
        style: {
            // Note that alternatively, styling the document scanner is also possible using CSS classes.
            // For details see https://docs.scanbot.io/document-scanner-sdk/web/features/document-scanner/document-scanner-ui/
            outline: {
                polygon: {
                    strokeWidth: 40,
                    fillCapturing: "rgba(0, 255, 0, 0.2)",
                    strokeCapturing: "green",
                    fillSearching: "rgba(255, 0, 0, 0.2)",
                    strokeSearching: "red",
                }
            }
        },
        onDocumentDetected: async (result) => {
            if (result == null) return;

            generateImageURLS(result);
        },
        onError: (error) => {
            console.log(JSON.stringify(error));
        },
        text: {
            hint: {
                OK: "Capturing your document...",
                OK_SmallSize: "The document is too small. Try moving closer.",
                OK_BadAngles:
                    "This is a bad camera angle. Hold the device straight over the document.",
                OK_BadAspectRatio:
                    "Rotate the device sideways, so that the document fits better into the screen.",
                OK_OffCenter: "Try holding the device at the center of the document.",
                Error_NothingDetected:
                    "Please hold the device over a document to start scanning.",
                Error_Brightness: "It is too dark. Try turning on a light.",
                Error_Noise: "Please move the document to a clear surface.",
            },
        },
        preferredCamera: 'camera2 0, facing back'
    };

    try {
        documentScanner = await scanbotSDK.createDocumentScanner(config);
    } catch (e) {
        console.log(e.name + ': ' + e.message);
    }
}

/** Generate image url from array buffer */
async function generateImageURLS(result) {
    if (result == null) return;

    try {
        var imageBase64 = await scanbotSDK.toDataUrl(
            result.filtered ?? result.cropped ?? result.original
        );
        documentResult.push({ url: imageBase64 });
    } catch (e) {
        console.log(e.name + ': ' + e.message);
    }

}

/** Return captured ducuments image list */
export async function getDocumentResult() {
    return JSON.stringify(documentResult);
}

/** Manipulate detected barcodes */
const onBarcodesDetected = async (e) => {
    if (e == null) return;

    try {
        let text = "";
        e.barcodes.forEach((barcode) => {
            if (barcode.parsedText) {
                text += JSON.stringify(barcode.parsedText);
            } else {
                text += " " + barcode.text + " (" + barcode.format + "),";
            }
        });

        alert(text);
        barcodeScanner.dispose();
    } catch (e) {
        console.log(e.name + ': ' + e.message);
    }
}

/** Start the Barcode Scanner */
export async function startBarcodeScanner() {
    const config = {
        containerId: "documentscannerid",
        onBarcodesDetected: onBarcodesDetected.bind(this),
        onError: (error) => {
            console.log(JSON.stringify(error));
        },
        style: { window: { widthProportion: 0.8, } },
    }

    try {
        barcodeScanner = await scanbotSDK.createBarcodeScanner(config);
    } catch (e) {
        console.log(e.name + ': ' + e.message);
    }
}

/** Dispose Document and Barcode Scanners */
export async function disposeScanner() {
    if (documentScanner != undefined) {
        documentScanner.dispose();
    }
    else if (barcodeScanner != undefined) {
        barcodeScanner.dispose();
    }
}