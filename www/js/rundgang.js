var currRG = -1;
var checkpointNr = 0;
var rStarted = false;
var rTimeout = 10000;
var rMaximumAge = 5000;
var rEnableHighAccuracy = true;
var searchGeoData = false;
var setGeoDataErrCount = 0;
var setIntervalTimeout = 5000;
var fireProtection = 0;
var rKey, rWatchId, saveInterval, rInterval, saveTimeout, x, oRundgang;

jQuery(document).ready(function () {
	
	if (localStorage.getItem("fe_user")) {
		// Set key for Rundgang
		rKey = 'r_' + localStorage.getItem("fe_user");
	}
	
	x = document.getElementById("geolocation");
	
	// Rundgang Object
  oRundgang = {};	
	
	saveTimeout = setTimeout(function() {
				updateRundgang()
		}, 5000);
	
	/**************************************************************
		SET START-VARIABLES
	***************************************************************/
	if (!localStorage.getItem(rKey)) {
		// Wachdienst Array
		oRundgang.Wachdienst = [];
		
	} else {
		
		oRundgang = JSON.parse(localStorage.getItem(rKey));
		
		// Get last Rundgang (Index)
		currRG = -1;
		rDT = 0;
		for (i=0;i<oRundgang.Wachdienst.length;i++) {
			if (oRundgang.Wachdienst[i].start > rDT) currRG = i;
		}
			
		//currRG = oRundgang.Wachdienst.length -1;
		
		if (oRundgang.Wachdienst[currRG] && (oRundgang.Wachdienst[currRG].ende == 0)){
			// der letzte Rundgang ist noch offen
			
				jQuery('#rundgangButtons').attr('src', 'img/buttonsAct.png').delay(50).queue(function (next) {
					jQuery(this).attr('src', 'img/buttonsRun.png');
					next();
				});
				
				if (oRundgang.Wachdienst[currRG].fireProtection) {
					jQuery('#fireprotection').val(1).slider("refresh");
				} else {
					jQuery('#fireprotection').val(0).slider("refresh");					
				}
				jQuery('#fireprotection').slider({ disabled: true });
				
				// Get Last Checkpoint
				//if (oRundgang.Wachdienst[currRG].checkString.length > 0) {
					//checkpointNr = oRundgang.Wachdienst[currRG].checkString.length - 1;
				checkpointNr = oRundgang.Wachdienst[currRG].checkpointNr+1;
				span_text = '<span><b>Rundgang wird fortgesetzt</b></span>';        
				jQuery('.statusBox p:gt(0)').fadeOut(500, function () {
					jQuery('<p class="control">' + span_text + '<br />' + getDateForOutput(oRundgang.Wachdienst[currRG].start) + '<img src="img/mBoxEye.png" /></p>').hide().prependTo(".statusBox").delay(350).slideToggle("slow");
					jQuery(this).remove();
				});
				/*} else {
					//checkpointNr = 0;
					span_text = '<span><b>Rundgang wird fortgesetzt</b></span>';        
					jQuery('.statusBox p:gt(0)').fadeOut(500, function () {
						jQuery('<p class="control">' + span_text + '<br />' + getDateForOutput('') + '<img src="img/mBoxEye.png" /></p>').hide().prependTo(".statusBox").delay(350).slideToggle("slow");
						jQuery(this).remove();
					});
				}*/
				
				rInterval = setInterval(function() {
							getCurGeoData()
					}, setIntervalTimeout);
				
				//checkpointNr++;
				rStarted = true;
		} else {
				//currRG++;
		}
	}
	
	/**************************************************************
		PRESS BUTTON -> START/STOP GEO_DATENERFASSUNG
	***************************************************************/
	
	jQuery("a#start").on('click', function () {
				
		jQuery(".expand").animate({
				left: '100%'
		}, 2000, 'linear', function () {
				jQuery(".expand").removeAttr('style');
		});
		
		if (rStarted == false) {	
			// Aktiviere die permanente Geo-Datenerfassung
			
			checkpointNr = 0;
			getCurGeoData();
			rInterval = setInterval(function() {
						getCurGeoData()
				}, setIntervalTimeout);
			
			jQuery('#rundgangButtons').attr('src', 'img/buttonsAct.png').delay(50).queue(function (next) {
				jQuery(this).attr('src', 'img/buttonsRun.png');
				next();
			});
			
			jQuery('#fireprotection').slider({ disabled: true });
			
			span_text = '<span><b>Rundgang wurde gestartet</b></span>';        
			jQuery('.statusBox p:gt(0)').fadeOut(500, function () {
				jQuery('<p class="control">' + span_text + '<br />' + getDateForOutput('') + '<img src="img/mBoxEye.png" /></p>').hide().prependTo(".statusBox").delay(350).slideToggle("slow");
				jQuery(this).remove();
			});
			
			rStarted = true;
			jQuery("#permaCheck").empty();
			
		} else {
			// Deaktiviere die permanente Geo-Datenerfassung
			clearInterval(rInterval);
			
			jQuery('#rundgangButtons').attr('src', 'img/buttonsRunAct.png').delay(1500).queue(function (next) {
				jQuery(this).attr('src', 'img/buttons.png');
				next();
			});
			
			jQuery('#fireprotection').slider({ disabled: false });
			jQuery('#fireprotection').val(0).slider("refresh");
			
			stopGeoData();
			
			span_text = '<span><b>Rundgang wurde beendet</b></span>';
			jQuery('.statusBox p:gt(0)').fadeOut(500, function () {
				jQuery('<p class="control">' + span_text + '<br />' + getDateForOutput('') + '<img src="img/mBoxEye.png" /></p>').hide().prependTo(".statusBox").delay(350).slideToggle("slow");
				jQuery(this).remove();
			});
			
			rStarted = false;
		}
		
	});
	
});

function getCurGeoData() {	
	// holt die aktuellen Geokoordinaten	
	if (searchGeoData == false	) {
		searchGeoData = true;
		var options = {
			maximumAge: rMaximumAge, timeout: rTimeout, enableHighAccuracy: rEnableHighAccuracy 
		};
		rWatchId = navigator.geolocation.getCurrentPosition(onGeoDataSuccess, onGeoDataError, options);	
	}
}	

/**************************************************************
	OBJEKT MIT GEO-DATEN ZUSAMMENSTELLEN
***************************************************************/

function onGeoDataSuccess(position) {
	
	x.innerHTML = '<p class="event received">Geo-Daten erfasst!</p>';
	
	var geoData = {};
	geoData.datetime = new Date().getTime();
	geoData.checkpoint = checkpointNr;
	geoData.status = "ok";
	geoData.type = "geodata";
	geoData.lat = position.coords.latitude;
	geoData.lng = position.coords.longitude;
	geoData.acc = position.coords.accuracy;		
	geoData.timestamp = position.timestamp;
	
	if (navigator.connection) { navCon = navigator.connection.type; }
	else { navCon = "unavailable"; }

	rTimeout = 10000;
	setGeoDataErrCount = 0;
	searchGeoData = false;
	
	saveCheckPoint(geoData);
}	

function onGeoDataError(error) {
	
	x.innerHTML = '<p class="event received">Geo-Daten konnten nicht erfasst werden!</p>';
	
	var geoData = {};
	geoData.datetime = new Date().getTime();
	geoData.checkpoint = checkpointNr;
	geoData.status = error.code;
	geoData.type = "geodata";
	
	if (navigator.connection) { navCon = navigator.connection.type; }
	else { navCon = "unavailable"; }       
			
	setGeoDataErrCount++;
	if (setGeoDataErrCount > 5) { rTimeout = 60000; }
	searchGeoData = false;
	
	saveCheckPoint(geoData);
}

/**************************************************************
	AKTUELLE GEO-DATEN SPEICHERN
***************************************************************/

function saveCheckPoint(geoDataElement) {
		
		var Rundgang;
		
		if (checkpointNr == 0) {
			/* Create new Rundgang */
			Rundgang = {};
			Rundgang.id = oRundgang.Wachdienst.length;
			Rundgang.uid = 0;
			Rundgang.checkpointNr = 0;
			Rundgang.checkString = [];
			Rundgang.checkString.push(geoDataElement);
			Rundgang.start = new Date().getTime();
			Rundgang.fireProtection = parseInt(jQuery('#fireprotection').val());
			Rundgang.ende = 0;
			Rundgang.complete = 0;			
			
			oRundgang.Wachdienst.push(Rundgang);			
			
			localStorage.setItem(rKey, JSON.stringify(oRundgang));
			
			currRG = oRundgang.Wachdienst.length-1;
			checkpointNr++;
			

			//newRundgang(currRG);
				
		} else {
			// bestehenden Rundgang aktualisieren
				
			oRundgang = JSON.parse(localStorage.getItem(rKey));

			oRundgang.Wachdienst[currRG].checkString.push(geoDataElement);
			oRundgang.Wachdienst[currRG].checkpointNr = checkpointNr;
			
			localStorage.setItem(rKey, JSON.stringify(oRundgang));
			
			checkpointNr++;
			
			//updateRundgang(currRG, false);
		}		
		
}

/**************************************************************
	RUNDGANG STOPPEN
***************************************************************/

function stopGeoData() {
	
	/* Load Rundgang from localStorage */
	oRundgang = JSON.parse(localStorage.getItem(rKey));
	
	if (oRundgang && oRundgang.Wachdienst[currRG]) {
		/* Update Rundgang Ende*/
		oRundgang.Wachdienst[currRG].ende = new Date().getTime();
		
		localStorage.setItem(rKey, JSON.stringify(oRundgang));
				
	}
}



/**************************************************************
	RUNDGANG AM SERVER SPEICHERN ODER AKTUALISIEREN
***************************************************************/

function updateRundgang() {
	
	var rundgangContainer, checkpointContainer, checkpoint;
	
	//consoleLog('debug', "updateRundgang gestartet");
	/*jQuery("#permaCheck").append('<span><b>Datentransfer gestartet</b></span> <br><hr>');*/
	
	rundgangContainer = {};
	rundgangContainer = JSON.parse(localStorage.getItem(rKey));
	
	if (rundgangContainer && rundgangContainer.Wachdienst[0]) {
		// es existiert ein Rundgang
		
		//consoleLog('debug', "Rundgang gefunden");
		checkpointContainer = rundgangContainer.Wachdienst[0].checkString;
		
		if (checkpointContainer[0]) {
			// Checkpoints vorhanden -> speichern
			
			//consoleLog('debug', "Checkpoints vorhanden");
			checkpoint = JSON.stringify(checkpointContainer[0]);
			
			d = new Date(rundgangContainer.Wachdienst[0].start);
			m = d.getMonth() + 1;
			startDatetime = d.getHours() + ':' + d.getMinutes() + ':' +  d.getSeconds() + ' ' + d.getDate() + '-' + m + '-' + d.getFullYear();
			
			if (rundgangContainer.Wachdienst[0].ende > 0) {
				d = new Date(rundgangContainer.Wachdienst[0].ende);
				m = d.getMonth() + 1;
				endDatetime = d.getHours() + ':' + d.getMinutes() + ':' +  d.getSeconds() + ' ' + d.getDate() + '-' + m + '-' + d.getFullYear();
			} else {
				endDatetime = 0;
			}	
			
			/*if (rundgangContainer.Wachdienst[0].fireProtection == 'On') fireProtection = 1; 
			else fireProtection = 0; */
	
			if (rundgangContainer.Wachdienst[0].uid && (rundgangContainer.Wachdienst[0].uid > 0)) {
				// Rundgang bereits in Datenbank gespeichert (nur Checkpoints speichern)
				action = "update";
				curr_uid = rundgangContainer.Wachdienst[0].uid;
			} else {
				// Rundgang wurde bisher noch nicht gespeichert	(neu anlegen)	
				action = "create";
				curr_uid = 0;
			}
			
			data = {
					'id': rundgang_page_uid,
					'no_cache': 1,
					'type': rundgang_page_type,
					'tx_idsmungosrundgang[action]': action,
					'tx_idsmungosrundgang[uid]': curr_uid,
					'tx_idsmungosrundgang[feUser]': localStorage.getItem("fe_user"),
					'tx_idsmungosrundgang[startDatetime]': startDatetime,
					'tx_idsmungosrundgang[endDatetime]': endDatetime,
					'tx_idsmungosrundgang[checkpoint]': checkpoint,
					'tx_idsmungosrundgang[fireProtection]': rundgangContainer.Wachdienst[0].fireProtection,
					'tx_idsmungosrundgang[complete]': rundgangContainer.Wachdienst[0].complete,
					'tx_idsmungosrundgang[version]': version
			};
					
			$.jsonp({
				url: app_url,
				data: data,
				callbackParameter: 'jsonp_callback',
				success: function(json) {
						
					if(json.uid){
						
						/*jQuery("#permaCheck").append('<span><b>Daten gespeichert</b></span> (UID: '+ json.uid + ')<br>' + 
								'Connectiontype: ' + navCon + '<br>' + 
								'Data: ' + JSON.stringify(rundgangContainer.Wachdienst[0]) + '<br><hr>');*/
						//consoleLog('debug', "Aktualisierung erfolgreich - Request-UID: " + json.uid);
						
						if (rundgangContainer.Wachdienst[0].uid == 0) {
							rundgangContainer.Wachdienst[0].uid = json.uid;
						}
						rundgangContainer.Wachdienst[0].checkString.shift();
						//if (rundgangContainer.Wachdienst[0].ende > 0) {
						if (json.rStatus == 'complete') {
							rundgangContainer.Wachdienst[0].complete = 1;
						}
						localStorage.setItem(rKey,JSON.stringify(rundgangContainer));
						
					}
					
					saveTimeout = setTimeout(function() {
								updateRundgang()
						}, 1000);
												
				},
				error: function(){
					/*jQuery("#permaCheck").append('<span><b>Fehler</b></span> Daten konnten nicht gespeichert werden<br>' + 
								'Connectiontype: ' + navCon + '<br>' + 
								'Data: ' + JSON.stringify(rundgangContainer.Wachdienst[0]) + '<br><hr>');		
					consoleLog('debug', "ERROR: Rundgang aktualisieren");*/
					saveTimeout = setTimeout(function() {
								updateRundgang()
						}, 1000);
						
				}
			});				
			
		}	else {
			// keine Checkpoints
			//consoleLog('debug', "else");
			
			if (rundgangContainer.Wachdienst[0].ende > 0) {
				//Rundgang wurde beendet
				
				//consoleLog('debug', "Rundgang wurde beendet");
				if (rundgangContainer.Wachdienst[0].complete > 0) {
					rundgangContainer.Wachdienst.shift();
					localStorage.setItem(rKey,JSON.stringify(rundgangContainer));
					if (rundgangContainer.Wachdienst.length) {
						currRG = rundgangContainer.Wachdienst.length-1;							
						//consoleLog('debug', "weitere Rundgänge vorhanden");
					} else {
						currRG = -1;				
						//consoleLog('debug', "keine weiteren Rundgänge vorhanden");
					}						
				} else {
					var geoData = {};
					geoData.datetime = new Date().getTime();
					geoData.checkpoint = rundgangContainer.Wachdienst[0].checkpointNr + 1;
					geoData.status = 'complete';
					
					rundgangContainer = JSON.parse(localStorage.getItem(rKey));
					rundgangContainer.Wachdienst[0].checkString.push(geoData);					
					rundgangContainer.Wachdienst[0].checkpointNr = rundgangContainer.Wachdienst[0].checkpointNr + 1;
					localStorage.setItem(rKey, JSON.stringify(rundgangContainer));
					
					//consoleLog('debug', "Abschluss-Checkpoint setzen");
				}
				
			}
			
			saveTimeout = setTimeout(function() {
						updateRundgang()
				}, 1000);
			
		} //if (checkpointContainer[0]) {
		
	} else {
		saveTimeout = setTimeout(function() {
					updateRundgang()
			}, 1000);
	}

}

/**************************************************************
	DATUM UND ZEIT FÜR AUSGABE
***************************************************************/

function getDateForOutput(dateTimeElement) {
	if (dateTimeElement == '') {
		d = new Date();
	} else {
		d = new Date(dateTimeElement);
	}
	
	m = d.getMonth() + 1;
	return '<span>Zeit: ' + pushZero(d.getHours()) + ':' + pushZero(d.getMinutes()) + ' Datum: ' + pushZero(d.getDate()) + '.' + pushZero(m) + '.' + d.getFullYear() + '</span>';
	
}

function pushZero(numVal) {
	if (numVal < 10) {
		return '0'+numVal;
	} else {
		return numVal;
	}
}
