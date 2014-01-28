var pictureSource; // picture source
var destinationType; // sets the format of returned value
var pKey, currElement;
var picContainer = {};

var pictureFiles = new Array();

// Wait for device API libraries to load
document.addEventListener("deviceready",onDeviceReady,false);

// device APIs are available
function onDeviceReady() {
    pictureSource=navigator.camera.PictureSourceType;
    destinationType=navigator.camera.DestinationType;
}

/**************************************************************
	BILDAUFNAHME STARTEN
***************************************************************/		
function captureImage(matchcode) {
    // Launch device camera application,
    // allowing user to capture up to 2 images
		currElement = matchcode;
    navigator.device.capture.captureImage(captureSuccess, captureError,{limit: 1});
}

/**************************************************************
	BILDAUFNAHME ERFOLGREICH
***************************************************************/		
function captureSuccess(mediaFiles) {
		
		jQuery("#permaCheck").append('<span><b>Foto:</b></span> | Capture successful<br /><hr>');
		
		var picData = {};		
		var lastDateID = 0;
		var lastDate = 0;
		
		for (i = 0, len = mediaFiles.length; i < len; i += 1) {
				if (mediaFiles[i].lastModifiedDate > lastDate) {
					lastDateID = i;
					lastDate = mediaFiles[i].lastModifiedDate;
				}
		}
		
		picData.fullPath = mediaFiles[i].fullPath;
		picData.name = mediaFiles[i].name;
		picData.type = mediaFiles[i].type;
		picData.lastModified = mediaFiles[i].lastModifiedDate;
		picData.size = mediaFiles[i].size;
		
		savePic(picData);

}

/**************************************************************
	FEHLER BEI DER BILDAUFNAHME
***************************************************************/		
function captureError(error) {
		jQuery("#permaCheck").append('<span><b>Foto:</b></span> | Capture error!<br /><hr>');
    var msg = 'Fehler bei der Aufnahme: ' + error.code;
    navigator.notification.alert(msg, null, 'Uh oh!');
}

/**************************************************************
	AKTUELLES BILD IM LOCAL-STORAGE SPEICHERN
***************************************************************/
function savePic(picData) {
		
		pKey = 'p_' + localStorage.getItem("fe_user");
		
		if (!localStorage.getItem(pKey)) {
			// kein Report vorhanden - Basis eintrag machen
			
			picElement = getLastPic(mediaFiles);		
			
			picContainer.reports = [];		
				
			Report = {};
			Report.matchcode = currElement;
			Report.uid = 0;
			Report.pics = [];
			Report.pics.push(picData);
			Report.complete = 0;
			
			picContainer.reports.push(Report);
				
		} else {
			// wenn bereits ein Eintrag vorhanden ist
			
			picContainer = JSON.parse(localStorage.getItem(pKey));
			curI = -1;	
			for (i = 0; i < picContainer.reports.length; i++) {
				if (picContainer.reports[i].matchcode == currElement) {
					curI = i;
				}
			}
			
			if (curI > -1) {
				// letzten Report gefunden
				picContainer.reports[i].pics.push(picData);
			} else {
				// keine entsprechende Report gefunden -> diesen Anlegen
				Report = {};
				Report.matchcode = currElement;
				Report.uid = 0;
				Report.pics = [];
				Report.pics.push(picData);
				Report.complete = 0;
				picContainer.reports.push(Report);
			}
			
		}
		
		// Daten wieder in den LocalStorage speichern
		localStorage.setItem(pKey, JSON.stringify(picContainer));
		
		// "{"reports":[{"type":"Vandalismus","police":"sdvdv","comment":"yxcvyxcv","fotos":null,"timestamp":"2014-01-27T13:04:50.807Z","lat":"","lng":"","acc":"","geoTimestamp":"","complete":0}]}"
		// "{"Wachdienst":[{"id":0,"uid":345,"checkString":[{"datetime":1390840881044,"checkpoint":1,"status":3},{"datetime":1390840908480,"checkpoint":1,"status":3}],"start":1390840816905,"fireProtection":0,"ende":1390840917694,"complete":0}]}"
    
		jQuery("#permaCheck").append('<span><b>Foto:</b></span> | ' + JSON.stringify(picContainer)      + '<br /><hr>');
		
    jQuery("p#"+currElement+"_pics").prepend("<img src=\""+ picData.fullPath +"\" />");
        
}

/**************************************************************
	BILDER AUF DEN SERVER LADEN
***************************************************************/	 
function uploadFiles(matchcode) {
	
    /*var j, leng;
    pLs = localStorage.getItem("pics_"+captureElement);
		
    mesLen = pictureFiles.length;
 
    for (j = 0, leng = pictureFiles.length; j < leng; j += 1) {
        uploadFile(pictureFiles[j]);
        jQuery("p#pics img:first-child").remove();
    }
    pictureFiles = [];
    
    if(mesLen>0) {
        setTimeout("alert(\"Es werden "+mesLen+" Bilder hochgeladen\")", 500);
    }*/
}
// Upload files to server
function uploadFile(mediaFile) {
    
    var ft = new FileTransfer(),
    path = mediaFile.fullPath,
    name = mediaFile.name;

    ft.upload(path,
        			imgUpload_url,
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


/**************************************************************
	SONSTIGES
***************************************************************/	 
function deleteImage(){
    jQuery("p#pics img:first-child").remove();
    pictureFiles.pop();
}



/**************************************************************
	????????
***************************************************************/		
/*function getPhoto(source) {
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
    
    pLs = localStorage.getItem("pics_"+currCaptureElement);
    
    if (pLs == null) {
        pLs = "";
    }
    
    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
        pPath = mediaFiles[i].fullPath;
        pName = mediaFiles[i].name;

        //pictureFiles.push(mediaFiles[i]);
        jQuery("p#pics").prepend("<img src=\""+ pPath +"\" />");
        
        localStorage.setItem("pics_"+currCaptureElement, pLs+pName+",");
    }
}
function onFail(message) {
  alert('Fehlgeschlagen: ' + message);
}*/
