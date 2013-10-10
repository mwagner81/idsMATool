/*jslint node: true */
// "use strict";

// Wait for device API libraries to load
//
//document.addEventListener("deviceready", deviceIsReady, false);

// device APIs are available
//

/*
window.onload = function () {
    var element = document.getElementById('deviceTest');
    element.innerHTML = 'Device Name: '     + device.name     + '<br />' +
                        'Device Cordova: '  + device.cordova  + '<br />' +
                        'Device Platform: ' + device.platform + '<br />' +
                        'Device UUID: '     + device.uuid     + '<br />' +
                        'Device Model: '    + device.model    + '<br />' +
                        'Device Version: '  + device.version  + '<br />';

    // onSuccess Callback
    //
    var onSuccess = function (position) {
		var geo = document.getElementById('geoTest');		
        geo.innerHTML += 'Latitude: '          + position.coords.latitude          + '<br />' +
                              'Longitude: '         + position.coords.longitude         + '<br />' +
                              'Altitude: '          + position.coords.altitude          + '<br />' +
                              'Accuracy: '          + position.coords.accuracy          + '<br />' +
                              'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '<br />' +
                              'Heading: '           + position.coords.heading           + '<br />' +
                              'Speed: '             + position.coords.speed             + '<br />' +
                              'Timestamp: '         + position.timestamp                + '<br />';
    };

    // onError Callback
    //
    var onError = function() {
        alert('onError!');
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
}
*/

document.addEventListener("online",  function(){
    document.getElementById('onlineTest').innerHTML = "<br /><br /><span style='font-weight:bold;color:green'>Online</span>";
}, false);


document.addEventListener("offline",  function(){
    document.getElementById('onlineTest').innerHTML = "<br /><br /><span style='font-weight:bold;color:red'>Offline</span>";
}, false);

document.addEventListener("deviceready", function(){
    document.getElementById('readyTest').innerHTML = "<br /><br /><span style='font-weight:bold;color:green'>deviceready</span>";

    var element = document.getElementById('deviceTest');
    element.innerHTML = 'Device Name: '     + device.name     + '<br />' +
    'Device Cordova: '  + device.cordova  + '<br />' +
    'Device Platform: ' + device.platform + '<br />' +
    'Device UUID: '     + device.uuid     + '<br />' +
    'Device Model: '    + device.model    + '<br />' +
    'Device Version: '  + device.version  + '<br />';    
}, false);


function getLogTime() {
    
    var d, time;
    d = new Date();
    time = d.getHours() + ':' + d.getMinutes() + ':' +  d.getSeconds() + ':' + d.getMilliseconds();
    
    return time;
}


jQuery(document).ready(function () {
    
    /* GLOBAL VARS */
    var u_key, r_key, pFe_user, pCString, nr, rg, oRundgang, r_uid, m_key, x, permCheck, debug, timer;

    // Options for Geocoding
    //    var gOptions = {
    //        enableHighAccuracy: true,
    //        timeout: 5000,
    //        maximumAge: 0
    //    };

    if (localStorage.getItem("fe_user")) {
        // Set key for userData
        u_key = 'u_' + localStorage.getItem("fe_user");
        // Set key for Rundgang
        r_key = 'r_' + localStorage.getItem("fe_user");
        // Set key for PermaGeo
        pFe_user = "p_" + localStorage.getItem("fe_user");
        // Set key for Meldung
        m_key = 'm_' + localStorage.getItem("fe_user");
    }
		
    // debug = true for console output
    debug = false;
    
    if (typeof (console) != 'undefined') {
        debug = true;
    }
    
    // Rundgang counter
    rg = 0;
    // Kontrollpunkt counter
    nr = 0;
    
    // Rundgang Object
    oRundgang = {};
    
    x = document.getElementById("geolocation");

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
            timeout: 10000, 
            maximumAge:120000
        };        

        pWatchId = navigator.geolocation.watchPosition(onPermGeoDataSuccess, getPCurGeoError, options);
        
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

    function newMeldung(feUser,mString){
        
        alert("newMeldung: "+mString);
    
        consoleLog('debug', "Create new Stoerungsmeldung / Start");
        
        var hmac, d, m, data, mDateTime, mPosition, mMeldung, url, request, jqxhr, uid, jmString, mPics, pData, mAddition;
        var m_key = 'm_' + localStorage.getItem("fe_user");
            
        //      hmac = 'a:3:{s:19:"newStoerungsmeldung";a:5:{s:6:"feUser";i:1;s:4:"type";i:1;s:8:"dateTime";i:1;s:7:"geoData";i:1;s:6:"images";i:1;}s:6:"action";i:1;s:10:"controller";i:1;}478da69243a325065f105cd22b43fcbc0c45a50b';
        hmac = 'a:3:{s:19:"newStoerungsmeldung";a:6:{s:6:"feUser";i:1;s:4:"type";i:1;s:8:"addition";i:1;s:8:"dateTime";i:1;s:7:"geoData";i:1;s:6:"images";i:1;}s:6:"action";i:1;s:10:"controller";i:1;}3ddd27c6a2cbeafbcbcffd18b4458ff35854b91b';
        
        //mString = '{ "datetime" : "' + mDateTime + '", "position" : "' + mPos + '", "meldung" : "' + mMeldung + '" }';
        
        jmString = JSON.parse(mString);
        
        mDateTime = jmString[0]["datetime"];
        mPosition = jmString[0]["position"];
        mMeldung = jmString[0].meldung;
        mPics = jmString[0].pics;
        mAddition = jmString[0].addition;
        
    
        url = "http://ma.ids-services.at/index.php";
    
        data = {
            'id': 229,
            'no_cache': 1,
            'type': 97,
            'tx_mungosstoerung_mungosstoerung[action]': "create",
            'tx_mungosstoerung_mungosstoerung[controller]': "Stoerungsmeldung",
            'tx_mungosstoerung_mungosstoerung[__referrer][extensionName]': "MungosStoerung",
            'tx_mungosstoerung_mungosstoerung[__referrer][controllerName]': "Stoerungsmeldung",
            'tx_mungosstoerung_mungosstoerung[__referrer][actionName]': "new",
            'tx_mungosstoerung_mungosstoerung[newStoerungsmeldung][feUser]': feUser,
            'tx_mungosstoerung_mungosstoerung[newStoerungsmeldung][dateTime]': mDateTime,
            'tx_mungosstoerung_mungosstoerung[newStoerungsmeldung][geoData]': mPosition,
            'tx_mungosstoerung_mungosstoerung[newStoerungsmeldung][type]': mMeldung,   
            'tx_mungosstoerung_mungosstoerung[newStoerungsmeldung][images]': mPics, 
            'tx_mungosstoerung_mungosstoerung[newStoerungsmeldung][addition]': mAddition, 
            'tx_mungosstoerung_mungosstoerung[__hmac]': hmac
        };
    
        $.jsonp({
            url: url,
            data: data,
            callbackParameter: 'jsonp_callback',
            success: function() { 
                alert("Meldung erfolgreich");
                localStorage.removeItem(m_key);
                localStorage.removeItem("pics");                    
            },
            error: function(xOptions, textStatus){
                alert("Meldung fehlgeschlagen: " + xOptions + " " + textStatus);
            }
        });               
        
        return false;
        
    }
    
    jQuery("#loginForm").submit(function () {

        var error, form, url, data, username, password, request, u_key;
        
        jQuery("#loginError").html('');
        
        error = false;
        url = "http://ma.ids-services.at/index.php";
        
        /* get some values from elements on the page: */
        form = jQuery(this);
        username = form.find('input[name="username"]').val();
        password = form.find('input[name="password"]').val();
	
        data = {
            'id': 237,
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
		
        /*
		request = jQuery.ajax({
			type: 'POST',
			url: url,
			data: data,
			dataType: 'json'
		});
		*/

        request = jQuery.ajax({
            type: 'POST',
            url: url,
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
                jQuery('#loginError').append("<p>Benutzername u.o. Passwort ist falsch</p>");
            } else {
                //$('#loginError').append("<p>Sie sind angemeldet!</p>");
                
                localStorage.setItem('fe_user', result.user_uid);
                
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
        
        var error, url, data, username, password, request, uData;
        
        error = false;
        url = "http://ma.ids-services.at/index.php";
        
        // Load userData
        uData = {};
        uData = JSON.parse(localStorage.getItem(u_key));
        //consoleLog('debug', uData);
        
        data = {
            'id': 237,
            'no_cache': 1,
            'type': 98,
            'tx_idsapplogin_pi1[username]': uData.username,
            'tx_idsapplogin_pi1[password]': uData.password,
            'tx_idsapplogin_pi1[logintype]': "logout"
        };
        //consoleLog('debug', data);
        
        request = jQuery.ajax({
            type: 'POST',
            url: url,
            data: data,
            dataType: 'jsonp',
            jsonp: 'jsonp_callback'
        });

        request.done(function (result) {

            if (result.logged_in == undefined) {
                return false;
            }
					
            if (result.logged_in == false) {
                uData.logged_in = result.logged_in;
                
                // Set userData
                localStorage.setItem(u_key, JSON.stringify(uData));
                window.location.replace('index.html');
            }
        });

        request.fail(function (jqXHR, textStatus) {
            jQuery('#loginError').append("<p>Request failed: " + textStatus + "</p>");
        });
		
        return false;
    });
    
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
    
    jQuery("a#start").on('click', function () {

        x.innerHTML = '<p class="event listening">Suche GPS Signal...</p>';
        
        var options = {
            enableHighAccuracy: false, 
            timeout: 10000, 
            maximumAge:120000
        };
        
        getPCurGeoData();
        
    // watchId = navigator.geolocation.watchPosition(onStartSuccess, onGeoError, options);
        

    //consoleLog('debug', "a#start r_key => " + r_key);
        
    /*        
        jQuery('#progress').addClass("fullwidth").delay(3000).queue(function (next) {
            jQuery(this).removeClass("fullwidth");
            next();
        });
        */

    });

    jQuery("a#stop").on('click', function () {

        x.innerHTML = '<p class="event listening">Suche GPS Signal...</p>';
        navigator.geolocation.getCurrentPosition(onStopSuccess, onGeoError);

    });
    
    // set global Variables
    var mMeldung, mAddition;      
    
    jQuery(".meldungButton, .meldungButtonPic, .lF, .uE").on('click', function () {
        
        if(jQuery(this).hasClass("meldungButtonPic")) {
            mMeldung = "Vandalismus";
        } else if(jQuery(this).hasClass("lF")) {
            mMeldung = "Lost & Found";
            mAddition = "ÖBB "+jQuery(".meRadio:checked").val();
            
        } else if(jQuery(this).hasClass("uE")) {
            mMeldung = "Unangemeldete Einstiegshilfe";
            
            mAddition = +jQuery("#uEzn").val()+";"+jQuery("#uEAz").val()+";";
            
            jQuery(".meCheck").each(function(){
                if(jQuery(this).prop('checked')) {
                    mAddition = mAddition+jQuery(this).val()+", ";
                }
            })
            
        } else {
            mMeldung = jQuery(this).find("span.meldung").text();
        }
        
        
        // opens the confirm dialog
        jQuery.mobile.changePage("#confirmDialog", {
            transition: "slidedown", 
            changeHash: false
        });
            
        // writes the text of the current meldung in the confirm box
        jQuery(".confContent").find("h1").text("Möchten Sie die Meldung \""+mMeldung+"\" abschicken?");     
        
    });
         
    
    jQuery(".mConfirm").on('click',function () {
        
        var mDateTime, mString, position, mPos, mPics;        
        
        navigator.geolocation.getCurrentPosition(saveLocalMeldung, onGeoError);   
        
        // set Meldungsstring in Localstorage    
        function saveLocalMeldung(position){

            d = new Date();
            m = d.getMonth() + 1;

            mDateTime = d.getHours() + ':' + d.getMinutes() + ':' +  d.getSeconds() + ' ' + d.getDate() + '-' + m + '-' + d.getFullYear();                
            mPos = position.coords.latitude + "," + position.coords.longitude;
            mPics = localStorage.getItem("pics");

            mString = '[{ "datetime" : "' + mDateTime + '", "position" : "' + mPos + '", "meldung" : "' + mMeldung + '", "pics" : "' + mPics + '", "addition" : "' + mAddition + '" }]';

            localStorage.setItem(m_key, mString);    
            
            saveMeldung();
        }  
        
        function saveMeldung() {
                
            alert("saveMeldung: "+localStorage.getItem(m_key));    
                
            uploadFiles();

            // Set key for Meldung
            m_key = 'm_' + localStorage.getItem("fe_user");   

            newMeldung(localStorage.getItem("fe_user"),localStorage.getItem(m_key));

            jQuery(".meForm").each(function(){
                jQuery(this).slideUp("fast").siblings("a.meldungButtonD").find("img").attr('src', 'img/meldungButtonPlus.png');
            });
        }
    });
    
    jQuery(".mBreak").on('click', function () {
        m_key = 'm_' + localStorage.getItem("fe_user"); 
        
        localStorage.removeItem(m_key);
        localStorage.removeItem("pics");
        
        jQuery(".meForm").slideUp("fast").siblings("a.meldungButtonD").find("img").attr('src', 'img/meldungButtonPlus.png');    
        
    });
        
    jQuery("#vandalism").on('click', function () {
        jQuery("#vandalismCamera").slideToggle("fast");
        jQuery("#lostFound").slideUp("fast");
        jQuery("#uaEntryHelp").slideUp("fast");
        
        jQuery("#vPlus2").attr('src', 'img/meldungButtonPlus.png');
        jQuery("#vPlus3").attr('src', 'img/meldungButtonPlus.png');
        
        jQuery("#vPlus").attr('src', (
            jQuery("#vPlus").attr('src') == 'img/meldungButtonMinus.png'
            ? 'img/meldungButtonPlus.png'
            : 'img/meldungButtonMinus.png'
            ));
    });

    jQuery("#meLf").on('click', function () {
        jQuery("#lostFound").slideToggle("fast");
        jQuery("#vandalismCamera").slideUp("fast");
        jQuery("#uaEntryHelp").slideUp("fast");
        
        jQuery("#vPlus").attr('src', 'img/meldungButtonPlus.png');
        jQuery("#vPlus3").attr('src', 'img/meldungButtonPlus.png');
        
        jQuery("#vPlus2").attr('src', (
            jQuery("#vPlus2").attr('src') == 'img/meldungButtonMinus.png'
            ? 'img/meldungButtonPlus.png'
            : 'img/meldungButtonMinus.png'
            ));
    });

    jQuery("#meUe").on('click', function () {
        jQuery("#uaEntryHelp").slideToggle("fast");
        jQuery("#lostFound").slideUp("fast");
        jQuery("#vandalismCamera").slideUp("fast");
        
        jQuery("#vPlus").attr('src', 'img/meldungButtonPlus.png');
        jQuery("#vPlus2").attr('src', 'img/meldungButtonPlus.png');
        
        jQuery("#vPlus3").attr('src', (
            jQuery("#vPlus3").attr('src') == 'img/meldungButtonMinus.png'
            ? 'img/meldungButtonPlus.png'
            : 'img/meldungButtonMinus.png'
            ));
    });
});


jQuery("#shlc").click(function(){
    var m_key = 'm_' + localStorage.getItem("fe_user");
    alert("Localstorage: "+localStorage.getItem(m_key));
});