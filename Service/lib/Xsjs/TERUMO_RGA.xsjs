$.response.contentType = "application/json";
$.response.status = 200;
$.response.contentType = "text/plain";

function samplePayloadCreate() {
	var payload = {
		"VALUE": {
			"BU_CODE": "1",
			"BU_SUB_CODE": 'TIS Cardio',
			"DISTRIBUTOR_REASON": "Damaged products",
			"USER_ID": "test.dist1@terumo.co.in",
			"USER_NAME": "test.dist1@terumo.co.in",
			"USER_ROLE": "DIST",
			"ITEMS": [{
				"ITEM_CODE": "ITEM01",
				"BATCH": "B001",
				"EXPIRY_DATE": "2021-02-28T10:10:10",
				"SALEABLE": "Y",
				"INVOICE_NO": 10001,
				"INVOICE_DATE": "2021-02-20T10:10:10",
				"INVOICE_QUANTITY": 10,
				"PRICE": 20,
				"EXTENDED": 25,
				"RETURN_QUANTITY": 2
			}, {
				"ITEM_CODE": "ITEM02",
				"BATCH": "B001",
				"EXPIRY_DATE": "2021-02-28T10:10:10",
				"SALEABLE": "Y",
				"INVOICE_NO": 10001,
				"INVOICE_DATE": "2021-02-20T10:10:10",
				"INVOICE_QUANTITY": 20,
				"PRICE": 10,
				"EXTENDED": 0,
				"RETURN_QUANTITY": 5
			}]
		}
	};

	return payload;
}

function samplePayloadUpdateStatus() {
	var payload = {
		"VALUE": {
			"RGA_NO": 8000000018,
			"BU_CODE": "1",
			"USER_ID": "kaustubh.d@intellectbizware.com",
			"APPROVER_LEVEL": 1,
			"SAP_RETURN_ORDER": ""
		}
	};

	return payload;
}

function getItemNoArr(itemArr) {
	for (var i = 0; i < itemArr.length; i++) {
		itemArr[i].RGA_NO = 0;
		itemArr[i].RGA_ITEM_NO = i + 1;
	}

	return itemArr;
}

function getEventArrForST(oPayloadValue) {
	var eventArr = [{
		"RGA_NO": 0,
		"EVENT_NO": 0,
		"USER_ID": oPayloadValue.USER_ID,
		"USER_NAME": oPayloadValue.USER_NAME,
		"USER_ROLE": oPayloadValue.USER_ROLE
	}];

	return eventArr;
}

function getUserNameAndRole(oPayloadValue, CONN) {
	var conn = CONN;
	var sQuery =
		'SELECT  \"NAME\",	\"USER_ROLE\" FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_USER_MASTER\" WHERE USER_ID = ?';
	var aResult = conn.executeQuery(sQuery, oPayloadValue.USER_ID);

	if (aResult.length > 0) {
		var resultObj = aResult[0];


  
		var eventArr = [{
			"RGA_NO": 0,
			"EVENT_NO": 0,
			"USER_ID": oPayloadValue.USER_ID,
			"USER_NAME": resultObj.NAME,
			"USER_ROLE": resultObj.USER_ROLE,
			"COMMENT": oPayloadValue.COMMENT
		}];
	} else {
		throw "User does not exists";
	}

	return eventArr;
}

function checkUserDetails(RGA_NO, sAPPROVER_LEVEL, sUSER_ID, CONN) {
	var conn = CONN;
	var sQuery =
		'SELECT  \"APPROVER_LEVEL\", \"NEXT_APPROVER\", \"STATUS\" FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_RGA_HEADER\" WHERE RGA_NO = ?'
	var aResult = conn.executeQuery(sQuery, RGA_NO);

	if (aResult.length > 0) {
		var resultObj = aResult[0];
		// if (sUSER_ID !== resultObj.NEXT_APPROVER) {
		// 	throw "Incorrect Approver";
		// } else 
		if (sAPPROVER_LEVEL !== resultObj.APPROVER_LEVEL) {
			throw "Incorrect Approval Level";
		} 
		
		// else if (resultObj.STATUS !== 6) {
		// 	throw "RGA Cannot be Approved";
		// } else 
		
	} else {
		throw "RGA does not exists";
	}

	return true;
}

function responseInfo(setBody, contentType, status) {
	if (setBody.message !== undefined) {
		$.response.setBody(setBody.message);
	} else {
		$.response.setBody(setBody);
	}
	$.response.contentType = contentType;
	$.response.status = status;
}

//Implementation of POST call
function fnHandlePost() {
	var sAction = $.request.parameters.get('ACTION');
	var oPayload = JSON.parse($.request.body.asString());

	// var sAction = "CREATE"; //Test Data
	// var sAction = "APPROVE"; //Test Data

	// var oPayload = samplePayloadCreate(); //Test Data
	// var oPayload = samplePayloadUpdateStatus(); //Test Data

	var conn, execProcedure, Result;

	if (sAction === "CREATE") {
		conn = $.hdb.getConnection();

		try {
			execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_RGA_CREATE');
			var sUserId = oPayload.VALUE.USER_ID;
			var sBuCode = oPayload.VALUE.BU_CODE;
			var sSubBuCode = oPayload.VALUE.BU_SUB_CODE;
			var sDIST_REASON = oPayload.VALUE.DISTRIBUTOR_REASON;
			var aItemObj = getItemNoArr(oPayload.VALUE.ITEMS);
			var aEventObj = getEventArrForST(oPayload.VALUE);

			Result = execProcedure(sUserId, sBuCode, sSubBuCode, sDIST_REASON, aItemObj, aEventObj);

			responseInfo(JSON.stringify(Result.OUT_SUCCESS), "text/plain", 200);
		} catch (err) {
			conn.rollback();
			responseInfo(err, "text/plain", 400);
		} finally {
			conn.close();
		}

	} else if (sAction === "APPROVE") {
		conn = $.hdb.getConnection();

		try {

			execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_RGA_APPROVE');
			var iRgaNo = oPayload.VALUE.RGA_NO;
			var sBuCode = oPayload.VALUE.BU_CODE;
			var sSubBuCode = oPayload.VALUE.BU_SUB_CODE;
			var sUserId = oPayload.VALUE.USER_ID;
			var sLevel = oPayload.VALUE.APPROVER_LEVEL;
			var sRole = oPayload.VALUE.APPROVER_ROLE;
			var sSAPReturnOrder = oPayload.VALUE.SAP_RETURN_ORDER;
			var sApprType = oPayload.VALUE.APRROVE_TYPE;
			var aItemObj = getItemNoArr(oPayload.VALUE.ITEMS);

			if (checkUserDetails(iRgaNo, sLevel, sUserId, conn)) {
				var aEventObj = getUserNameAndRole(oPayload.VALUE, conn);

				Result = execProcedure(iRgaNo, sBuCode, sSubBuCode, sUserId, sLevel, sRole, sSAPReturnOrder, aItemObj, aEventObj, sApprType);
				responseInfo(JSON.stringify(Result.OUT_SUCCESS), "text/plain", 200);
				// responseInfo(JSON.stringify(sRole), "text/plain", 200);
			}
		} catch (err) {
			conn.rollback();
			responseInfo(err, "text/plain", 400);
		} finally {
			conn.close();
		}

	} else if (sAction === "SENDBACK") {
		conn = $.hdb.getConnection();

		try {
			execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_RGA_SENDBACK');
			var iRgaNo = oPayload.VALUE.RGA_NO;
			var sBuCode = oPayload.VALUE.BU_CODE;
			var sSubBuCode = oPayload.VALUE.BU_SUB_CODE;
			var sUserId = oPayload.VALUE.USER_ID;
			var sLevel = oPayload.VALUE.APPROVER_LEVEL;
			var sRole = oPayload.VALUE.APPROVER_ROLE;

			if (checkUserDetails(iRgaNo, sLevel, sUserId, conn)) {
				var aEventObj = getUserNameAndRole(oPayload.VALUE, conn);

				Result = execProcedure(iRgaNo, sBuCode, sSubBuCode, sUserId, sRole, aEventObj);
				responseInfo(JSON.stringify(Result.OUT_SUCCESS), "text/plain", 200);
			}
		} catch (err) {
			conn.rollback();
			responseInfo(err, "text/plain", 400);
		} finally {
			conn.close();
		}
	} else if (sAction === "RESEND") {
		conn = $.hdb.getConnection();

		try {
			execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_RGA_RESEND');
			var iRgaNo = oPayload.VALUE.RGA_NO;
			var sBuCode = oPayload.VALUE.BU_CODE;
			var sSubBuCode = oPayload.VALUE.BU_SUB_CODE;
			var sUserId = oPayload.VALUE.USER_ID;
			var sLevel = oPayload.VALUE.APPROVER_LEVEL;
			var sRole = oPayload.VALUE.APPROVER_ROLE;
			var sDIST_REASON = oPayload.VALUE.COMMENT;
			var aItemObj = getItemNoArr(oPayload.VALUE.ITEMS);

			if (checkUserDetails(iRgaNo, sLevel, sUserId, conn)) {
				var aEventObj = getUserNameAndRole(oPayload.VALUE, conn);

				Result = execProcedure(iRgaNo, sBuCode, sSubBuCode, sDIST_REASON, sUserId, sRole, aItemObj, aEventObj);
				responseInfo(JSON.stringify(Result.OUT_SUCCESS), "text/plain", 200);
			}
		} catch (err) {
			conn.rollback();
			responseInfo(err, "text/plain", 400);
		} finally {
			conn.close();
		}
	} else if (sAction === "REJECT") {
		conn = $.hdb.getConnection();

		try {
			execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_RGA_REJECT');
			var iRgaNo = oPayload.VALUE.RGA_NO;
			var sBuCode = oPayload.VALUE.BU_CODE;
			var sUserId = oPayload.VALUE.USER_ID;
			var sLevel = oPayload.VALUE.APPROVER_LEVEL;

			if (checkUserDetails(iRgaNo, sLevel, sUserId, conn)) {
				var aEventObj = getUserNameAndRole(oPayload.VALUE, conn);

				Result = execProcedure(iRgaNo, sUserId, sLevel, aEventObj);
				responseInfo(JSON.stringify(Result.OUT_SUCCESS), "text/plain", 200);
			}
		} catch (err) {
			conn.rollback();
			responseInfo(err, "text/plain", 400);
		} finally {
			conn.close();
		}
	} else {
		var errorObj = "Undefined Action";
		responseInfo(JSON.stringify(errorObj), "text/plain", 400);
	}
}

//Implementation of GET call
function fnHandleGet() {
	return "Method not supported while posting data : GET";
}

try {
	switch ($.request.method) {
		//Handle your GET calls here
	case $.net.http.GET:
		// fnHandlePost();
		$.response.setBody(JSON.stringify(fnHandleGet()));
		break;
		//Handle your POST calls here
	case $.net.http.POST:
		fnHandlePost();
		// $.response.setBody(JSON.stringify(fnHandlePost()));
		break;
	default:
		break;
	}
} catch (err) {
	$.response.setBody("RGA Approval Failed: " + err.toString());
	$.response.status = 400;
}