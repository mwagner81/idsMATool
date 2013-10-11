jQuery(document).ready(function () {
		if (localStorage.getItem("fe_user")) {
        // Set key for Rundgang
        r_key = 'r_' + localStorage.getItem("fe_user");
        // Set key for PermaGeo
        pFe_user = "p_" + localStorage.getItem("fe_user");
    }
		
    // Rundgang counter
    rg = 0;
    // Kontrollpunkt counter
    nr = 0;
    
    // Rundgang Object
    oRundgang = {};
    
    x = document.getElementById("geolocation");

    

    
		
		
		
		
		function onGeoError(error) {
        
        var d, m, msg;
        
        d = new Date();
        

        //console.log(getTime() + " setGeoData r_key => " + r_key);

        var span_date = '<span>Zeit: ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '</span>';        
        jQuery("#permaCheck").append("<span><b>Error</b></span> "+ span_date + "<br><hr>");

/*
        switch (error.code) {
            case error.PERMISSION_DENIED:
                jQuery("#permaCheck").append("<span><b>Error</b></span> "+ span_date + "<br>User denied the request for Geolocation.<br><hr>");
                break;
            case error.POSITION_UNAVAILABLE:
                jQuery("#permaCheck").append("<span><b>Error</b></span> "+ span_date + "<br>Location information is unavailable..<br><hr>");
                break;
            case error.TIMEOUT:
                jQuery("#permaCheck").append("<span><b>Error</b></span> "+ span_date + "<br>The request to get user location timed out.<br><hr>");
                break;
            case error.UNKNOWN_ERROR:
                jQuery("#permaCheck").append("<span><b>Error</b></span> "+ span_date + "<br>An unknown error occurred.<br><hr>");
                break;
        }
*/		
    //	x.innerHTML = '<p class="event listening">Mobiltelefon nicht lokalisierbar. Bitte erneut dr&uuml;cken</p>';
    }
    
    function onPermGeoDataSuccess(position) {
        
        permCheck = '{ "datetime" : ' + new Date().getTime() + ', "lat" : ' + position.coords.latitude + ', "lng" : ' + position.coords.longitude + ' }, ';
		
        pCString = localStorage.getItem(pFe_user);

        if (pCString == null) {
            pCString = "";
        }
        
        pCString = pCString + permCheck;

        consoleLog('debug', 'permstring =>' + pCString);
        
        var d = new Date();
        //console.log(getTime() + " setGeoData r_key => " + r_key);

        var span_date = '<span>Zeit: ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() +'</span>';        
        
        jQuery("#permaCheck").append("<span><b>Success</b></span> | "+ span_date      + "<br />" +
            'Lat: '          + position.coords.latitude          + ' | ' +
            'Long: '         + position.coords.longitude         + '<br />' +
            'Acc: '          + position.coords.accuracy          + ' | ' +
            'Alt: '          + position.coords.altitude          + ' | ' +
            'Alt Acc: '      + position.coords.altitudeAccuracy  + '<br />' +
            'Heading: '      + position.coords.heading           + '|' +
            'Speed: '        + position.coords.speed             + '<br><hr>'
            );

        localStorage.setItem(pFe_user, pCString);
    } 
    
    var pWatchId, watchId;
    
    function getPCurGeoData() {
        
        var options = {
            enableHighAccuracy: true, 
            timeout: 10000
        };        

        pWatchId = navigator.geolocation.getCurrentPosition(onPermGeoDataSuccess, getPCurGeoError, options);
        
    // timer = window.setTimeout(getPCurGeoData, 300000);
        
    //timer = window.setTimeout(getPCurGeoData, 10000);		
    }
    
    function getPCurGeoError(error) {
        
        var d;
        
        d = new Date();

        var span_date = '<span>Zeit: ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '</span> ';        
        jQuery("#permaCheck").append("<span><b>Permanent Error</b></span> "+ span_date + "<br><hr>");
    }    
    
    // Wachdienst/Rundgang Start
    function onStartSuccess(position) {
        
        clearInterval(manuellRundgang);
        
        //        navigator.geolocation.clearWatch(watchId);

        var d, m, patrol, check, span_text, span_date, json, Rundgang;

        x.innerHTML = '<p class="event received">GPS Signal gefunden...</p>';
				
        consoleLog('debug', 'Current position is:');
        consoleLog('debug', 'Latitude : ' + position.coords.latitude);
        consoleLog('debug', 'Longitude: ' + position.coords.longitude);
        
        d = new Date();
        m = d.getMonth() + 1;
        //console.log(getTime() + " setGeoData r_key => " + r_key);

        span_date = '<span>Zeit: ' + d.getHours() + ':' + d.getMinutes() + ' Datum: ' + d.getDate() + '.' + m + '.' + d.getFullYear() + '</span>';

        // object { "string" : "value", "string" : "value" }
        // array [ "value", "value" ]
        check = '{ "datetime" : ' + new Date().getTime() + ', "lat" : ' + position.coords.latitude + ', "lng" : ' + position.coords.longitude + ' }';
        
        jQuery(".expand").animate({
            left: '100%'
        }, 2000, 'linear', function () {
            jQuery(".expand").removeAttr('style');
        });

        jQuery('#rundgangButtons').attr('src', 'img/buttonsAct.png').delay(1500).queue(function (next) {
            jQuery(this).attr('src', 'img/buttonsRun.png');
            next();
        });
        
        if (nr == 0) {

            /* Start auto geocoding */
            getPCurGeoData();
		
            /* Create new Rundgang */
            Rundgang = {};
            Rundgang.id = rg;
            Rundgang.checkString = [];
            Rundgang.checkString.push(check);
            Rundgang.permString = localStorage.getItem(pFe_user);
            Rundgang.start = new Date().getTime();
            Rundgang.ende = 0;
            
            oRundgang.Wachdienst.push(Rundgang);
            
            consoleLog('debug', 'Rundgang Start');
            consoleLog('debug', oRundgang);
            
            localStorage.setItem(r_key, JSON.stringify(oRundgang));
            
            span_text = '<span><b>Rundgang wurde gestartet</b></span>';
                
            jQuery('.statusBox p:gt(0)').fadeOut(500, function () {
                jQuery('<p class="control">' + span_text + '<br />' + span_date + '<img src="img/mBoxEye.png" /></p>').hide().prependTo(".statusBox").delay(350).slideToggle("slow");
                jQuery(this).remove();
            });
            
            newRundgang(rg);
            
        } else {
            
            /* Load Rundgang from localStorage */
            oRundgang = {};
            oRundgang = JSON.parse(localStorage.getItem(r_key));
            
            /* Update Rundgang */
            oRundgang.Wachdienst[rg].checkString.push(check);
            oRundgang.Wachdienst[rg].permString = localStorage.getItem(pFe_user);
			
            consoleLog('debug', "+ Kontrollpunkt");
            consoleLog('debug', oRundgang);
            
            localStorage.setItem(r_key, JSON.stringify(oRundgang));
            
            span_text = '<span><b>Kontrollpunkt Nr. ' + nr + ' wurde gespeichert</b></span>';
            
            jQuery('.statusBox p:gt(0)').fadeOut(500, function () {
                jQuery('<p class="control">' + span_text + '<br />' + span_date + '<img src="img/mBoxEye.png" /></p>').hide().prependTo(".statusBox").delay(350).slideToggle("slow");
                jQuery(this).remove();
            });
            
            updateRundgang(rg, false);

        }
        nr++;
        
    //x.innerHTML = '<p class="event listening">Latitude: ' + position.coords.latitude + ', Longitude: ' + position.coords.longitude + '</p>';
    }

    // Wachdienst/Rundgang Stop    
    function onStopSuccess(position) {
        
        clearInterval(permanentRundgang);

        var d, m, span_text, span_date, check;

        x.innerHTML = '<p class="event received">GPS Signal gefunden...</p>';
		        
        consoleLog('debug', 'Current position is:');
        consoleLog('debug', 'Latitude : ' + position.coords.latitude);
        consoleLog('debug', 'Longitude: ' + position.coords.longitude);
        
        d = new Date();
        m = d.getMonth() + 1;

        check = '{ "datetime" : ' + new Date().getTime() + ', "lat" : ' + position.coords.latitude + ', "lng" : ' + position.coords.longitude + ' }';

        /* Load Rundgang from localStorage */
        oRundgang = {};
        oRundgang = JSON.parse(localStorage.getItem(r_key));
        
        /* Update Rundgang */
        oRundgang.Wachdienst[rg].checkString.push(check);
        oRundgang.Wachdienst[rg].permString = localStorage.getItem(pFe_user);
        oRundgang.Wachdienst[rg].ende = new Date().getTime();
        consoleLog('debug', "Rundgang Ende");
        consoleLog('debug', oRundgang);
        
        localStorage.setItem(r_key, JSON.stringify(oRundgang));
        
        span_text = '<span><b>Rundgang wurde beendet</b></span>';
        span_date = '<span>Zeit: ' + d.getHours() + ':' + d.getMinutes() + ' Datum: ' + d.getDate() + '.' + m + '.' + d.getFullYear() + '</span>';
        
        jQuery(".expand").animate({
            left: '100%'
        }, 2000, 'linear', function () {
            jQuery(".expand").removeAttr('style');
        });

        jQuery('#rundgangButtons').attr('src', 'img/buttons.png');

        jQuery('.statusBox p:gt(0)').fadeOut(500, function () {
            jQuery('<p class="control">' + span_text + '<br />' + span_date + '<img src="img/mBoxEye.png" /></p>').hide().prependTo(".statusBox").delay(350).slideToggle("slow");
            jQuery(this).remove();
        });
        
        updateRundgang(rg, true);

        //jQuery.delay(1000)('.statusBox p:last').remove();     
        //nr++;

        nr = 0;
        rg++;
        localStorage.setItem(pFe_user, '');
        clearTimeout(timer);
		
    //x.innerHTML = "Latitude: " + position.coords.latitude + ", Longitude: " + position.coords.longitude;
    }

    function newRundgang(rg) {
    
        consoleLog('debug', "Create new Rundgang / Start");
        
        var hmac, d, m, data, startDatetime, url, oRundgang, r_key, checkString, checkpointMan, i;
    
        checkpointMan = '';
        r_key = 'r_' + localStorage.getItem("fe_user");
        
        oRundgang = {};
        oRundgang = JSON.parse(localStorage.getItem(r_key));
        checkString = oRundgang.Wachdienst[rg].checkString;
		
        permString = oRundgang.Wachdienst[rg].permString;
        
        if(permString != undefined){
            permString = permString.slice(0,-2);
        }
    
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
            'tx_mungoswachdienst_request[newRundgang][checkpointAuto]': permString,
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
                    oRundgang.Wachdienst[rg].uid = json.uid;
                    consoleLog('debug', oRundgang);
                
                    localStorage.setItem(r_key, JSON.stringify(oRundgang));
                    
                    consoleLog('debug', "Create new Rundgang / End");
                }
                
            },
            error: function (xOptions, textStatus) {
                consoleLog('debug', "Request failed: " + xOptions + " " + textStatus);
                consoleLog('debug', xOptions);
                consoleLog('debug', "Create new Rundgang / End");
            }
        });
        
    /*
        return jQuery.ajax({
            type: 'POST',
            url: url,
            //async: false,
            data: data,
            dataType: 'jsonp',
            jsonp: 'jsonp_callback',
            statusCode: {
                404: function () {
                    consoleLog('debug', "page not found");
                },
                503: function () {
                    consoleLog('debug', "NetworkError: 503 Service unavailable");
                }
            }
        });
        */
    }
    
    function updateRundgang(rg, isLast) {
    
        consoleLog('debug', "Update Rundgang / Start");
        
        var hmac, d, m, data, startDatetime, url, oRundgang, r_key, checkpointMan, separator, endDatetime, checkString;
    
        checkpointMan = '';
        r_key = 'r_' + localStorage.getItem("fe_user");
        
        oRundgang = {};
        oRundgang = JSON.parse(localStorage.getItem(r_key));
        checkString = oRundgang.Wachdienst[rg].checkString;
        permString = oRundgang.Wachdienst[rg].permString;
        
        if(permString != undefined) {
            permString = permString.slice(0, -2);
        }
		    
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
            'tx_mungoswachdienst_request[rundgang][__identity]': oRundgang.Wachdienst[rg].uid,
            'tx_mungoswachdienst_request[__referrer][extensionName]': "MungosWachdienst",
            'tx_mungoswachdienst_request[__referrer][controllerName]': "Rundgang",
            'tx_mungoswachdienst_request[__referrer][actionName]': "edit",
            'tx_mungoswachdienst_request[rundgang][feUser]': localStorage.getItem("fe_user"),
            'tx_mungoswachdienst_request[rundgang][checkpointMan]': checkpointMan,
            'tx_mungoswachdienst_request[rundgang][checkpointAuto]': permString,
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
                    oRundgang.Wachdienst[rg].uid = json.uid;
                    consoleLog('debug', oRundgang);
                
                    localStorage.setItem(r_key,JSON.stringify(oRundgang));
                    
                    consoleLog('debug', "Update Rundgang / End");
                }
                
            },
            error: function(xOptions, textStatus){
                consoleLog('debug', "Request failed: " + xOptions + " " + textStatus);
                consoleLog('debug', xOptions);
                consoleLog('debug', "Update Rundgang / End");
            }
        });    
    }

    
    
   
    

    
    
    jQuery("#showPermString").on('click', function () {
        var permString = localStorage.getItem(pFe_user);
    });

    
    jQuery("#clearStorage").on('click', function () {
        localStorage.clear();
    });

    if (!localStorage.getItem(r_key)) {
        consoleLog('debug', "localStorage: Rundgang => create");
        //localStorage.setItem(r_key, patrol + check);

        // Wachdienst Array
        oRundgang.Wachdienst = [];
        
    } else {
        consoleLog('debug', "localStorage: Rundgang => load");
        //localStorage.setItem(r_key, patrol + check);

        oRundgang = JSON.parse(localStorage.getItem(r_key));
        
        // Get last Rundgang (Index)
        rg = oRundgang.Wachdienst.length -1;
        consoleLog('debug', "Last index => " + rg);
        
        if(oRundgang.Wachdienst[rg].ende == 0){
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
            
            checkString = oRundgang.Wachdienst[rg].checkString;
            
            // Get Last Checkpoint
            nr = checkString.length -1;
            consoleLog('debug', "Last Kontrollpunkt Nr. => " + nr);
            
            last_check = JSON.parse(oRundgang.Wachdienst[rg].checkString[nr]);
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
            rg++;
        }
    }
    
    var manuellRundgang, permanentRundgang;
    
    jQuery("a#start").on('click', function () {

        x.innerHTML = '<p class="event listening">Suche GPS Signal...</p>';
/*        
        var options = {
            enableHighAccuracy: false, 
            timeout: 10000, 
            maximumAge:120000
        };
*/        
//        getPCurGeoData();
       
        permanentRundgang = setInterval(function() {
            getPCurGeoData()
        }, 5000);
        
        
        manuellRundgang = setInterval(function() {
            startRundgang()
        }, 5000);        
        
     
        

    //consoleLog('debug', "a#start r_key => " + r_key);
        
    /*        
        jQuery('#progress').addClass("fullwidth").delay(3000).queue(function (next) {
            jQuery(this).removeClass("fullwidth");
            next();
        });
        */

    });
    
    function startRundgang(){
        var options = {
            enableHighAccuracy: true, 
            timeout: 10000
        };        
        navigator.geolocation.getCurrentPosition(onStartSuccess, onGeoError, options);
    }

    jQuery("a#stop").on('click', function () {

        x.innerHTML = '<p class="event listening">Suche GPS Signal...</p>';
        navigator.geolocation.getCurrentPosition(onStopSuccess, onGeoError);

    });
});