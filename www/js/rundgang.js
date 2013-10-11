jQuery(document).ready(function () {

	var rKey, rWatchId, rInterval, x;
	
	x = document.getElementById("geolocation");
	rKey = 0;
	
	jQuery("a#start").on('click', function () {
		
		x.innerHTML = '<p class="event listening">Suche GPS Signal...</p>';
		
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
		
		if (!rKey) {			
			rKey = 'r_' + localStorage.getItem("fe_user");		
			rInterval = setInterval(function() {
						getCurGeoData()
				}, 5000);
		} else {
			clearInterval(rInterval);
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
		
		x.innerHTML = '<p class="event received">GPS Signal gefunden...</p>';
		
		geoStrg = '{ "datetime" : ' + new Date().getTime() + ', "status" : "ok", "lat" : ' + position.coords.latitude + ', "lng" : ' + position.coords.longitude + ', "acc" : ' + position.coords.accuracy + ' }, ';
		
		lsGeoString = localStorage.getItem(rKey);

		if (lsGeoString == null) {
				lsGeoString = "";
		}
		
		lsGeoString = lsGeoString + geoStrg;

		consoleLog('debug', 'ls =>' + localStorage.getItem(rKey) + geoStrg);

		localStorage.setItem(rKey, lsGeoString);
	}
	
	function onGeoDataError(error) {
		
		geoStrg = '{ "datetime" : ' + new Date().getTime() + ', "status" : "' + error.code + '" }, ';
		
		lsGeoString = localStorage.getItem(rKey);

		if (lsGeoString == null) {
				lsGeoString = "";
		}
		
		lsGeoString = lsGeoString + geoStrg;

		consoleLog('debug', 'ls =>' + localStorage.getItem(rKey) + geoStrg);

		localStorage.setItem(rKey, lsGeoString);
	}
		
		
		
		
		
		
		
		
});