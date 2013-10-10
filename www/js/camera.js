var pictureSource; // picture source
var destinationType; // sets the format of returned value
var pictureFiles = new Array();

// Wait for device API libraries to load
//
document.addEventListener("deviceready",onDeviceReady,false);

// device APIs are available
//
function onDeviceReady() {
    pictureSource=navigator.camera.PictureSourceType;
    destinationType=navigator.camera.DestinationType;
}

// get Photo from Album
//
function getPhoto(source) {
    // Retrieve image file location from specified source
    navigator.camera.getPicture(onPhotoURISuccess, onFail, {
        quality: 50,
        destinationType: destinationType.FILE_URI,
        sourceType: source
    });
}

function onPhotoURISuccess(imageURI) {
    jQuery("p#pics").prepend("<img src=\""+ imageURI +"\" />");
    pictureFiles.push(imageURI);
}
    
function captureSuccess(mediaFiles) {
    var i, len, pPath, pName, pLs;
    
    pLs = localStorage.getItem("pics");
    
    if (pLs == null) {
        pLs = "";
    }
    
    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
        pPath = mediaFiles[i].fullPath;
        pName = mediaFiles[i].name;

        pictureFiles.push(mediaFiles[i]);
        jQuery("p#pics").prepend("<img src=\""+ pPath +"\" />");
        
        localStorage.setItem("pics", pLs+pName+",");
    }
}
    
function uploadFiles() {
    var j, leng;
    
    mesLen = pictureFiles.length;
 
    for (j = 0, leng = pictureFiles.length; j < leng; j += 1) {
        uploadFile(pictureFiles[j]);
        jQuery("p#pics img:first-child").remove();
    }
    pictureFiles = [];
    
    if(mesLen>0) {
        setTimeout("alert(\"Es werden "+mesLen+" Bilder hochgeladen\")", 500);
    }
}

// Called if something bad happens.
//
function captureError(error) {
    var msg = 'An error occurred during capture: ' + error.code;
    navigator.notification.alert(msg, null, 'Uh oh!');
}

// A button will call this function
//
function captureImage() {
    // Launch device camera application,
    // allowing user to capture up to 2 images
    navigator.device.capture.captureImage(captureSuccess, captureError,{limit: 1});
}

// Upload files to server
function uploadFile(mediaFile) {
    
    var ft = new FileTransfer(),
    path = mediaFile.fullPath,
    name = mediaFile.name;

    ft.upload(path,
        "http://ids-services.at/ma-test/upload.php",
        function(result) {
            console.log('Upload success: ' + result.responseCode);
            console.log(result.bytesSent + ' bytes sent');
        },
        function(error) {
            console.log('Error uploading file ' + path + ': ' + error.code);
        },
        {
            fileName: name
        });
}

function deleteImage(){
    jQuery("p#pics img:first-child").remove();
    pictureFiles.pop();
}

function onFail(message) {
  alert('Fehlgeschlagen: ' + message);
}