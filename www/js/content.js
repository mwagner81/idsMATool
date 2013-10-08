// Set key for userData
u_key = 'u_' + localStorage.getItem('fe_user');

// Load userData
var uData = {};
uData = JSON.parse(localStorage.getItem(u_key));

jQuery("#user_name").html(uData.user_name);