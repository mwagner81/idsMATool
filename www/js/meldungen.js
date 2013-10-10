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
    var m_key;

    if (localStorage.getItem("fe_user")) {
        // Set key for Meldung
        m_key = 'm_' + localStorage.getItem("fe_user");
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