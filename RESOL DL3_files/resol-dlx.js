RESOL = function() {
	
	// ---- DEBUG ----
	
	var debugLog = function(msg) {
//		console.log(msg);
	};
	
	
	// ---- RPC ----
	
	var __rpcAuthToken;
	
	var rpcSend = function(method, params, callBack) {
		var requestData = JSON.stringify({ request: 1, method: method, params: params, authToken: __rpcAuthToken });
		$.get('cgi-bin/DLxWebService', { json: requestData }, function(responseData) {
			callBack(responseData);
		}, 'application/json');
	};
	
	
	// ---- LOGIN ----
	
	var loginPerform = function() {
		var loginForm = $('#contentLogin #loginForm');
		var username = $('#loginUsername', loginForm).val();
		var password = $('#loginPassword', loginForm).val();
		rpcSend('login', { username: username, password: password }, function(data) {
			debugLog(data);
		});
	};
	
	var loginSetup = function() {
		$('#contentLogin #loginLogin').click(function() {
			loginPerform();
		});
	};
	
	
	// ---- LIVE ----
	
	var liveSetup = function() {
		
	};
	
	
	// ---- DOWNLOAD ----
	
	var downloadSetup = function() {
		$('#resol-downloadOptions').accordion();
		var dates = $("#resol-downloadStartDate, #resol-downloadEndDate").datepicker({
			defaultDate: "+1w",
			changeMonth: true,
			numberOfMonths: 3,
			onSelect: function(selectedDate) {
				var option = this.id == "resol-downloadStartDate" ? "minDate" : "maxDate",
					instance = $( this ).data( "datepicker" );
					date = $.datepicker.parseDate(
						instance.settings.dateFormat ||
						$.datepicker._defaults.dateFormat,
						selectedDate, instance.settings );
				dates.not( this ).datepicker( "option", option, date );
			}
		});
		$('#resol-downloadButton').click(function() {
			debugLog(dates);
			var startDate = $('resol-downloadStartDate').datepicker('getDate');
			debugLog(startDate);
		});
	};
	
	
	// ---- NAVIGATION ----
	
	var __navigationCurrentContentId;
	
	var navigationSwitchToContent = function(id) {
		debugLog('navigationSwitchToContent(' + id + ') called');
		
		$('.resol-navigationBar li a').removeClass('resol-selected');
		$('.resol-content > div').hide();

		__navigationCurrentContentId = id;
		
		var node = $('.resol-navigationBar li a#resol-navigation' + id);
		if (node) {
			node.addClass('resol-selected');
		}
		node = $('.resol-content #resol-content' + id);
		if (node) {
			node.show();
		}
	};
	
	var navigationSetup = function() {
		$('.resol-navigationBar li a').click(function(e) {
			var id = e.currentTarget.parentNode.id;
			navigationSwitchToContent(id.replace(/resol-navigationBar/, ""));
		});
		
		$('.resol-sideBar li a').click(function(e) {
			var id = e.currentTarget.parentNode.id;
			navigationSwitchToContent(id.replace(/resol-sideBar/, ""));
		});
	};
	
	$(document).ready(function() {
		debugLog('running');
		
//		navigationSetup();
//		loginSetup();
//		liveSetup();
		downloadSetup();
		
//		navigationSwitchToContent('Login');
	});
	
	
	// ---- THE RETURNED OBJECT ----
	
	return {
		
	};
}();