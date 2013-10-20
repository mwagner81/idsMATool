document.addEventListener("online",  function(){
    //document.getElementById('onlineTest').innerHTML = "<br /><br /><span style='font-weight:bold;color:green'>Online</span>";
}, false);

document.addEventListener("offline",  function(){
    //document.getElementById('onlineTest').innerHTML = "<br /><br /><span style='font-weight:bold;color:red'>Offline</span>";
}, false);

document.addEventListener("deviceready", function(){
    //document.getElementById('readyTest').innerHTML = "<br /><br /><span style='font-weight:bold;color:green'>deviceready</span>";

    /*var element = document.getElementById('deviceTest');
    element.innerHTML = 'Device Name: '     + device.name     + '<br />' +
    'Device Cordova: '  + device.cordova  + '<br />' +
    'Device Platform: ' + device.platform + '<br />' +
    'Device UUID: '     + device.uuid     + '<br />' +
    'Device Model: '    + device.model    + '<br />' +
    'Device Version: '  + device.version  + '<br />';   */ 
}, false);

function getLogTime() {
    
    var d, time;
    d = new Date();
    time = d.getHours() + ':' + d.getMinutes() + ':' +  d.getSeconds() + ':' + d.getMilliseconds();
    
    return time;
}

/* GLOBAL VARS */
var u_key, timer, debug;
			
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

		if (localStorage.getItem("fe_user")) {
			// Set key for userData
			u_key = 'u_' + localStorage.getItem("fe_user");
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
		
});