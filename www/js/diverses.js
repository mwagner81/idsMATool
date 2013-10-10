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