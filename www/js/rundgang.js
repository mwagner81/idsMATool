jQuery(document).ready(function () {

	var rKey, rWatchId, rInterval, x, oRundgang;
	
	if (localStorage.getItem("fe_user")) {
		// Set key for Rundgang
		rKey = 'r_' + localStorage.getItem("fe_user");
	}
	
	x = document.getElementById("geolocation");
	var rCount = 0;
	var nr = 0;
	var rStarted = false;
	
	// Rundgang Object
  oRundgang = {};
	
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
		
		if(oRundgang.Wachdienst[rCount].ende == 0){
			// der letzte Rundgang ist noch offen
				
				// Get Last Checkpoint
				nr = oRundgang.Wachdienst[rCount].checkString.length - 1;
				
				d = new Date(oRundgang.Wachdienst[rCount].checkString[nr].datetime);
				m = d.getMonth() + 1;
				span_date = '<span>Zeit: ' + d.getHours() + ':' + d.getMinutes() + ' Datum: ' + d.getDate() + '.' + m + '.' + d.getFullYear() + '</span>';
				span_text = '<span><b>Rundgang wird fortgesetzt</b></span>';        
				jQuery('.statusBox p:gt(0)').fadeOut(500, function () {
					jQuery('<p class="control">' + span_text + '<br />' + span_date + '<img src="img/mBoxEye.png" /></p>').hide().prependTo(".statusBox").delay(350).slideToggle("slow");
					jQuery(this).remove();
				});
				
				rInterval = setInterval(function() {
							getCurGeoData()
					}, 5000);
				
				nr++;
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

		jQuery('#rundgangButtons').attr('src', 'img/buttonsAct.png').delay(1500).queue(function (next) {
				jQuery(this).attr('src', 'img/buttonsRun.png');
				next();
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
			
			span_text = '<span><b>Rundgang wurde gestartet</b></span>';        
			jQuery('.statusBox p:gt(0)').fadeOut(500, function () {
				jQuery('<p class="control">' + span_text + '<br />' + span_date + '<img src="img/mBoxEye.png" /></p>').hide().prependTo(".statusBox").delay(350).slideToggle("slow");
				jQuery(this).remove();
			});
			
			rStarted = true;
			
		} else {
			// Deaktiviere die permanente Geo-Datenerfassung
			clearInterval(rInterval);
			
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
			enableHighAccuracy: true, 
			timeout: 10000
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
		geoData.status = "ok";
		geoData.lat = position.coords.latitude;
		geoData.lng = position.coords.longitude;
		geoData.acc = position.coords.accuracy;
		
		saveCheckPoint(geoData);
	}	
	
	function onGeoDataError(error) {
		
		x.innerHTML = '<p class="event received">Geo-Daten konnten nicht erfasst werden!</p>';
		
		//geoStrg = '{ "datetime" : ' + new Date().getTime() + ', "status" : "' + error.code + '" }, ';
		var geoData = {};
		geoData.datetime = new Date().getTime();
		geoData.status = error.code;
		
		saveCheckPoint(geoData);
	}
	
	/**************************************************************
		AKTUELLE GEO-DATEN SPEICHERN
	***************************************************************/
	
	function saveCheckPoint(geoDataElement) {
			
			var Rundgang;
			
			if (nr == 0) {
	
					/* Create new Rundgang */
					Rundgang = {};
					Rundgang.id = rCount;
					Rundgang.checkString = [];
					Rundgang.checkString.push(geoDataElement);
					Rundgang.start = new Date().getTime();
					Rundgang.ende = 0;
					
					oRundgang.Wachdienst.push(Rundgang);
					
					localStorage.setItem(rKey, JSON.stringify(oRundgang));
					
					nr++;

					newRundgang(rCount);
					
			} else {
					
					/* Load Rundgang from localStorage */
					oRundgang = JSON.parse(localStorage.getItem(rKey));
					
					/* Update Rundgang */
					oRundgang.Wachdienst[rCount].checkString.push(geoDataElement);
					
					localStorage.setItem(rKey, JSON.stringify(oRundgang));
					
					nr++;
					
					updateRundgang(rCount, false);
			}		
			
	}

	/**************************************************************
		RUNDGANG STOPPEN
	***************************************************************/
	
	function stopGeoData() {

		/* Load Rundgang from localStorage */
		oRundgang = JSON.parse(localStorage.getItem(rKey));
		
		/* Update Rundgang Ende*/
		oRundgang.Wachdienst[rCount].ende = new Date().getTime();
		
		localStorage.setItem(rKey, JSON.stringify(oRundgang));
		
		nr = 0;
		rCount++;	
		
		updateRundgang(rCount-1, true);
		
	}
	
	/**************************************************************
		NEUEN RUNDGANG SPEICHERN
	***************************************************************/

	function newRundgang(rCount) {
			
			var hmac, d, m, data, startDatetime, url, oRundgang, rKey, checkString, checkpointMan, i;
	
			checkpointMan = '';
			rKey = 'r_' + localStorage.getItem("fe_user");
			
			oRundgang = {};
			oRundgang = JSON.parse(localStorage.getItem(rKey));
			checkString = oRundgang.Wachdienst[rCount].checkString;
	
			for (i = 0; i < checkString.length; i++) {
					checkpointMan = checkpointMan +  JSON.stringify(checkString[i]);
			}
			
			hmac = 'a:3:{s:11:"newRundgang";a:5:{s:6:"feUser";i:1;s:13:"startDatetime";i:1;s:11:"endDatetime";i:1;s:13:"checkpointMan";i:1;s:14:"checkpointAuto";i:1;}s:6:"action";i:1;s:10:"controller";i:1;}f59be899124b071365d07b0bd18b87b4a16c3a91';
	
			// 17:21:00 5-8-2013
			d = new Date();
			m = d.getMonth() + 1;			
			startDatetime = d.getHours() + ':' + d.getMinutes() + ':' +  d.getSeconds() + ' ' + d.getDate() + '-' + m + '-' + d.getFullYear();
	
			url = "http://ma.ids-services.at/index.php";
	
			data = {
					'id': 227,
					'no_cache': 1,
					'type': 99,
					'tx_mungoswachdienst_request[action]': "create",
					'tx_mungoswachdienst_request[controller]': "Rundgang",
					'tx_mungoswachdienst_request[__referrer][extensionName]': "MungosWachdienst",
					'tx_mungoswachdienst_request[__referrer][controllerName]': "Rundgang",
					'tx_mungoswachdienst_request[__referrer][actionName]': "new",
					'tx_mungoswachdienst_request[newRundgang][feUser]': localStorage.getItem("fe_user"),
					'tx_mungoswachdienst_request[newRundgang][startDatetime]': startDatetime,
					'tx_mungoswachdienst_request[newRundgang][checkpointMan]': checkpointMan,
					'tx_mungoswachdienst_request[newRundgang][checkpointAuto]': '',
					'tx_mungoswachdienst_request[__hmac]': hmac
			};
			
			$.jsonp({
					url: url,
					data: data,
					callbackParameter: 'jsonp_callback',
					success: function (json, textStatus, xOptions) {

							if (json.uid) {
									/* Update Rundgang */
									oRundgang.Wachdienst[rCount].uid = json.uid;
							
									localStorage.setItem(rKey, JSON.stringify(oRundgang));
							}
							
					},
					error: function (xOptions, textStatus) {						
						consoleLog('debug', "ERROR: Neuen Rundgang speichern");
						consoleLog('debug', "Request failed: " + xOptions + " " + textStatus);
						consoleLog('debug', xOptions);
					}
			});

	}
	
	/**************************************************************
		EXISTIERENDEN RUNDGANG SPEICHERN
	***************************************************************/
	
	function updateRundgang(rCount, isLast) {
	
			var hmac, d, m, data, startDatetime, url, oRundgang, rKey, checkpointMan, separator, endDatetime, checkString;
	
			checkpointMan = '';
			rKey = 'r_' + localStorage.getItem("fe_user");
			
			oRundgang = {};
			oRundgang = JSON.parse(localStorage.getItem(rKey));
			checkString = oRundgang.Wachdienst[rCount].checkString;
			
			separator = '';
			
			for (var i=0; i < checkString.length; i++) {
					
					if(i>0){ separator = ', '; }
					checkpointMan = checkpointMan + separator +  JSON.stringify(checkString[i]);
			}
			
			hmac = 'a:3:{s:8:"rundgang";a:6:{s:6:"feUser";i:1;s:13:"startDatetime";i:1;s:11:"endDatetime";i:1;s:13:"checkpointMan";i:1;s:14:"checkpointAuto";i:1;s:10:"__identity";i:1;}s:6:"action";i:1;s:10:"controller";i:1;}6313957ab723c65dd945a4cfb7063e14c57534fa';
	
			d = new Date();
			m = d.getMonth() + 1;	
			endDatetime = 0;
			
			if (isLast) {
					endDatetime = d.getHours() + ':' + d.getMinutes() + ':' +  d.getSeconds() + ' ' + d.getDate() + '-' + m + '-' + d.getFullYear();
			}
			
			url = "http://ma.ids-services.at/index.php";
	
			data = {
					'id': 227,
					'no_cache': 1,
					'type': 99,
					'tx_mungoswachdienst_request[action]': "update",
					'tx_mungoswachdienst_request[controller]': "Rundgang",
					'tx_mungoswachdienst_request[rundgang][__identity]': oRundgang.Wachdienst[rCount].uid,
					'tx_mungoswachdienst_request[__referrer][extensionName]': "MungosWachdienst",
					'tx_mungoswachdienst_request[__referrer][controllerName]': "Rundgang",
					'tx_mungoswachdienst_request[__referrer][actionName]': "edit",
					'tx_mungoswachdienst_request[rundgang][feUser]': localStorage.getItem("fe_user"),
					'tx_mungoswachdienst_request[rundgang][checkpointMan]': checkpointMan,
					'tx_mungoswachdienst_request[rundgang][checkpointAuto]': '',
					'tx_mungoswachdienst_request[rundgang][endDatetime]': endDatetime,
					'tx_mungoswachdienst_request[__hmac]': hmac
			};
	
			$.jsonp({
					url: url,
					data: data,
					callbackParameter: 'jsonp_callback',
					success: function(json, textStatus, xOptions) {
							
						if(json.uid){
							/* Update Rundgang */
							oRundgang.Wachdienst[rCount].uid = json.uid;
					
							localStorage.setItem(rKey,JSON.stringify(oRundgang));
						}
							
					},
					error: function(xOptions, textStatus){						
						consoleLog('debug', "ERROR: Rundgang aktualisieren");
						consoleLog('debug', "Request failed: " + xOptions + " " + textStatus);
						consoleLog('debug', xOptions);
					}
			});    
	}

});