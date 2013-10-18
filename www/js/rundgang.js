jQuery(document).ready(function () {

	var rKey, rWatchId, saveInterval, cleanInterval, rInterval, saveTimeout, x, oRundgang;
	
	var url = "http://ma.ids-services.at/index.php"; 
	
	if (localStorage.getItem("fe_user")) {
		// Set key for Rundgang
		rKey = 'r_' + localStorage.getItem("fe_user");
	}
	
	x = document.getElementById("geolocation");
	var rCount = 0;
	var checkpointNr = 0;
	var rStarted = false;
	var rTimeout = 10000;
	var rMaximumAge = 5000;
	var rEnableHighAccuracy = true;
	
	// Rundgang Object
  oRundgang = {};	
	
	/*saveInterval = setInterval(function() {
				updateRundgang()
		}, 1000);*/
	saveTimeout = setTimeout(function() {
				updateRundgang()
		}, 5000);
	/*cleanInterval = setInterval(function() {
				cleanRundgang()
		}, 60000);*/
	
	/**************************************************************
		SET START-VARIABLES
	***************************************************************/
	if (!localStorage.getItem(rKey)) {
		// Wachdienst Array
		oRundgang.Wachdienst = [];
		
	} else {
		
		oRundgang = JSON.parse(localStorage.getItem(rKey));
		
		// Get last Rundgang (Index)
		rCount = oRundgang.Wachdienst.length -1;
		
		if (oRundgang.Wachdienst[rCount] && (oRundgang.Wachdienst[rCount].ende == 0)){
			// der letzte Rundgang ist noch offen
			
				jQuery('#rundgangButtons').attr('src', 'img/buttonsAct.png').delay(1500).queue(function (next) {
					jQuery(this).attr('src', 'img/buttonsRun.png');
					next();
				});
				
				// Get Last Checkpoint
				if (oRundgang.Wachdienst[rCount].checkString.length > 0) {
					checkpointNr = oRundgang.Wachdienst[rCount].checkString.length - 1;
				
				
					d = new Date(oRundgang.Wachdienst[rCount].checkString[checkpointNr].datetime);
					m = d.getMonth() + 1;
					span_date = '<span>Zeit: ' + d.getHours() + ':' + d.getMinutes() + ' Datum: ' + d.getDate() + '.' + m + '.' + d.getFullYear() + '</span>';
					span_text = '<span><b>Rundgang wird fortgesetzt</b></span>';        
					jQuery('.statusBox p:gt(0)').fadeOut(500, function () {
						jQuery('<p class="control">' + span_text + '<br />' + span_date + '<img src="img/mBoxEye.png" /></p>').hide().prependTo(".statusBox").delay(350).slideToggle("slow");
						jQuery(this).remove();
					});
				} else {
					checkpointNr = 0;
					d = new Date();
					m = d.getMonth() + 1;
					span_date = '<span>Zeit: ' + d.getHours() + ':' + d.getMinutes() + ' Datum: ' + d.getDate() + '.' + m + '.' + d.getFullYear() + '</span>';
					span_text = '<span><b>Rundgang wird fortgesetzt</b></span>';        
					jQuery('.statusBox p:gt(0)').fadeOut(500, function () {
						jQuery('<p class="control">' + span_text + '<br />' + span_date + '<img src="img/mBoxEye.png" /></p>').hide().prependTo(".statusBox").delay(350).slideToggle("slow");
						jQuery(this).remove();
					});
				}
				
				rInterval = setInterval(function() {
							getCurGeoData()
					}, 5000);
				
				checkpointNr++;
				rStarted = true;
		} else {
				rCount++;
		}
	}
	
	/**************************************************************
		PRESS BUTTON -> START/STOP GEO_DATENERFASSUNG
	***************************************************************/
	
	jQuery("a#start").on('click', function () {
		
		//x.innerHTML = '<p class="event listening">Geo-Daten werden abgerufen...</p>';
		
		jQuery(".expand").animate({
				left: '100%'
		}, 2000, 'linear', function () {
				jQuery(".expand").removeAttr('style');
		});

		d = new Date();
		m = d.getMonth() + 1;
		span_date = '<span>Zeit: ' + d.getHours() + ':' + d.getMinutes() + ' Datum: ' + d.getDate() + '.' + m + '.' + d.getFullYear() + '</span>';
		
		/*var options = {
			enableHighAccuracy: true, 
			timeout: 10000
		};
		rWatchId = navigator.geolocation.getCurrentPosition(onGeoDataSuccess, onGeoDataError, options);*/
				
		if (rStarted == false) {	
			// Aktiviere die permanente Geo-Datenerfassung
			rInterval = setInterval(function() {
						getCurGeoData()
				}, 5000);
			
			jQuery('#rundgangButtons').attr('src', 'img/buttonsAct.png').delay(1500).queue(function (next) {
				jQuery(this).attr('src', 'img/buttonsRun.png');
				next();
			});
			
			span_text = '<span><b>Rundgang wurde gestartet</b></span>';        
			jQuery('.statusBox p:gt(0)').fadeOut(500, function () {
				jQuery('<p class="control">' + span_text + '<br />' + span_date + '<img src="img/mBoxEye.png" /></p>').hide().prependTo(".statusBox").delay(350).slideToggle("slow");
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
			
			stopGeoData();
			
			span_text = '<span><b>Rundgang wurde beendet</b></span>';
			jQuery('.statusBox p:gt(0)').fadeOut(500, function () {
				jQuery('<p class="control">' + span_text + '<br />' + span_date + '<img src="img/mBoxEye.png" /></p>').hide().prependTo(".statusBox").delay(350).slideToggle("slow");
				jQuery(this).remove();
			});
			
			rStarted = false;
		}
		
	});
	
	function getCurGeoData() {	
		// holt die aktuellen Geokoordinaten			
		var options = {
			maximumAge: rMaximumAge, timeout: rTimeout, enableHighAccuracy: rEnableHighAccuracy 
		};
		rWatchId = navigator.geolocation.getCurrentPosition(onGeoDataSuccess, onGeoDataError, options);	
	}	
	
	/**************************************************************
		OBJEKT MIT GEO-DATEN ZUSAMMENSTELLEN
	***************************************************************/
	
	function onGeoDataSuccess(position) {
		
		x.innerHTML = '<p class="event received">Geo-Daten erfasst!</p>';
		
		//geoStrg = '{ "datetime" : ' + new Date().getTime() + ', "status" : "ok", "lat" : ' + position.coords.latitude + ', "lng" : ' + position.coords.longitude + ', "acc" : ' + position.coords.accuracy + ' }, ';
		var geoData = {};
		geoData.datetime = new Date().getTime();
		geoData.checkpoint = checkpointNr;
		geoData.status = "ok";
		geoData.lat = position.coords.latitude;
		geoData.lng = position.coords.longitude;
		geoData.acc = position.coords.accuracy;		
		geoData.timestamp = position.timestamp;
		
		var d = new Date(position.timestamp);
    var span_date = '<span>Zeit: ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() +'</span>';
		if (navigator.connection) { navCon = navigator.connection.type; }
		else { navCon = "unavailable"; }
		          
		jQuery("#permaCheck").append('<span><b>Success</b></span> | ' + span_date      + '<br /><hr>'
				);
		
		rTimeout = 10000;
		
		saveCheckPoint(geoData);
	}	
	
	function onGeoDataError(error) {
		
		x.innerHTML = '<p class="event received">Geo-Daten konnten nicht erfasst werden!</p>';
		
		//geoStrg = '{ "datetime" : ' + new Date().getTime() + ', "status" : "' + error.code + '" }, ';
		var geoData = {};
		geoData.datetime = new Date().getTime();
		geoData.checkpoint = checkpointNr;
		geoData.status = error.code;
		
		var d = new Date();
    var span_date = '<span>Zeit: ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() +'</span>'; 
		
		if (navigator.connection) { navCon = navigator.connection.type; }
		else { navCon = "unavailable"; }       
        
		jQuery("#permaCheck").append('<span><b>Error</b></span> | ' + span_date      + '<br />"'+
				'Code: '          + error.code          + ' | ' +
				'Message: '       + error.message        + '<br /><hr>'
				);

		rTimeout = 60000;
		
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
				Rundgang.id = rCount;
				Rundgang.uid = 0;
				Rundgang.checkString = [];
				Rundgang.checkString.push(geoDataElement);
				Rundgang.start = new Date().getTime();
				Rundgang.ende = 0;
				Rundgang.complete = 0;
				
				oRundgang.Wachdienst.push(Rundgang);
				
				localStorage.setItem(rKey, JSON.stringify(oRundgang));
				
				checkpointNr++;

				//newRundgang(rCount);
					
			} else {
				// bestehenden Rundgang aktualisieren
					
				oRundgang = JSON.parse(localStorage.getItem(rKey));

				oRundgang.Wachdienst[rCount].checkString.push(geoDataElement);
				
				localStorage.setItem(rKey, JSON.stringify(oRundgang));
				
				checkpointNr++;
				
				//updateRundgang(rCount, false);
			}		
			
	}

	/**************************************************************
		RUNDGANG STOPPEN
	***************************************************************/
	
	function stopGeoData() {
		
		/* Load Rundgang from localStorage */
		oRundgang = JSON.parse(localStorage.getItem(rKey));
		
		if (oRundgang && oRundgang.Wachdienst[rCount]) {
			/* Update Rundgang Ende*/
			oRundgang.Wachdienst[rCount].ende = new Date().getTime();
			
			localStorage.setItem(rKey, JSON.stringify(oRundgang));
			
			consoleLog('debug', "Rundgang beendet");
			
			checkpointNr = 0;
			rCount++;	
			
		}
	}
	
	
	
	/**************************************************************
		RUNDGANG SPEICHERN ODER AKTUALISIEREN
	***************************************************************/
	
	function updateRundgang() {
		
		var rundgangContainer, checkpointContainer, checkpoint;
		
		consoleLog('debug', "updateRundgang gestartet");
		
		rundgangContainer = {};
		rundgangContainer = JSON.parse(localStorage.getItem(rKey));
		
		if (rundgangContainer && rundgangContainer.Wachdienst[0]) {
			// es existiert ein Rundgang
			
			consoleLog('debug', "Rundgang gefunden");
			checkpointContainer = rundgangContainer.Wachdienst[0].checkString;
			
			if (checkpointContainer[0]) {
				// Checkpoints vorhanden -> speichern
				
				consoleLog('debug', "Checkpoints vorhanden");
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
		
				if (rundgangContainer.Wachdienst[0].uid && (rundgangContainer.Wachdienst[0].uid > 0)) {
					// bestehenden Rundgang speichern		
					
					data = {
							'id': 227,
							'no_cache': 1,
							'type': 99,
							'tx_idsmungosrundgang[action]': "update",
							'tx_idsmungosrundgang[uid]': rundgangContainer.Wachdienst[0].uid,
							'tx_idsmungosrundgang[feUser]': localStorage.getItem("fe_user"),
							'tx_idsmungosrundgang[startDatetime]': startDatetime,
							'tx_idsmungosrundgang[endDatetime]': endDatetime,
							'tx_idsmungosrundgang[checkpoint]': checkpoint,
							'tx_idsmungosrundgang[complete]': rundgangContainer.Wachdienst[0].complete							
					};
					consoleLog('debug', "update Rundgang (" + rundgangContainer.Wachdienst[0].uid + "): "+JSON.stringify(data));
						
				} else {
					// Rundgang wurde bisher noch nicht gespeichert		
					
					data = {
							'id': 227,
							'no_cache': 1,
							'type': 99,
							'tx_idsmungosrundgang[action]': "create",
							'tx_idsmungosrundgang[uid]': 0,
							'tx_idsmungosrundgang[feUser]': localStorage.getItem("fe_user"),
							'tx_idsmungosrundgang[startDatetime]': startDatetime,
							'tx_idsmungosrundgang[endDatetime]': endDatetime,
							'tx_idsmungosrundgang[checkpoint]': checkpoint	,
							'tx_idsmungosrundgang[complete]': rundgangContainer.Wachdienst[0].complete						
					};
					consoleLog('debug', "neuer Rundgang: " + JSON.stringify(data));
					
				}
						
				$.jsonp({
					url: url,
					data: data,
					callbackParameter: 'jsonp_callback',
					success: function(json) {
							
						if(json.uid){
							
							rundgangContainer.Wachdienst[0].uid = json.uid;
							rundgangContainer.Wachdienst[0].checkString.shift();
							if (rundgangContainer.Wachdienst[0].ende > 0) {
								rundgangContainer.Wachdienst[0].complete = 1;
							}
							localStorage.setItem(rKey,JSON.stringify(rundgangContainer));
							
							jQuery("#permaCheck").append('<span><b>Daten gespeichert</b></span> (UID: '+ json.uid + ')<br>' + 
									'Connectiontype: ' + navCon + '<br><hr>');
							consoleLog('debug', "Aktualisierung erfolgreich - Request-UID: " + json.uid);
			
						}
													
					},
					error: function(){
						jQuery("#permaCheck").append('<span><b>Fehler</b></span> Daten konnten nicht gespeichert werden<br>' + 
									'Connectiontype: ' + navCon + '<br><hr>');		
						consoleLog('debug', "ERROR: Rundgang aktualisieren");
						//consoleLog('debug', "Request failed: ");
					}
				});				
				
			}	else {
				// keine Checkpoints
				if (rundgangContainer.Wachdienst[0].ende > 0) {
					//Rundgang wurde beendet
					
					consoleLog('debug', "Rundgang wurde beendet");
					if (rundgangContainer.Wachdienst[0].complete > 0) {
						rundgangContainer.Wachdienst.shift();
						localStorage.setItem(rKey,JSON.stringify(rundgangContainer));
						if (rundgangContainer.Wachdienst.length) {
							rCount = rundgangContainer.Wachdienst.length-1;							
							consoleLog('debug', "weitere Rundgänge vorhanden");
						} else {
							rCount = 0;				
							consoleLog('debug', "keine weiteren Rundgänge vorhanden");
						}						
					} else {
						var geoData = {};
						geoData.datetime = new Date().getTime();
						geoData.checkpoint = 0;
						geoData.status = 'complete';
						
						rundgangContainer = JSON.parse(localStorage.getItem(rKey));
						rundgangContainer.Wachdienst[0].checkString.push(geoData);
						localStorage.setItem(rKey, JSON.stringify(rundgangContainer));
						
						consoleLog('debug', "Abschluss-Checkpoint setzen");
					}
				}
				
			}
			
		}
		
		saveTimeout = setTimeout(function() {
					updateRundgang()
			}, 1000);

	}
	
	/**************************************************************
		RUNDGANG-DATEN SÄUBERN
	***************************************************************/
	
	function cleanRundgang() {
		var rundgangContainer, cleanLocalStorage;
		
		cleanLocalStorage = true;
		
		rundgangContainer = {};
		rundgangContainer = JSON.parse(localStorage.getItem(rKey));
		
		for (i=0;i<rundgangContainer.Wachdienst.length;i++) {
			if (rundgangContainer.Wachdienst[i].checkString.length > 0) {
				cleanLocalStorage = false;
			}
			if ((i=rundgangContainer.Wachdienst.length-1) && (rundgangContainer.Wachdienst[i].ende == 0)) {
				cleanLocalStorage = false;
			}
		}
		
		if (cleanLocalStorage == true) {
			localStorage.removeItem(rKey)
		}
		
	}

});

