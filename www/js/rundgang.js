jQuery(document).ready(function () {

	var rKey, rWatchId, rInterval, x, rCount, nr, oRundgang;
	
	if (localStorage.getItem("fe_user")) {
			// Set key for Rundgang
			rKey = 'r_' + localStorage.getItem("fe_user");
    }
	
	x = document.getElementById("geolocation");
	rKey = 0;
	rCount = 0;
	nr = 0;
	
	// Rundgang Object
  oRundgang = {};
	
	jQuery("a#start").on('click', function () {
		
		x.innerHTML = '<p class="event listening">Geo-Daten werden abgerufen...</p>';
		
		jQuery(".expand").animate({
				left: '100%'
		}, 2000, 'linear', function () {
				jQuery(".expand").removeAttr('style');
		});

		jQuery('#rundgangButtons').attr('src', 'img/buttonsAct.png').delay(1500).queue(function (next) {
				jQuery(this).attr('src', 'img/buttonsRun.png');
				next();
		});
		
		var options = {
				enableHighAccuracy: true, 
				timeout: 10000
		};        

		rWatchId = navigator.geolocation.getCurrentPosition(onGeoDataSuccess, onGeoDataError, options);	
		
		d = new Date();
		m = d.getMonth() + 1;
		span_date = '<span>Zeit: ' + d.getHours() + ':' + d.getMinutes() + ' Datum: ' + d.getDate() + '.' + m + '.' + d.getFullYear() + '</span>';
		
		if (nr == 0) {			
			rKey = 'r_' + localStorage.getItem("fe_user");		
			rInterval = setInterval(function() {
						getCurGeoData()
				}, 5000);
			
			span_text = '<span><b>Rundgang wurde gestartet</b></span>';        
			jQuery('.statusBox p:gt(0)').fadeOut(500, function () {
				jQuery('<p class="control">' + span_text + '<br />' + span_date + '<img src="img/mBoxEye.png" /></p>').hide().prependTo(".statusBox").delay(350).slideToggle("slow");
				jQuery(this).remove();
			});
			
		} else {
			clearInterval(rInterval);
			
			//Get last GeoData
			var options = {
				enableHighAccuracy: true, 
				timeout: 10000
			};
			rWatchId = navigator.geolocation.getCurrentPosition(onGeoDataSuccess, onGeoDataError, options);	
			
			stopGeoData();
			
			span_text = '<span><b>Rundgang wurde beendet</b></span>';
			jQuery('.statusBox p:gt(0)').fadeOut(500, function () {
				jQuery('<p class="control">' + span_text + '<br />' + span_date + '<img src="img/mBoxEye.png" /></p>').hide().prependTo(".statusBox").delay(350).slideToggle("slow");
				jQuery(this).remove();
			});
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
	
	function onGeoDataSuccess(position) {
		
		//x.innerHTML = '<p class="event received">GPS Signal gefunden!</p>';
		
		geoStrg = '{ "datetime" : ' + new Date().getTime() + ', "status" : "ok", "lat" : ' + position.coords.latitude + ', "lng" : ' + position.coords.longitude + ', "acc" : ' + position.coords.accuracy + ' }, ';
		
		saveCheckPoint(geoStrg);
	}	
	
	function onGeoDataError(error) {
		
		//x.innerHTML = '<p class="event received">Kein GPS Signal gefunden!</p>';
		
		geoStrg = '{ "datetime" : ' + new Date().getTime() + ', "status" : "' + error.code + '" }, ';
		
		saveCheckPoint(geoStrg);
	}
	
	// Wachdienst/Rundgang Start
	function saveCheckPoint(element) {
			
			var d, m, patrol, check, span_text, span_date, json, Rundgang;
			
			if (nr == 0) {
	
					/* Create new Rundgang */
					Rundgang = {};
					Rundgang.id = rCount;
					Rundgang.checkString = [];
					Rundgang.checkString.push(element);
					Rundgang.start = new Date().getTime();
					Rundgang.ende = 0;
					
					oRundgang.Wachdienst.push(Rundgang);
					
					consoleLog('debug', 'Rundgang Start');
					consoleLog('debug', oRundgang);
					
					localStorage.setItem(rKey, JSON.stringify(oRundgang));

					newRundgang(rCount);
					
			} else {
					
					/* Load Rundgang from localStorage */
					oRundgang = {};
					oRundgang = JSON.parse(localStorage.getItem(rKey));
					
					/* Update Rundgang */
					oRundgang.Wachdienst[rCount].checkString.push(element);
		
					consoleLog('debug', "+ Kontrollpunkt");
					consoleLog('debug', oRundgang);
					
					localStorage.setItem(rKey, JSON.stringify(oRundgang));
					
					updateRundgang(rCount, false);

			}
			nr++;
			
	}

	// Wachdienst/Rundgang Stop    
	function stopGeoData() {

		var d, m, span_text, span_date, check;
		
		consoleLog('debug', "Beende Rundgang");

		/* Load Rundgang from localStorage */
		oRundgang = {};
		oRundgang = JSON.parse(localStorage.getItem(rKey));
		
		/* Update Rundgang Ende*/
		oRundgang.Wachdienst[rCount].ende = new Date().getTime();
		consoleLog('debug', "Rundgang Ende");
		consoleLog('debug', oRundgang);
		
		localStorage.setItem(rKey, JSON.stringify(oRundgang));

		updateRundgang(rCount, true);

		nr = 0;
		rCount++;
	
	}

	function newRundgang(rCount) {
	
			consoleLog('debug', "Starte Rundgang");
			
			var hmac, d, m, data, startDatetime, url, oRundgang, rKey, checkString, checkpointMan, i;
	
			checkpointMan = '';
			rKey = 'r_' + localStorage.getItem("fe_user");
			
			oRundgang = {};
			oRundgang = JSON.parse(localStorage.getItem(rKey));
			checkString = oRundgang.Wachdienst[rCount].checkString;
	
			for (i = 0; i < checkString.length; i++) {
					checkpointMan = checkpointMan + checkString[i];
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
							//consoleLog('debug', xOptions);
							
							if (json.uid) {
									consoleLog('debug', "Rundgang: uid => " + json.uid);
									
									/* Update Rundgang */
									oRundgang.Wachdienst[rCount].uid = json.uid;
									consoleLog('debug', oRundgang);
							
									localStorage.setItem(rKey, JSON.stringify(oRundgang));
									
									consoleLog('debug', "Neuer Rundgang erstellt");
							}
							
					},
					error: function (xOptions, textStatus) {
							consoleLog('debug', "Request failed: " + xOptions + " " + textStatus);
							consoleLog('debug', xOptions);
							consoleLog('debug', "Neuer Rundgang erstellt");
					}
			});

	}
	
	function updateRundgang(rCount, isLast) {
	
			consoleLog('debug', "Update Rundgang");
			
			var hmac, d, m, data, startDatetime, url, oRundgang, rKey, checkpointMan, separator, endDatetime, checkString;
	
			checkpointMan = '';
			rKey = 'r_' + localStorage.getItem("fe_user");
			
			oRundgang = {};
			oRundgang = JSON.parse(localStorage.getItem(rKey));
			checkString = oRundgang.Wachdienst[rCount].checkString;
			
			separator = '';
			
			for (var i=0; i < checkString.length; i++) {
					
					if(i>0){
							separator = ', ';
					}
					checkpointMan = checkpointMan + separator + checkString[i];
			}
			
			hmac = 'a:3:{s:8:"rundgang";a:6:{s:6:"feUser";i:1;s:13:"startDatetime";i:1;s:11:"endDatetime";i:1;s:13:"checkpointMan";i:1;s:14:"checkpointAuto";i:1;s:10:"__identity";i:1;}s:6:"action";i:1;s:10:"controller";i:1;}6313957ab723c65dd945a4cfb7063e14c57534fa';
	
			// 17:21:00 5-8-2013
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
							//consoleLog('debug', xOptions);
							
							if(json.uid){
									consoleLog('debug', "Rundgang: uid => " + json.uid);
									
									/* Update Rundgang */
									oRundgang.Wachdienst[rCount].uid = json.uid;
									consoleLog('debug', oRundgang);
							
									localStorage.setItem(rKey,JSON.stringify(oRundgang));
									
									consoleLog('debug', "Rundgang aktualisiert");
							}
							
					},
					error: function(xOptions, textStatus){
							consoleLog('debug', "Request failed: " + xOptions + " " + textStatus);
							consoleLog('debug', xOptions);
							consoleLog('debug', "Rundgang aktualisiert");
					}
			});    
	}

	
	
 
	

	
	
	jQuery("#showPermString").on('click', function () {
			var permString = localStorage.getItem(pFe_user);
	});

	
	jQuery("#clearStorage").on('click', function () {
			localStorage.clear();
	});

	if (!localStorage.getItem(rKey)) {
			consoleLog('debug', "localStorage: Rundgang => create");

			// Wachdienst Array
			oRundgang.Wachdienst = [];
			
	} else {
			consoleLog('debug', "localStorage: Rundgang => load");
			//localStorage.setItem(rKey, patrol + check);

			oRundgang = JSON.parse(localStorage.getItem(rKey));
			
			// Get last Rundgang (Index)
			rCount = oRundgang.Wachdienst.length -1;
			consoleLog('debug', "Last index => " + rCount);
			
			if(oRundgang.Wachdienst[rCount].ende == 0){
					consoleLog('debug', "Rundgang wurde noch nicht beendet!");

					/* Start/Continue auto geocoding */
					// getPCurGeoData();            
		
					jQuery(".expand").animate({
							left: '100%'
					}, 2000, 'linear', function () {
							jQuery(".expand").removeAttr('style');
					});

					jQuery('#rundgangButtons').attr('src', 'img/buttonsAct.png').delay(1500).queue(function (next) {
							jQuery(this).attr('src', 'img/buttonsRun.png');
							next();
					});
					
					checkString = oRundgang.Wachdienst[rCount].checkString;
					
					// Get Last Checkpoint
					nr = checkString.length -1;
					consoleLog('debug', "Last Kontrollpunkt Nr. => " + nr);
					
					last_check = JSON.parse(oRundgang.Wachdienst[rCount].checkString[nr]);
					consoleLog('debug', "Last checkstring => ");
					consoleLog('debug', last_check);
					
					time = parseInt(last_check.datetime);
					
					d = new Date(time);
					m = d.getMonth() + 1;

					span_date = '<span>Zeit: ' + d.getHours() + ':' + d.getMinutes() + ' Datum: ' + d.getDate() + '.' + m + '.' + d.getFullYear() + '</span>';
					
					if (nr == 0) {
							span_text = '<span><b>Rundgang wurde gestartet</b></span>';
					}
					else {
							span_text = '<span><b>Kontrollpunkt Nr. ' + nr + ' wurde gespeichert</b></span>';
					}
					
					jQuery('.statusBox p:gt(0)').fadeOut(500, function () {
							jQuery('<p class="control">' + span_text + '<br />' + span_date + '<img src="img/mBoxEye.png" /></p>').hide().prependTo(".statusBox").delay(350).slideToggle("slow");
							jQuery(this).remove();
					});
					
					nr++;
			}
			else{
					rCount++;
			}
	}
	
		
		
		
		
		
		
		
});