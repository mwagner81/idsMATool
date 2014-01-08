jQuery(document).ready(function () {
	
    // set global Variables
		var reportData, mKey, mInterval, searchGeoData;
		var reportContainer = {};

		var mTimeout = 10000;
		var mMaximumAge = 5000;
		var mEnableHighAccuracy = true;
		var searchGeoData = false;
		var setGeoDataErrCount = 0;
				
    if (localStorage.getItem("fe_user")) {
        // Set key for Meldung
        mKey = 'm_' + localStorage.getItem("fe_user");
    }
		if (!localStorage.getItem(mKey)) {
			// Basiseintrag in Localstorage
			reportContainer.reports = [];		
			localStorage.setItem(mKey, JSON.stringify(reportContainer));
		} else {
			// wenn bereits ein Eintrag vorhanden ist
			reportContainer = JSON.parse(localStorage.getItem(mKey));
			
			for (i=0;i<reportContainer.reports.length;i++) {
				if (reportContainer.reports[i].lat == "") {
					getCurGeoData();
					break;
				}
			}
			saveTimeout = setTimeout(function() {
						saveReportToServer()
				}, 5000);
				
		}
		
		jQuery(".saveMeldung").on('click', function () {
			
      reportData = {};
			d = new Date();
			m = d.getMonth() + 1; 
			
			if(jQuery(this).hasClass("01_meldung")) {
				// Vandalismus
				reportData.type = "Vandalismus";
				reportData.police = jQuery("#01_wachzimmer").val();
				reportData.comment = jQuery("#01_comment").val();				
				reportData.fotos = localStorage.getItem("pics");
				uploadFiles();
				
			} else if(jQuery(this).hasClass("02_meldung")) {
				// Lost & Found
				reportData.type = "Lost & Found";
				reportData.found = jQuery(".02_gefunden:checked").val();
				reportData.comment = jQuery("#02_comment").val();		
				
			} else if(jQuery(this).hasClass("03_meldung")) {
				//unangemeldete Ein- oder Ausstiegshilfe
				reportData.type = "Unangemeldete Ein-, Ausstieghilfe";   
				reportData.trainNumber = jQuery("#03_zugnummer").val();
				reportData.numOfPersons = jQuery("#03_persons").val();				
				reportData.lift = jQuery("#03_hebelift").prop('checked') ? 1 : 0;
				reportData.wheelchair = jQuery("#03_bahnrollstuhl").prop('checked') ? 1 : 0;
				reportData.escort = jQuery("#03_begleitung").prop('checked') ? 1 : 0;
				reportData.stationOfArrival = jQuery("#03_ankunftsbhf").val();	
				reportData.departureContacted = jQuery("#03_austieg_kontakt").prop('checked') ? 1 : 0;	
				reportData.comment = jQuery("#03_comment").val();		
				        
			} else if(jQuery(this).hasClass("04_meldung")) {
				// Aufzugsbefreiung
				reportData.type = "Aufzugsbefreiung"; 
				if ((jQuery("#04_eingetroffen_std").val().length > 0) && (jQuery("#04_eingetroffen_min").val().length > 0)) {
					reportData.arrivalTime = jQuery("#04_eingetroffen_std").val()+":"+jQuery("#04_eingetroffen_min").val()+':'+d.getSeconds()+' '+d.getDate()+'-'+m+'-'+d.getFullYear();
				} else {
					reportData.arrivalTime =  '00:00:'+d.getSeconds()+' '+d.getDate()+'-'+m+'-'+d.getFullYear();
				}
				if ((jQuery("#04_beendet_std").val().length > 0) && (jQuery("#04_beendet_min").val().length > 0)) {
					reportData.endTime = jQuery("#04_beendet_std").val()+":"+jQuery("#04_beendet_min").val()+':'+d.getSeconds()+' '+d.getDate()+'-'+m+'-'+d.getFullYear();
				} else {
					reportData.endTime = '00:00:'+d.getSeconds()+' '+d.getDate()+'-'+m+'-'+d.getFullYear();
				}
				reportData.comment = jQuery("#04_comment").val();				
			
			} else if(jQuery(this).hasClass("05_meldung")) {
				// Gewalt an Mitarbeiter
				reportData.type = "Gewalt an Mitarbeiter"; 
				reportData.police = jQuery("#05_wachzimmer").val();
				reportData.hospital = jQuery("#05_krankenhaus").val();
				reportData.comment = jQuery("#05_comment").val();	
				               
			} else if(jQuery(this).hasClass("06_meldung")) {
				// Einbruch / Diebstahl
				reportData.type = "Einbruch / Diebstahl";  
				reportData.police = jQuery("#06_wachzimmer").val();
				reportData.security = jQuery("#06_konzernsicherheit").prop('checked') ? 1 : 0;	
				reportData.comment = jQuery("#06_comment").val();	 
				reportData.fotos = localStorage.getItem("pics");
				uploadFiles();
				             
			} else if(jQuery(this).hasClass("07_meldung")) {
				// Beschwerden/Anfragen
				reportData.type = "Beschwerden / Anfragen"; 
				reportData.name = jQuery("#07_name").val();
				reportData.address = jQuery("#07_adresse").val();
				reportData.contact = jQuery("#07_kontakt").val();
				reportData.comment = jQuery("#07_comment").val();
					              
			} else if(jQuery(this).hasClass("08_meldung")) {
				// Randgruppen
				reportData.type = "Randgruppen";  
				reportData.comment = jQuery("#08_comment").val();  
				
			} else if(jQuery(this).hasClass("09_meldung")) {
				// Raucherstrafen
				reportData.type = "Raucherstrafen";   
				
			} else if(jQuery(this).hasClass("10_meldung")) {
				// Verweise/Belehrung
				reportData.type = "Verweise / Belehrung";
				reportData.comment = jQuery("#10_comment").val();
			
			} else if(jQuery(this).hasClass("11_meldung")) {
				//Einsatzkräfte
				reportData.type = "Einsatzkräfte";   			
				reportData.firedept = jQuery("#11_feuerwehr").prop('checked') ? 1 : 0;
				reportData.police = jQuery("#11_polizei").prop('checked') ? 1 : 0;
				reportData.ambulance = jQuery("#11_rettung").prop('checked') ? 1 : 0;
				reportData.dataOfForces = jQuery("#11_data_of_forces").val();		
				reportData.comment = jQuery("#11_comment").val();		
					
			}
		
			reportData.timestamp = new Date();
			reportData.lat = "";
			reportData.lng = "";
			reportData.acc = "";	
			reportData.geoTimestamp = "";	
			reportData.complete = 0;	
		 
			// opens the confirm dialog
			jQuery.mobile.changePage("#confirmDialog", {
					transition: "slidedown", 
					changeHash: false
			});
					
			// writes the text of the current meldung in the confirm box
			jQuery(".confContent").find("h1").text("Möchten Sie die Meldung \""+reportData.type+"\" abschicken?");     
			
    });
		
		jQuery(".mConfirm").on('click',function () {
			// Daten abspeichern			
			saveReportData(reportData);		
			
			//
			jQuery(".meForm").each(function(){
					jQuery(this).slideUp("fast").siblings("a.meldungButtonD").find("img").attr('src', 'img/meldungButtonPlus.png');
			});	      
		});		
	
		jQuery(".mBreak").on('click', function () {
			// Formular zurücksetzen
			resetForm();				
		});		
	
		jQuery(".showMeForm").on('click', function () {
			// öffnet das Formular des jeweiligen Meldungstyps
			if (jQuery(this).next(".meForm").hasClass("active")){
					jQuery(this).next(".meForm").slideUp("fast").removeClass("active");
					jQuery(this).find("img.mbPlus").attr('src', 'img/meldungButtonPlus.png');
			}else {
					jQuery(".meForm").slideUp("fast").removeClass("active");
					jQuery(".showMeForm").find("img.mbPlus").attr('src', 'img/meldungButtonPlus.png')
					jQuery(this).next(".meForm").slideDown("fast").addClass("active");
					jQuery(this).find("img.mbPlus").attr('src', 'img/meldungButtonMinus.png');
					
			}
		});  
		
		/**************************************************************
			MELDUNG ZURÜCKSETZEN
		***************************************************************/		
		function resetForm() {			
			localStorage.removeItem("pics");   
			jQuery("input[type=text], textarea").val("");
			jQuery("input[type=checkbox]").attr('checked', false);
			jQuery("select").attr('checked', false);
			
			jQuery(".meForm").slideUp("fast").siblings("a.meldungButtonD").find("img").attr('src', 'img/meldungButtonPlus.png');
		}
		
		/**************************************************************
			MELDUNG IN DEN LOCALSTORAGE SPEICHERN
		***************************************************************/	    
		function saveReportData(reportData){
			//jQuery("#permaCheck").append('<span><b>saveReportData</b></span><br /><hr>');
			
			localStorage.setItem("pics", '');
			
			reportContainer = JSON.parse(localStorage.getItem(mKey));
			if (reportContainer.reports) {
				reportContainer.reports.push(reportData);
			} else {
				reportContainer.reports = [];
				reportContainer.reports.push(reportData);
			}
			localStorage.setItem(mKey, JSON.stringify(reportContainer));
			
			resetForm();
			getCurGeoData();
		}  
		
		/**************************************************************
			HOLE AKTUELLE GEO-KOORDINATEN
		***************************************************************/
		function getCurGeoData() {	
			// holt die aktuellen Geokoordinaten	
			//jQuery("#permaCheck").append('<span><b>Geo-Data</b></span>: start searching<br /><hr>');
			if ( searchGeoData == false	) {
				searchGeoData = true;
				var options = { maximumAge: mMaximumAge, timeout: mTimeout, enableHighAccuracy: mEnableHighAccuracy };
				rWatchId = navigator.geolocation.getCurrentPosition(saveGeoData, onGeoError, options);	
			}	
		}
		
		/**************************************************************
			SPEICHERT DIE ERHALTENEN GEO-DATEN ZU DEN OFFENEN MELDUNGEN
		***************************************************************/	
		function saveGeoData(position) {	
			//jQuery("#permaCheck").append('<span><b>Geo-Data</b></span>: Data found<br /><hr>');
			
			searchGeoData = false;
			mTimeout = 10000;
			setGeoDataErrCount = 0;
			
			reportContainer = JSON.parse(localStorage.getItem(mKey));
			
			for (i=0;i<reportContainer.reports.length;i++) {
				if (reportContainer.reports[i].lat == "") {
					reportContainer.reports[i].lat = position.coords.latitude;
					reportContainer.reports[i].lng = position.coords.longitude;
					reportContainer.reports[i].acc = position.coords.accuracy;		
					reportContainer.reports[i].geoTimestamp = position.timestamp;
				}
			}
			
			localStorage.setItem(mKey, JSON.stringify(reportContainer)); 
			
			saveReportToServer();
		}
		
		function onGeoError(error) {
			//jQuery("#permaCheck").append('<span><b>Geo-Data</b></span>: NO Data found<br /><hr>');
			
			searchGeoData = false;	
			setGeoDataErrCount++;
			if (setGeoDataErrCount > 5) { mTimeout = 60000; }	
			getCurGeoData()
		}
		
		/**************************************************************
			SPEICHERT ALLE MELDUNGEN AM SERVER
		***************************************************************/		
		function saveReportToServer() {
    
			//mString = mString.replace(/\n/g,"\\n");
			
			//reportContainer = {};
			reportContainer = JSON.parse(localStorage.getItem(mKey));
		
			if (reportContainer && reportContainer.reports && reportContainer.reports[0]) {
			
				if  (reportContainer.reports[0].lat != "") {
					
					data = {
							'id': meldung_page_uid,
							'no_cache': 1,
							'type': meldung_page_type,
							'tx_mungosstoerung[report]': JSON.stringify(reportContainer.reports[0]),
							'tx_mungosstoerung[feUser]': localStorage.getItem("fe_user"),
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
								localStorage.setItem(mKey,JSON.stringify(reportContainer));
								if (reportContainer.reports.length > 0) {
									saveTimeout = setTimeout(function() {
												saveReportToServer()
										}, 1000); 
								}
									
							},
							error: function(){
								saveTimeout = setTimeout(function() {
											saveReportToServer()
									}, 1000); 
								
							}
					});
				} else {
					saveTimeout = setTimeout(function() {
								saveReportToServer()
						}, 1000);
				}
			}        
    }	

});