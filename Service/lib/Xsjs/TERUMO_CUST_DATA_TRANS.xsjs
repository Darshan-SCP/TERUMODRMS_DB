try {
	switch ($.request.method) {
		//Handle  GET 
	case $.net.http.GET:
		var sMessage = "GET Called";
		$.response.setBody(JSON.stringify(sMessage));
		break;
		// break;

	case $.net.http.POST:
		var oProjectPayload = JSON.parse($.request.body.asString());
		var conn = $.hdb.getConnection();
		var Action = "Customer";
		var execProcedure;
		var Result;
		if (Action === "Customer") {
			try {
				// var dataobj = JSON.stringify(oProjectPayload);
				// var oPayload = dataobj.substring(1, dataobj.length - 1);
				// oProjectPayload = JSON.parse(oPayload);
				var cust = oProjectPayload.Value.CUSTOMER;
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_CUST_CREATE');
				Result = execProcedure(cust);
				$.response.setBody(JSON.stringify(Result));
				$.response.contentType = "application/json";
				$.response.status = 200;
				$.response.contentType = "text/plain";
			} catch (e) {
				conn.rollback();
				$.response.setBody(e.message);
				$.response.contentType = "text/plain";
				$.response.status = 400;
			} finally {
				conn.close();
			}
		} else {
			$.response.setBody("Please select correct action " + Action);
			$.response.status = 400;
		}
		break;
	default:
		break;
	}
} catch (err) {
	$.response.setBody("Error occured in service: " + err.toString());
}