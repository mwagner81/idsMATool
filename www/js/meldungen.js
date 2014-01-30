jQuery(document).ready(function () {
	
    // set global Variables
		var reportData, mKey, mInterval, searchGeoData;
		var reportContainer = {};

		var mTimeout = 10000;
		var mMaximumAge = 5000;
		var mEnableHighAccuracy = true;
		var searchGeoData = false;
		var setGeoDataErrCount = 0;
		
		var form;
		var formValidation = false;
				
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
		jQuery.validator.setDefaults({
			debug: true,
			success: "valid"
		});
		
		jQuery(".saveMeldung").on('click', function () {
			
      reportData = {};
			d = new Date();
			m = d.getMonth() + 1; 
			
			if(jQuery(this).hasClass("meldung_01")) {
				// Vandalismus				
				reportData.matchcode = "01";
				reportData.type = "Vandalismus";
				formValidation = true;
				form = $( "#meform_01" );
				form.validate({
					rules: {
						wachzimmer_01: {
							required: true
						}
					},
					messages: {
						wachzimmer_01: "Bitte Wachzimmer angeben!"
					}
				});
				reportData.police = jQuery("#wachzimmer_01").val();
				reportData.comment = jQuery("#comment_01").val();								
				reportData.fotos = getPics('01');
				
			} else if(jQuery(this).hasClass("meldung_02")) {
				// Lost & Found
				reportData.matchcode = "02";
				reportData.type = "Lost & Found";
				formValidation = false;
				reportData.found = jQuery(".gefunden_02:checked").val();
				reportData.comment = jQuery("#comment_02").val();		
				
			} else if(jQuery(this).hasClass("meldung_03")) {
				//unangemeldete Ein- oder Ausstiegshilfe
				reportData.matchcode = "03";
				reportData.type = "Unangemeldete Ein-, Ausstieghilfe"; 
				formValidation = true;
				form = $( "#meform_03" );
				form.validate({
					rules: {
						zugnummer_03: {
							required: true
						}
					},
					messages: {
						zugnummer_03: "Bitte eine Zugnummer angeben!"
					}
				});  
				reportData.trainNumber = jQuery("#zugnummer_03").val();
				reportData.numOfPersons = jQuery("#persons_03").val();				
				reportData.lift = jQuery("#hebelift_03").prop('checked') ? 1 : 0;
				reportData.wheelchair = jQuery("#bahnrollstuhl_03").prop('checked') ? 1 : 0;
				reportData.escort = jQuery("#begleitung_03").prop('checked') ? 1 : 0;
				reportData.stationOfArrival = jQuery("#ankunftsbhf_03").val();	
				reportData.departureContacted = jQuery("#austieg_kontakt_03").prop('checked') ? 1 : 0;	
				reportData.comment = jQuery("#comment_03").val();		
				        
			} else if(jQuery(this).hasClass("meldung_04")) {
				// Aufzugsbefreiung
				reportData.matchcode = "04";
				reportData.type = "Aufzugsbefreiung"; 
				formValidation = false;
				if ((jQuery("#eingetroffen_std_04").val().length > 0) && (jQuery("#eingetroffen_min_04").val().length > 0)) {
					reportData.arrivalTime = jQuery("#eingetroffen_std_04").val()+":"+jQuery("#eingetroffen_min_04").val()+':'+d.getSeconds()+' '+d.getDate()+'-'+m+'-'+d.getFullYear();
				} else {
					reportData.arrivalTime =  '00:00:'+d.getSeconds()+' '+d.getDate()+'-'+m+'-'+d.getFullYear();
				}
				if ((jQuery("#beendet_std_04").val().length > 0) && (jQuery("#beendet_min_04").val().length > 0)) {
					reportData.endTime = jQuery("#beendet_std_04").val()+":"+jQuery("#beendet_min_04").val()+':'+d.getSeconds()+' '+d.getDate()+'-'+m+'-'+d.getFullYear();
				} else {
					reportData.endTime = '00:00:'+d.getSeconds()+' '+d.getDate()+'-'+m+'-'+d.getFullYear();
				}
				reportData.comment = jQuery("#comment_04").val();				
			
			} else if(jQuery(this).hasClass("meldung_05")) {
				// Gewalt an Mitarbeiter
				reportData.matchcode = "05";
				reportData.type = "Gewalt an Mitarbeiter"; 
				formValidation = true;
				form = $( "#meform_05" );
				form.validate({
					rules: {
						wachzimmer_05: {
							required: true
						}
					},
					messages: {
						wachzimmer_05: "Bitte Wachzimmer angeben!"
					}
				});  
				reportData.police = jQuery("#wachzimmer_05").val();
				reportData.hospital = jQuery("#krankenhaus_05").val();
				reportData.comment = jQuery("#comment_05").val();	
				               
			} else if(jQuery(this).hasClass("meldung_06")) {
				// Einbruch / Diebstahl
				reportData.matchcode = "06";
				reportData.type = "Einbruch / Diebstahl";  
				formValidation = true;
				form = $( "#meform_06" );
				form.validate({
					rules: {
						wachzimmer_06: {
							required: true
						}
					},
					messages: {
						wachzimmer_06: "Bitte Wachzimmer angeben!"
					}
				});  
				reportData.police = jQuery("#wachzimmer_06").val();
				reportData.security = jQuery("#konzernsicherheit_06").prop('checked') ? 1 : 0;	
				reportData.comment = jQuery("#comment_06").val();	 
				reportData.fotos = getPics('06');
				             
			} else if(jQuery(this).hasClass("meldung_07")) {
				// Beschwerden/Anfragen
				reportData.matchcode = "07";
				reportData.type = "Beschwerden / Anfragen"; 
				formValidation = false;
				reportData.name = jQuery("#name_07").val();
				reportData.address = jQuery("#adresse_07").val();
				reportData.contact = jQuery("#kontakt_07").val();
				reportData.comment = jQuery("#comment_07").val();
					              
			} else if(jQuery(this).hasClass("meldung_08")) {
				// Randgruppen
				reportData.matchcode = "08";
				reportData.type = "Randgruppen";  
				formValidation = false;
				reportData.comment = jQuery("#comment_08").val();  
				
			} else if(jQuery(this).hasClass("meldung_09")) {
				// Raucherstrafen
				reportData.matchcode = "09";
				reportData.type = "Raucherstrafen";   
				formValidation = false;
				
			} else if(jQuery(this).hasClass("meldung_10")) {
				// Verweise/Belehrung
				reportData.matchcode = "10";
				reportData.type = "Verweise / Belehrung";
				reportData.comment = jQuery("#comment_10").val();
				formValidation = false;
			
			} else if(jQuery(this).hasClass("meldung_11")) {
				//Einsatzkräfte
				reportData.matchcode = "11";
				reportData.type = "Einsatzkräfte"; 
				formValidation = false;
				/*form = $( "#meform_11" );
				form.validate({
					rules: {
						forces: {
							required: true
						}
					},
					messages: {
						forces: "Bitte mind. eine Einsatzkraft auswählen!"
					}
				});*/		
				reportData.firedept = jQuery("#feuerwehr_11").prop('checked') ? 1 : 0;
				reportData.police = jQuery("#polizei_11").prop('checked') ? 1 : 0;
				reportData.ambulance = jQuery("#rettung_11").prop('checked') ? 1 : 0;
				reportData.dataOfForces = jQuery("#data_of_forces_11").val();		
				reportData.comment = jQuery("#comment_11").val();		
					
			} else if(jQuery(this).hasClass("meldung_99")) {
				//Einsatzkräfte
				reportData.matchcode = "99";
				reportData.type = "Notfall"; 
				formValidation = false;					
			}
		
			reportData.timestamp = new Date();
			reportData.lat = "";
			reportData.lng = "";
			reportData.acc = "";	
			reportData.geoTimestamp = "";	
			reportData.complete = 0;	
		 
			// opens the confirm dialog
			if (formValidation == false) {
				if (reportData.matchcode != 99) {
					jQuery.mobile.changePage("#confirmDialog", {
							transition: "slidedown", 
							changeHash: false
					});					
					// writes the text of the current meldung in the confirm box
					jQuery(".confContent").find("h1").text("Möchten Sie die Meldung \""+reportData.type+"\" abschicken?");  
				} else {
					// NOTFALL
					saveReportData(reportData);	
				}
			} else {
				if (form.valid()) {
					jQuery.mobile.changePage("#confirmDialog", {
							transition: "slidedown", 
							changeHash: false
					});					
					// writes the text of the current meldung in the confirm box
					jQuery(".confContent").find("h1").text("Möchten Sie die Meldung \""+reportData.type+"\" abschicken?");    
				} else {
					/*jQuery.mobile.changePage("#errorDialog", {
							transition: "slidedown",
							role: "dialog"
					});*/
				}
			}
			
    });
		
		jQuery(".mConfirm").on('click',function () {
			// Daten abspeichern			
			saveReportData(reportData);	
				
			//
			jQuery(".meForm").each(function(){
					jQuery(this).slideUp("fast").siblings("a.meldungButtonD").find("img").attr('src', 'img/meldungButtonPlus.png');
			});	   
			
			uploadFiles();   
		});		
	
		jQuery(".mBreak").on('click', function () {
			// Formular zurücksetzen
			resetForm();				
		});		
		
		jQuery(".eBreak").on('click', function () {
			//scroll to Meldung
			//jQuery(this).next(".meForm").scrollIntoView();
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
			HOLE FOTOS ZU MELDUNG
		***************************************************************/		
		function getPics(matchcode) {			
			pKey = 'p_' + localStorage.getItem("fe_user");
			if (!localStorage.getItem(pKey)) {
				return '';
				
			} else {
				picContainer = JSON.parse(localStorage.getItem(pKey));
				curIdx = -1;	
				for (i = 0; i < picContainer.reports.length; i++) {
					if ((picContainer.reports[i].matchcode == matchcode) && (picContainer.reports[i].complete == 0)) {						
						curIdx = i;
					}
				}
								
				if (curIdx >= 0) {					
					pics = picContainer.reports[curIdx].pics;
					
					jQuery("#permaCheck").append('<span><b>pics: </b></span>'+JSON.stringify(pics)+'<br><hr>');
					
					picsStrg = '';
					for (j=0;j<pics.length;j++) {
						picsStrg = picsStrg + pics[j].name + ',';
						jQuery("#permaCheck").append('<span><b>picsStrg+: </b></span>'+pics[j].name+'<br><hr>');
					}
					picContainer.reports[curIdx].complete = 1;
					localStorage.setItem(pKey, JSON.stringify(picContainer));

					jQuery("p#"+matchcode+"_pics").html("");
					
					return picsStrg;
					
				} else {
					jQuery("#permaCheck").append('<span><b>picStrg: </b></span>empty<br><hr>');
					return '';
					
				}
				
			}
			
		} 
		
		/**************************************************************
			MELDUNG ZURÜCKSETZEN
		***************************************************************/		
		function resetForm() {			
			//localStorage.removeItem("pics");   
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
			
			//localStorage.setItem("pics", '');
			
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