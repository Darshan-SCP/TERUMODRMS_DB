//New Req FileID and Event NO////
function GneFileID(ItemFLD) {
	for (var i = 0; i < ItemFLD.length; i++) {
		ItemFLD[i].FILE_ID = i + 1;
	}
	return ItemFLD;
}
function UpdFileID(maxfid,ItemFLD) {
	var fidcalc = maxfid;
	for (var i = 0; i < ItemFLD.length; i++) {
		ItemFLD[i].FILE_ID = fidcalc + 1;
		fidcalc = fidcalc + 1 ;
	}
	return ItemFLD;
}
function GneEventNo(EventPl) {
	for (var i = 0; i < EventPl.length; i++) {
		EventPl[i].EVENT_NO = i + 1;
	}
	return EventPl;
}
function UpdEventNo(maxevt,EventPl) {
	var evtcalc = maxevt;
	for (var i = 0; i < EventPl.length; i++) {
		EventPl[i].EVENT_NO = evtcalc + 1;
		evtcalc = evtcalc + 1 ;
	}
	return EventPl;
}
try {
	switch ($.request.method) {
		//Handle  GET 
	case $.net.http.GET:
	        var sMessage = "GET Called";
			$.response.setBody(JSON.stringify(sMessage));
			break;
		break;

	case $.net.http.POST:
		var oProjectPayload = JSON.parse($.request.body.asString());
		var conn = $.hdb.getConnection();
		var Action = $.request.parameters.get("Action");
		var execProcedure;
		var Result;
		///////////////////Payment REQUEST CREATION//////////////////////
		if (Action === "Create") {
			try {
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_MISDATA');
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
			    var MisData = oProjectPayload.Value.MISDATA;
			    var FLAG = "C";
		    	Result = execProcedure(MisData,FLAG);
				$.response.setBody(JSON.stringify(Result));
				// $.response.setBody(JSON.stringify(Result));
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
		}
		else if (Action === "Edit") {

			try {
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_MISDATA');
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
			    var MisData = oProjectPayload.Value.MISDATA;
			    var FLAG = 'E';
			    var FIN_YEAR = MisData[0].FINANCIAL_YEAR;
				//Delete Previous Items from Payments
				conn.executeUpdate('DELETE FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_MIS_DATA\" WHERE FINANCIAL_YEAR = ?', FIN_YEAR);
				conn.commit();
				//
		    	Result = execProcedure(MisData,FLAG);
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
		}
		else {
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