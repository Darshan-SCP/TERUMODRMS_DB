$.response.contentType = "application/json";
$.response.status = 200;
$.response.contentType = "text/plain";

function samplePayload() {
	var payload = {
		"VALUE": {
			"USER_ID": "8000039",
			"USER_NAME": "Kaustubh",
			"USER_ROLE": "SA",

			"PROD_GRP": "1",
			"PROD_CODE": "",
			"PROD_UNKNOWN": "",
			"FACTORY_NAME": "",
			"DESCRIPTION": "",
			"PROD_UNKNOWN_DESC": "",

			"ATTACHMENTS": [{
				"ATTACH_CODE": 1,
				"FORM_ID": 1,
				"FILE_NAME": "dummy1.pdf",
				"FILE_TYPE": "Product Complaint Form",
				"FILE_MIMETYPE": "application/pdf",
				"FILE_CONTENT": "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nD2OywoCMQxF9/mKu3YRk7bptDAIDuh+oOAP+AAXgrOZ37etjmSTe3ISIljpDYGwwrKxRwrKGcsNlx1e31mt5UFTIYucMFiqcrlif1ZobP0do6g48eIPKE+ydk6aM0roJG/RegwcNhDr5tChd+z+miTJnWqoT/3oUabOToVmmvEBy5IoCgplbmRzdHJlYW0KZW5kb2JqCgozIDAgb2JqCjEzNAplbmRvYmoKCjUgMCBvYmoKPDwvTGVuZ3RoIDYgMCBSL0ZpbHRlci9GbGF0ZURlY29kZS9MZW5ndGgxIDIzMTY0Pj4Kc3RyZWFtCnic7Xx5fFvVlf+59z0tdrzIu7xFz1G8Kl7i2HEWE8vxQlI3iRM71A6ksSwrsYptKZYUE9omYStgloZhaSlMMbTsbSPLAZwEGgNlusxQ0mHa0k4Z8muhlJb8ynQoZVpi/b736nkjgWlnfn/8Pp9fpNx3zz33bPecc899T4oVHA55KIEOkUJO96DLvyQxM5WI/omIpbr3BbU/3J61FPBpItOa3f49g1948t/vI4rLIzL8dM/A/t3vn77ZSpT0LlH8e/0eV98jn3k0mSj7bchY2Q/EpdNXm4hyIIOW9g8Gr+gyrq3EeAPGVQM+t+uw5VrQ51yBcc6g6wr/DywvGAHegbE25Br0bFR/ezPGR4kq6/y+QPCnVBYl2ijka/5hjz95S8kmok8kEFl8wDG8xQtjZhRjrqgGo8kcF7+I/r98GY5TnmwPU55aRIhb9PWZNu2Nvi7mRM9/C2flx5r+itA36KeshGk0wf5MWfQ+y2bLaSOp9CdkyxE6S3dSOnXSXSyVllImbaeNTAWNg25m90T3Rd+ii+jv6IHoU+zq6GOY/yL9A70PC/5NZVRHm0G/nTz0lvIGdUe/Qma6nhbRWtrGMslFP8H7j7DhdrqD"
			}]
		}
	};

	return payload;
}

function sampleUpdatePayload() {
	var payload = {
		"VALUE": {
			"PPR_NO": 0,
			"USER_ID": "8000039",
			"APRROVER_ROLE": "SA",
			"COMMENT": "",

			"ATTACHMENTS": []
		}
	};

	return payload;
}

function getHeaderArrForST(oPayloadValue) {
	var eventArr = [{
		"PPR_NO": 0,
		"PROD_GRP": oPayloadValue.PROD_GRP,
		"PROD_CODE": oPayloadValue.PROD_CODE,
		"PROD_UNKNOWN": oPayloadValue.PROD_UNKNOWN,
		"FACTORY_NAME": oPayloadValue.FACTORY_NAME,
		"DESCRIPTION": oPayloadValue.DESCRIPTION,
		"PROD_UNKNOWN_DESC": oPayloadValue.PROD_UNKNOWN_DESC,
		"SALES_ASSOCIATE_ID": oPayloadValue.USER_ID
	}];

	return eventArr;
}

function getidForArr(array) {
	if (array.length > 0) {
		for (var i = 0; i < array.length; i++) {
			array[i].PPR_NO = 0;
			array[i].FILE_ID = i + 1;
		}
	} 

	return array;
}

function getUserNameAndRole(oPayloadValue, CONN) {
	var conn = CONN;
	var sQuery =
		'SELECT  \"NAME\",	\"USER_ROLE\" FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_USER_MASTER\" WHERE USER_ID = ?';
	var aResult = conn.executeQuery(sQuery, oPayloadValue.USER_ID);

	if (aResult.length > 0) {
		var resultObj = aResult[0];

		var eventArr = [{
			"PPR_NO": 0,
			"EVENT_NO": 0,
			"USER_ID": oPayloadValue.USER_ID,
			"USER_NAME": resultObj.NAME,
			"USER_ROLE": resultObj.USER_ROLE,
			"COMMENT": oPayloadValue.COMMENT
		}];
	} else if (resultObj.USER_ROLE !== oPayloadValue.APRROVER_ROLE) {
		throw "Incorrect User Role";
	} else {
		throw "User does not exists";
	}

	return eventArr;
}

function getEventArrForST(oPayloadValue) {
	var eventArr = [{
		"PPR_NO": 0,
		"EVENT_NO": 0,
		"USER_ID": oPayloadValue.USER_ID,
		"USER_NAME": oPayloadValue.USER_NAME,
		"USER_ROLE": oPayloadValue.USER_ROLE
	}];

	return eventArr;
}

function responseInfo(setBody, contentType, status) {
	$.response.setBody(setBody);
	$.response.contentType = contentType;
	$.response.status = status;
}

//Implementation of PUT call
function fnHandlePost() {
	var sAction = $.request.parameters.get('ACTION');
	var oPayload = JSON.parse($.request.body.asString());

	// var sAction = "CREATE";
	// var oPayload = samplePayload();

	var conn, execProcedure, Result;

	if (sAction === "CREATE") {
		conn = $.hdb.getConnection();

		try {
			execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_PPR_CREATE');
			var sUserId = oPayload.VALUE.USER_ID;
			var sRole = oPayload.VALUE.USER_ROLE;
			var sDescription = oPayload.VALUE.DESCRIPTION;
			var aHeaderObj = getHeaderArrForST(oPayload.VALUE);
			var aAttachObj = getidForArr(oPayload.VALUE.ATTACHMENTS);
			var aEventObj = getEventArrForST(oPayload.VALUE);

			Result = execProcedure(sUserId, sRole, sDescription, aHeaderObj, aAttachObj, aEventObj);

			responseInfo(JSON.stringify(Result.OUT_SUCCESS), "text/plain", 200);
		} catch (e) {
			conn.rollback();
			responseInfo(e.message, "text/plain", 400);
		} finally {
			conn.close();
		}

	} else if (sAction === "APPROVE") {
		conn = $.hdb.getConnection();

		try {

			execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_PPR_APPROVE');
			var iPprNo = oPayload.VALUE.PPR_NO;
			var sUserId = oPayload.VALUE.USER_ID;
			var sRole = oPayload.VALUE.APRROVER_ROLE;
			// var sComment = oPayload.VALUE.COMMENT;
			// var aAttachObj = getidForArr(oPayload.VALUE.ATTACHMENTS);
			var aEventObj = getUserNameAndRole(oPayload.VALUE, conn);

			Result = execProcedure(iPprNo, sUserId, sRole, aEventObj);
			responseInfo(JSON.stringify(Result.OUT_SUCCESS), "text/plain", 200);
		} catch (err) {
			conn.rollback();
			responseInfo(err, "text/plain", 400);
		} finally {
			conn.close();
		}

	} else if (sAction === "SENDBACK") {
		conn = $.hdb.getConnection();

		try {

			execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_PPR_SENDBACK');
			var iPprNo = oPayload.VALUE.PPR_NO;
			var sUserId = oPayload.VALUE.USER_ID;
			var sRole = oPayload.VALUE.APRROVER_ROLE;
			// var sComment = oPayload.VALUE.COMMENT;
			var aEventObj = getUserNameAndRole(oPayload.VALUE, conn);

			Result = execProcedure(iPprNo, sUserId, sRole, aEventObj);
			responseInfo(JSON.stringify(Result.OUT_SUCCESS), "text/plain", 200);
		} catch (err) {
			conn.rollback();
			responseInfo(err, "text/plain", 400);
		} finally {
			conn.close();
		}

	} else if (sAction === "RESEND") {
		conn = $.hdb.getConnection();

		try {

			execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_PPR_RESEND');
			var iPprNo = oPayload.VALUE.PPR_NO;
			var sUserId = oPayload.VALUE.USER_ID;
			var sRole = oPayload.VALUE.APRROVER_ROLE;
			var sComment = oPayload.VALUE.COMMENT;
			var aAttachObj = getidForArr(oPayload.VALUE.ATTACHMENTS);
			var aEventObj = getUserNameAndRole(oPayload.VALUE, conn);

			Result = execProcedure(iPprNo, sUserId, sRole, aAttachObj, aEventObj);
			responseInfo(JSON.stringify(Result.OUT_SUCCESS), "text/plain", 200);
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
	$.response.setBody("PPR Creation Failed: " + err.toString());
}