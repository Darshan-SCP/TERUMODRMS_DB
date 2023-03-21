function GneEventNo(EventPl) {
	for (var i = 0; i < EventPl.length; i++) {
		EventPl[i].EVENT_NO = i + 1;
	}
	return EventPl;
}

function UpdEventNo(maxevt, EventPl) {
	var evtcalc = maxevt;
	for (var i = 0; i < EventPl.length; i++) {
		EventPl[i].EVENT_NO = evtcalc + 1;
		evtcalc = evtcalc + 1;
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
		// break;

	case $.net.http.POST:
		var oProjectPayload = JSON.parse($.request.body.asString());
		var conn = $.hdb.getConnection();
		var Action = $.request.parameters.get("Action");
		var execProcedure;
		var Result;
		if (Action === "Create") {
			try {
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var header = oProjectPayload.Value.HEADER;
				var mat = oProjectPayload.Value.FORECAST;
				var events = GneEventNo(oProjectPayload.Value.EVENTS);
				var SUB_DIV = header[0].SUB_DIV;
				var sales_asso = header[0].SALES_ASSOCIATES;
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_FORECAST');
				Result = execProcedure(SUB_DIV, sales_asso, header, mat, events);
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
		} else if (Action === "Approve") {
			try {
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var header = oProjectPayload.Value.HEADER;
				// var events = GneEventNo(oProjectPayload.Value.EVENTS);
				var FC_NO = header[0].FC_NO;
				var evtno = conn.executeQuery(
					'SELECT MAX("EVENT_NO") as max_evt FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_FORECAST_EVENTS_COMMENTS\" WHERE FC_NO = ?',
					parseInt(FC_NO));
				var events = UpdEventNo(evtno[0].MAX_EVT, oProjectPayload.Value.EVENTS);

				var APRROVER_LEVEL = header[0].APRROVER_LEVEL;
				var APRROVER_ROLE = header[0].APRROVER_ROLE;
				var SUB_DIV = header[0].SUB_DIV;
				var sales_asso = header[0].SALES_ASSOCIATES;
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_FORECAST_APPROVAL');
				Result = execProcedure(FC_NO, SUB_DIV, sales_asso, APRROVER_LEVEL, APRROVER_ROLE, header, events);
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

		} else if (Action === "SentBack") {
			try {
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var header = oProjectPayload.Value.HEADER;
				// var events = GneEventNo(oProjectPayload.Value.EVENTS);
				var FC_NO = header[0].FC_NO;
				var evtno = conn.executeQuery(
					'SELECT MAX("EVENT_NO") as max_evt FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_FORECAST_EVENTS_COMMENTS\" WHERE FC_NO = ?',
					parseInt(FC_NO));
				var events = UpdEventNo(evtno[0].MAX_EVT, oProjectPayload.Value.EVENTS);
				var APRROVER_LEVEL = header[0].APRROVER_LEVEL;
				var APRROVER_ROLE = header[0].APRROVER_ROLE;
				var SUB_DIV = header[0].SUB_DIV;
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_FORECAST_SENDBACK');
				Result = execProcedure(FC_NO, SUB_DIV, APRROVER_LEVEL, APRROVER_ROLE, header, events);
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

		} else if (Action === "resent") {
			try {
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var header = oProjectPayload.Value.HEADER;
				var items = oProjectPayload.Value.FORECAST;
				// var events = GneEventNo(oProjectPayload.Value.EVENTS);
				var FC_NO = header[0].FC_NO;
				var evtno = conn.executeQuery(
					'SELECT MAX("EVENT_NO") as max_evt FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_FORECAST_EVENTS_COMMENTS\" WHERE FC_NO = ?',
					parseInt(FC_NO));
				var events = UpdEventNo(evtno[0].MAX_EVT, oProjectPayload.Value.EVENTS);
				conn.executeUpdate('DELETE FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_FORECAST\" WHERE FC_NO = ?', parseInt(
					FC_NO));
				conn.commit();
				var SUB_DIV = header[0].SUB_DIV;
				var sales_asso = header[0].SALES_ASSOCIATES;
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_FORECAST_RESEND');
				Result = execProcedure(FC_NO, SUB_DIV, sales_asso, items, events);
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