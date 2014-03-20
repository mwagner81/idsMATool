/* GLOBAL VARS */
var u_key, timer, debug;

/* CONFIG VARS */
var version = '1.4.5';
var domain = "http://active-dev.mungos-services.at";
var app_url = domain + "/index.php";
var imgUpload_url = domain + "/fileadmin/upload/upload.php";
var rundgang_page_uid = 77;
var rundgang_page_type = 99;
var meldung_page_uid = 79;
var meldung_page_type = 97;

document.addEventListener("deviceready", init, false);
function init() {	
	window.plugins.orientationchanger.lockOrientation('portrait');
}
document.addEventListener("backbutton", callbackFunction, false);
function callbackFunction() {	
	
}

/*document.addEventListener("online",  function(){
    //document.getElementById('onlineTest').innerHTML = "<br /><br /><span style='font-weight:bold;color:green'>Online</span>";
}, false);

document.addEventListener("offline",  function(){
    //document.getElementById('onlineTest').innerHTML = "<br /><br /><span style='font-weight:bold;color:red'>Offline</span>";
}, false);*/


function getLogTime() {
    
    var d, time;
    d = new Date();
    time = d.getHours() + ':' + d.getMinutes() + ':' +  d.getSeconds() + ':' + d.getMilliseconds();
    
    return time;
}


			
function consoleLog(type, output) {
	
	if (debug) {
			
			switch (type) {
					case "debug":
							console.debug(output);
							break;
					case "info":
							console.info(output);
							break;
					case "warn":
							console.warn(output);
							break;
					case "error":
							console.error(output);
							break;
					default:
							console.log(output);
							break;
			}
	}
}

// debug = true for console output
if (typeof (console) != 'undefined') {
		debug = true;
} else {
	debug = false;
}


jQuery(document).ready(function () {
		
		saveTimeoutOldCheckpoints = setTimeout(function() {
					saveOldCheckoints()
			}, 1000);
		saveTimeoutOldReport = setTimeout(function() {
					saveOldReports()
			}, 1000);

		
		if (localStorage.getItem("fe_user")) {
			// Set key for userData
			u_key = 'u_' + localStorage.getItem("fe_user");
    }
		
		jQuery("#loginForm").submit(function () {

			var error, form, data, username, password, request, u_key;
			
			jQuery("#loginError").html('');
			
			error = false;
			
			/* get some values from elements on the page: */
			form = jQuery(this);
			username = form.find('input[name="username"]').val();
			password = form.find('input[name="password"]').val();

			data = {
					'id': 76,
					'no_cache': 1,
					'type': 98,
					'tx_idsapplogin_pi1[username]': username,
					'tx_idsapplogin_pi1[password]': password,
					'tx_idsapplogin_pi1[logintype]': "login"
			};
			
			if (username == '') {
					error = true;
					jQuery('#loginError').append("<p>Benutzername ist leer</p>");
			}
			if (password == '') {
					error = true;
					jQuery('#loginError').append("<p>Passwort ist leer</p>");
			}
	
			if (error) {
					return false;
			}
	
			request = jQuery.ajax({
					type: 'POST',
					url: domain,
					data: data,
					dataType: 'jsonp',
					jsonp: 'jsonp_callback'
			});
	
			request.done(function (result) {

					if (result.logged_in == undefined) {
							jQuery('#loginError').append("<p>Request failed</p>");
							return false;
					}
						
					if (result.logged_in == false) {
							if (result.login_err == 1) {
								jQuery('#loginError').append("<p>Benutzername u/o Passwort ist falsch</p>");
							} else if (result.login_err == 2) {
								jQuery('#loginError').append("<p>Der Benutzer existiert nicht</p>");
							} else {
								jQuery('#loginError').append("<p>Unbekannter Fehler beim Login</p>");
							}
					} else {
							//$('#loginError').append("<p>Sie sind angemeldet!</p>");
							
							localStorage.setItem('fe_user', result.user_uid);
							
							// Benutzer zu Benutzerarray hinzufügen 
							// zur Übermittlung der Daten an den Server auch wenn nicht eingeloggt
							if (localStorage.getItem("all_fe_user")) {
								fe_users = localStorage.getItem("all_fe_user");
								fe_users_arr = fe_users.split(",");
								if (fe_users_arr.indexOf(result.user_uid) < 0) {
									fe_users_arr.push(result.user_uid);
									localStorage.setItem("all_fe_user",fe_users_arr.toString());
								}
							} else {
								localStorage.setItem("all_fe_user",result.user_uid);
							}
							
							// Set key for userData
							u_key = 'u_' + result.user_uid;
							
							var uData = {};
							uData.username = username;
							uData.password = password;
							uData.logged_in = result.logged_in;
							uData.user_uid = result.user_uid;
							uData.user_name = result.user_name;
							//consoleLog('debug', uData);
						 
							if (localStorage.getItem(u_key)) {
									consoleLog('debug', "localStorage " + u_key + " already exists");
							} else {
									consoleLog('debug', "localStorage " + u_key + " does not exist");
							}
							
							// Set userData
							localStorage.setItem(u_key, JSON.stringify(uData));
							
							//beendeAlleRundgaenge();
							
							//consoleLog('debug', JSON.parse(localStorage.getItem(u_key)));
							//consoleLog('debug', localStorage);
							window.location.replace('content.html');
					}

			});

			// The error callback is executed if the ajax call can't be completed - 
			// i.e. if the url is on a different domain (or if you are running it from a local file), 
			// if the request timeouts, 
			// or if the server responds with an error code.
			request.fail(function (jqXHR, textStatus) {
					jQuery('#loginError').append("<p>Request failed: " + textStatus + "</p>");
			});
	
			return false;
	});

	jQuery("#userLogout").on('click', function () {
				
			uData = {};
			uData = JSON.parse(localStorage.getItem(u_key));
			uData.logged_in = false;
							
			beendeAlleRundgaenge();
			
			// Set userData
			localStorage.setItem(u_key, JSON.stringify(uData));
			localStorage.setItem("fe_user", 0);
			window.location.replace('index.html');
	
			return false;
	});
	
	/**************************************************************
		RUNDGANG-DATEN SÄUBERN
	***************************************************************/
	
	function beendeAlleRundgaenge(feuser) {
		var rundgangContainer; //, cleanLocalStorage;
		
		var rKey = 'r_' + localStorage.getItem("fe_user");
		
		cleanLocalStorage = true;
		
		rundgangContainer = {};
		rundgangContainer = JSON.parse(localStorage.getItem(rKey));
		if (rundgangContainer && (rundgangContainer.Wachdienst.length > 0)) {
			// Rundgänge vorhanden
			for (i=0;i<rundgangContainer.Wachdienst.length;i++) {
				if (rundgangContainer.Wachdienst[i].ende == 0) {
					rundgangContainer.Wachdienst[i].ende = new Date().getTime();					
				}
			}	
			localStorage.setItem(rKey, JSON.stringify(rundgangContainer));
		}
	}
	
	/**************************************************************
		ÜBRIGGEBLIEBENE RUNDGANGDATEN SPEICHERN ODER AKTUALISIEREN
	***************************************************************/
	
	function saveOldCheckoints() {
		
		var rundgangContainer, checkpointContainer, checkpoint;
		
		if (localStorage.getItem("all_fe_user")) {
			fe_users = localStorage.getItem("all_fe_user");
			fe_users_arr = fe_users.split(",");
			
			if (fe_users_arr.length > 0) {
				// hole einen User ausser dem aktuellen
				curr_fe_user = 0;
				for (i=0;i<fe_users_arr.length;i++) {
					if (fe_users_arr[i] != localStorage.getItem("fe_user")) {
						curr_fe_user = fe_users_arr[i];
						curr_rKey = 'r_'+fe_users_arr[i];
						break;
					}
				}
				
				if (curr_fe_user > 0) {
					rundgangContainer = {};
					rundgangContainer = JSON.parse(localStorage.getItem(curr_rKey));
					
					if (rundgangContainer && rundgangContainer.Wachdienst[0]) {
						// es existiert ein Rundgang
					
						checkpointContainer = rundgangContainer.Wachdienst[0].checkString;
						
						if (checkpointContainer[0]) {
							// noch nicht gespeicherte Checkpoints vorhanden
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
									'tx_idsmungosrundgang[feUser]': curr_fe_user,
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
										
										if (rundgangContainer.Wachdienst[0].uid == 0) {
											rundgangContainer.Wachdienst[0].uid = json.uid;
										}
										rundgangContainer.Wachdienst[0].checkString.shift();
										//if (rundgangContainer.Wachdienst[0].ende > 0) {
										if (json.rStatus == 'complete') {
											rundgangContainer.Wachdienst[0].complete = 1;
										}
										localStorage.setItem(curr_rKey,JSON.stringify(rundgangContainer));
										
									}
									
									saveTimeoutOldCheckpoints = setTimeout(function() {
												saveOldCheckoints()
										}, 50);
																
								},
								error: function(){
									saveTimeoutOldCheckpoints = setTimeout(function() {
												saveOldCheckoints()
										}, 50);
										
								}
							});				
					
						}	else {
							// keine Checkpoints
							
							if (rundgangContainer.Wachdienst[0].complete > 0) {
								// Übermittlung abgeschlossen -> Rundgang entfernen
								rundgangContainer.Wachdienst.shift();
								localStorage.setItem(curr_rKey,JSON.stringify(rundgangContainer));					
							} else {
								// Rundgang noch nicht abgeschlossen - End-Checkpoint integrieren und übermitteln
								rundgangContainer = JSON.parse(localStorage.getItem(curr_rKey));
								
								var geoData = {};
								geoData.datetime = rundgangContainer.Wachdienst[0].ende;
								geoData.checkpoint = rundgangContainer.Wachdienst[0].checkpointNr + 1;
								geoData.status = 'complete';								
								
								rundgangContainer.Wachdienst[0].checkString.push(geoData);
								rundgangContainer.Wachdienst[0].checkpointNr = rundgangContainer.Wachdienst[0].checkpointNr + 1;
								localStorage.setItem(curr_rKey, JSON.stringify(rundgangContainer));
							}				
							
							// nur dann wenn noch andere User 
							saveTimeoutOldCheckpoints = setTimeout(function() {
										saveOldCheckoints()
								}, 50);
							
						} //if (checkpointContainer[0]) {
					} else {
						// keine weiteren Rundgänge vorhanden
						// Rundgang-eintrag löschen
							localStorage.removeItem(curr_rKey);
						
						// Prüfen ob noch Meldungen vorhanden
						// sonst User aus all_users löschen
						
						if (!localStorage.getItem('m_'+curr_fe_user)) {
							for (i=0;i<fe_users_arr.length;i++) {
								if (fe_users_arr[i] == curr_fe_user) break;
							}
							fe_users_arr.splice(i,1);
							localStorage.setItem("all_fe_user",fe_users_arr.toString());							
							if (localStorage.getItem('u_'+curr_fe_user)) localStorage.removeItem('u_'+curr_fe_user);
						}
						
						// nur dann wenn noch andere
						if (fe_users_arr.length > 0) {
							saveTimeoutOldCheckpoints = setTimeout(function() {
										saveOldCheckoints()
								}, 50);
						}
						
					} //if (rundgangContainer && rundgangContainer.Wachdienst[0]) {
				} //if (curr_fe_user > 0) {
			} //if (fe_users_arr.length > 0) {
		} //if (localStorage.getItem("all_fe_user")) {
	} //function
	
	/**************************************************************
		SPEICHERT ALLE ALTEN MELDUNGEN AM SERVER
	***************************************************************/		
	function saveOldReports() {
	
		if (localStorage.getItem("all_fe_user")) {
			fe_users = localStorage.getItem("all_fe_user");
			fe_users_arr = fe_users.split(",");
			
			if (fe_users_arr.length > 0) {
				// hole einen User ausser dem aktuellen
				curr_fe_user = 0;
				for (i=0;i<fe_users_arr.length;i++) {
					if (fe_users_arr[i] != localStorage.getItem("fe_user")) {
						curr_fe_user = fe_users_arr[i];
						curr_mKey = 'm_'+fe_users_arr[i];
						break;
					}
				}
				
				if (curr_fe_user > 0) {
					//reportContainer = {};
					reportContainer = JSON.parse(localStorage.getItem(curr_mKey));
				
					if (reportContainer && reportContainer.reports) {
						// mind. 1Meldung existiert
						if (reportContainer.reports[0]) {
							data = {
									'id': meldung_page_uid,
									'no_cache': 1,
									'type': meldung_page_type,
									'tx_mungosstoerung[report]': JSON.stringify(reportContainer.reports[0]),
									'tx_mungosstoerung[feUser]': curr_fe_user,
									'tx_mungosstoerung[version]': version
									
							};
							//jQuery("#permaCheck").append('<span><b>Save</b></span>: save report to server<br /><hr>');
				
							$.jsonp({
									url: app_url,
									data: data,
									callbackParameter: 'jsonp_callback',
									success: function(json) { 
										//consoleLog('debug', JSON.stringify(reportContainer.reports[0]));
										reportContainer.reports.shift();
										localStorage.setItem(curr_mKey,JSON.stringify(reportContainer));
										if (reportContainer.reports.length > 0) {
											saveTimeoutOldReport = setTimeout(function() {
														saveOldReports()
												}, 50); 
										}
											
									},
									error: function(){
										saveTimeoutOldReport = setTimeout(function() {
													saveOldReports()
											}, 50); 
										
									}
							});
						} else {
							// keine Meldung ist vorhanden
							localStorage.removeItem(curr_mKey);
							
							if (!localStorage.getItem('r_'+curr_fe_user)) {
								for (i=0;i<fe_users_arr.length;i++) {
									if (fe_users_arr[i] == curr_fe_user) break;
								}
								fe_users_arr.splice(i,1);
								localStorage.setItem("all_fe_user",fe_users_arr.toString());
								if (localStorage.getItem('u_'+curr_fe_user)) localStorage.removeItem('u_'+curr_fe_user);
							}
							
							if (fe_users_arr.length > 0) {
								saveTimeoutOldReport = setTimeout(function() {
											saveOldReports()
									}, 50);
							}
						} //if (reportContainer.reports[0]) {
					} //if (reportContainer && reportContainer.reports) {
				} //if (curr_fe_user > 0) {
			} //if (fe_users_arr.length > 0) {
		} //if (localStorage.getItem("all_fe_user")) {
	}	//function
		
});

