function checkDistTarget(distTarget) {
	var con = $.hdb.getConnection();
	var arr = [];
	for (var i = 0; i < distTarget.length; i++) {
		var sQuery = 'SELECT * FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_DISTRIBUTOR_TARGET\"';
		sQuery += 'WHERE YEAR=? AND CUSTOMER=? AND GPC_NAME=?';
		var sResult = con.executeQuery(sQuery, distTarget[i].YEAR, distTarget[i].CUSTOMER, distTarget[i].GPC_NAME);
		arr.push(...sResult);
	}
	return arr;
}

function checkSalesTarget(salesTarget) {
	var con = $.hdb.getConnection();
	var arr = [];
	for (var i = 0; i < salesTarget.length; i++) {
		var sQuery = 'SELECT * FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_SALES_ASSOCIATES_TARGET\"';
		sQuery += 'WHERE YEAR=? AND SALES_ASSOCIATES=? AND GPC_NAME=?';
		var sResult = con.executeQuery(sQuery, salesTarget[i].YEAR, salesTarget[i].SALES_ASSOCIATES, salesTarget[i].GPC_NAME);
		arr.push(...sResult);
	}
	return arr;
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
		if (Action === "CreateSalesTarget") {
			try {
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var salesTarget = oProjectPayload.Value.CREATESALESTARGET;
				var checkSalesTarget = checkSalesTarget(salesTarget);
				if (checkSalesTarget.length > 0) {
					for (var i = 0; i < checkSalesTarget.length; i++) {
						conn.executeUpdate(
							'DELETE FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_SALES_ASSOCIATES_TARGET\" WHERE YEAR=? AND SALES_ASSOCIATES=? AND GPC_NAME=?',
							checkSalesTarget[i].YEAR, checkSalesTarget[i].SALES_ASSOCIATES, checkSalesTarget[i].GPC_NAME);
						conn.commit();
					}
				}
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_SALES_ASSOCIATES');
				Result = execProcedure(salesTarget);
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
		} else if (Action === "CreateDistTarget") {
			try {
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var distTarget = oProjectPayload.Value.CREATEDISTTARGET;
				var checkTarget = checkDistTarget(distTarget);
				if (checkTarget.length > 0) {
					for (var i = 0; i < checkTarget.length; i++) {
						conn.executeUpdate(
							'DELETE FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_DISTRIBUTOR_TARGET\" WHERE YEAR=? AND CUSTOMER=? AND GPC_NAME=?',
							checkTarget[i].YEAR, checkTarget[i].CUSTOMER, checkTarget[i].GPC_NAME);
						conn.commit();
					}
				}
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_DISTRIBUTOR_TARGET');
				Result = execProcedure(distTarget);
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