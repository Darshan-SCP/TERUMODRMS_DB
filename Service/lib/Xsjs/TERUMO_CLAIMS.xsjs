$.response.contentType = "application/json";
$.response.status = 200;
$.response.contentType = "text/plain";

function samplePayload() {
	var payload = {
		"VALUE": {
			"USER_ID": "8000039",
			"USER_NAME": "ADLIFE DISTRIBUTOR",
			"USER_ROLE": "DIST",

			"BU_CODE": "TIS",
			"BU_SUB_CODE": "CARDIO",
			"CLAIM_TYPE": 1,
			"CLAIM_REASON": "Expired Products",
			"CLAIM_FROM": "2021-02-20T10:10:10",
			"CLAIM_TO": "2021-02-28T10:10:10",
			"SALES_ASSOCIATE_ID": "8000099",

			"ITEMS": [{
				"ITEM_CODE": "ITEM001",
				"HOSPITAL_CODE": 1,
				"INVOICE_NO": 9140000195,
				"INVOICE_DATE": "2021-02-20T10:10:10",
				"INVOICE_QUANTITY": 2,
				"INVOICE_RATE": 25,
				"REQUESTED_RATE": 10,
				"REQUESTED_QUANTITY": 10,
				"REQUESTED_AMOUNT": 100
			}, {
				"ITEM_CODE": "ITEM002",
				"HOSPITAL_CODE": 1,
				"INVOICE_NO": 9140000195,
				"INVOICE_DATE": "2021-02-20T10:10:10",
				"INVOICE_QUANTITY": 2,
				"INVOICE_RATE": 30,
				"REQUESTED_RATE": 20,
				"REQUESTED_QUANTITY": 10,
				"REQUESTED_AMOUNT": 200
			}],
			"ATTACHMENTS": [{
				"ATTACH_CODE": 1,
				"FILE_NAME": "dummy1.pdf",
				"FILE_MIMETYPE": "application/pdf",
				"FILE_CONTENT": "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nD2OywoCMQxF9/mKu3YRk7bptDAIDuh+oOAP+AAXgrOZ37etjmSTe3ISIljpDYGwwrKxRwrKGcsNlx1e31mt5UFTIYucMFiqcrlif1ZobP0do6g48eIPKE+ydk6aM0roJG/RegwcNhDr5tChd+z+miTJnWqoT/3oUabOToVmmvEBy5IoCgplbmRzdHJlYW0KZW5kb2JqCgozIDAgb2JqCjEzNAplbmRvYmoKCjUgMCBvYmoKPDwvTGVuZ3RoIDYgMCBSL0ZpbHRlci9GbGF0ZURlY29kZS9MZW5ndGgxIDIzMTY0Pj4Kc3RyZWFtCnic7Xx5fFvVlf+59z0tdrzIu7xFz1G8Kl7i2HEWE8vxQlI3iRM71A6ksSwrsYptKZYUE9omYStgloZhaSlMMbTsbSPLAZwEGgNlusxQ0mHa0k4Z8muhlJb8ynQoZVpi/b736nkjgWlnfn/8Pp9fpNx3zz33bPecc899T4oVHA55KIEOkUJO96DLvyQxM5WI/omIpbr3BbU/3J61FPBpItOa3f49g1948t/vI4rLIzL8dM/A/t3vn77ZSpT0LlH8e/0eV98jn3k0mSj7bchY2Q/EpdNXm4hyIIOW9g8Gr+gyrq3EeAPGVQM+t+uw5VrQ51yBcc6g6wr/DywvGAHegbE25Br0bFR/ezPGR4kq6/y+QPCnVBYl2ijka/5hjz95S8kmok8kEFl8wDG8xQtjZhRjrqgGo8kcF7+I/r98GY5TnmwPU55aRIhb9PWZNu2Nvi7mRM9/C2flx5r+itA36KeshGk0wf5MWfQ+y2bLaSOp9CdkyxE6S3dSOnXSXSyVllImbaeNTAWNg25m90T3Rd+ii+jv6IHoU+zq6GOY/yL9A70PC/5NZVRHm0G/nTz0lvIGdUe/Qma6nhbRWtrGMslFP8H7j7DhdrqD"
			}, {
				"ATTACH_CODE": 1,
				"FILE_NAME": "dummy2.pdf",
				"FILE_MIMETYPE": "application/pdf",
				"FILE_CONTENT": "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nD2OywoCMQxF9/mKu3YRk7bptDAIDuh+oOAP+AAXgrOZ37etjmSTe3ISIljpDYGwwrKxRwrKGcsNlx1e31mt5UFTIYucMFiqcrlif1ZobP0do6g48eIPKE+ydk6aM0roJG/RegwcNhDr5tChd+z+miTJnWqoT/3oUabOToVmmvEBy5IoCgplbmRzdHJlYW0KZW5kb2JqCgozIDAgb2JqCjEzNAplbmRvYmoKCjUgMCBvYmoKPDwvTGVuZ3RoIDYgMCBSL0ZpbHRlci9GbGF0ZURlY29kZS9MZW5ndGgxIDIzMTY0Pj4Kc3RyZWFtCnic7Xx5fFvVlf+59z0tdrzIu7xFz1G8Kl7i2HEWE8vxQlI3iRM71A6ksSwrsYptKZYUE9omYStgloZhaSlMMbTsbSPLAZwEGgNlusxQ0mHa0k4Z8muhlJb8ynQoZVpi/b736nkjgWlnfn/8Pp9fpNx3zz33bPecc899T4oVHA55KIEOkUJO96DLvyQxM5WI/omIpbr3BbU/3J61FPBpItOa3f49g1948t/vI4rLIzL8dM/A/t3vn77ZSpT0LlH8e/0eV98jn3k0mSj7bchY2Q/EpdNXm4hyIIOW9g8Gr+gyrq3EeAPGVQM+t+uw5VrQ51yBcc6g6wr/DywvGAHegbE25Br0bFR/ezPGR4kq6/y+QPCnVBYl2ijka/5hjz95S8kmok8kEFl8wDG8xQtjZhRjrqgGo8kcF7+I/r98GY5TnmwPU55aRIhb9PWZNu2Nvi7mRM9/C2flx5r+itA36KeshGk0wf5MWfQ+y2bLaSOp9CdkyxE6S3dSOnXSXSyVllImbaeNTAWNg25m90T3Rd+ii+jv6IHoU+zq6GOY/yL9A70PC/5NZVRHm0G/nTz0lvIGdUe/Qma6nhbRWtrGMslFP8H7j7DhdrqD"
			}]
		}
	};

	return payload;
}

function samplePayloadUpdateStatus() {
	var payload = {
		"VALUE": {
			"CR_NO": 8000000018,
			"BU_CODE": "TIS",
			"BU_SUB_CODE": "CARDIO",
			"USER_ID": "kaustubh.d@intellectbizware.com",
			"APPROVER_LEVEL": 1,
			"APPROVER_ROLE": "SA",
			"APRROVE_TYPE": "Partial",
			"COMMENT": "Approved",
			"SAP_CREDIT_NOTE": "",
			"ATTACHMENTS": []

		}
	};

	return payload;
}

function responseInfo(setBody, contentType, status) {
	$.response.setBody(setBody);
	$.response.contentType = contentType;
	$.response.status = status;
}

function getHeaderArrForST(oPayloadValue) {
	var eventArr = [{
		"CR_NO": 0,
		"BU_CODE": oPayloadValue.BU_CODE,
		"BU_SUB_CODE": oPayloadValue.BU_SUB_CODE,
		"CLAIM_TYPE": oPayloadValue.CLAIM_TYPE,
		"CLAIM_REASON": oPayloadValue.CLAIM_REASON,
		"CLAIM_FROM": oPayloadValue.CLAIM_FROM,
		"CLAIM_TO": oPayloadValue.CLAIM_TO,
		"HOSP_CODE" : oPayloadValue.HOSP_CODE
		// "SALES_ASSOCIATE_ID": oPayloadValue.SALES_ASSOCIATE_ID
	}];

	return eventArr;
}

function getEventArrForST(oPayloadValue) {
	var eventArr = [{
		"CR_NO": 0,
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
			"CR_NO": 0,
			"EVENT_NO": 0,
			"USER_ID": oPayloadValue.USER_ID,
			"USER_NAME": resultObj.NAME,
			"USER_ROLE": resultObj.USER_ROLE,
			"COMMENT": oPayloadValue.COMMENT
		}];
	} else if (resultObj.USER_ROLE !== oPayloadValue.APPROVER_ROLE) {
		throw "Incorrect User Role";
	} else {
		throw "User does not exists";
	}

	return eventArr;
}

function getidForArr(array, propertyName) {
	if (propertyName !== "" && propertyName !== null && propertyName !== undefined) {
		for (var i = 0; i < array.length; i++) {
			array[i].CR_NO = 0;
			array[i][propertyName] = i + 1;
		}
	} else {
		throw "Property Name missing for id's"
	}

	return array;
}

function getSeparateidsForResend(attachArray) {
	var aAllFiles = [],
		aDistFiles = [],
		aTPFiles = [];
		
	if (attachArray.length > 0) {
		for (var i = 0; i < attachArray.length; i++) {
			if (attachArray[i].ATTACH_CODE === 1) {
				aDistFiles.push(attachArray[i]);
			} else if (attachArray[i].ATTACH_CODE === 2) {
				aTPFiles.push(attachArray[i]);
			}
		}

		aDistFiles = getidForArr(aDistFiles, "FILE_ID");
		aTPFiles = getidForArr(aTPFiles, "FILE_ID");

		aAllFiles.push(...aDistFiles, ...aTPFiles);
		attachArray = aAllFiles;
	}

	return attachArray;
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

//24.09.2021
function GetEventNo(maxevt,EventPl) {
	var evtcalc = maxevt;
	for (var i = 0; i < EventPl.length; i++) {
		EventPl[i].EVENT_NO = evtcalc + 1;
		evtcalc = evtcalc + 1 ;
	}
	return EventPl;
}

function GetFileId(maxfileid,AttachPl) {
	var evtcalc = maxfileid;
	for (var i = 0; i < AttachPl.length; i++) {
		AttachPl[i].FILE_ID = evtcalc + 1;
		evtcalc = evtcalc + 1 ;
	}
	return AttachPl;
}

function checkUserDetails(oPayloadValue, CONN) {
	var conn = CONN;
	var sQuery =
		'SELECT  \"APPROVER_LEVEL\", \"NEXT_APPROVER\", \"STATUS\" FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_CLAIM_HEADER\" WHERE CR_NO = ?'
	var aResult = conn.executeQuery(sQuery, oPayloadValue.CR_NO);

	if (aResult.length > 0) {
		var resultObj = aResult[0];
		// if (oPayloadValue.USER_ID !== resultObj.NEXT_APPROVER) {
		// 	throw "Incorrect Approver";
		// } else 
		if (oPayloadValue.APPROVER_LEVEL !== resultObj.APPROVER_LEVEL) {
			throw "Incorrect Approval Level";
		}

		// else if (oPayloadValue.STATUS !== 6) {
		// 	throw "CR Cannot be Approved";
		// } else 

	} else {
		throw "CR does not exists";
	}

	return true;
}

//Implementation of POST call
function fnHandlePost() {
	var sAction = $.request.parameters.get('ACTION');
	var oPayload = JSON.parse($.request.body.asString());
	var oProjectPayload = JSON.parse($.request.body.asString());

	// var sAction = "CREATE";
	// var oPayload = samplePayload();

	var conn, execProcedure, Result;

	if (sAction === "CREATE") {
		conn = $.hdb.getConnection();

		try {
			execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_CLAIM_CREATE');
			var sUserId = oPayload.VALUE.USER_ID;
			var sBuCode = oPayload.VALUE.BU_CODE;
			var sSubBuCode = oPayload.VALUE.BU_SUB_CODE;
			var sDist_Reason = oPayload.VALUE.CLAIM_REASON;
			var aHeaderObj = getHeaderArrForST(oPayload.VALUE);
			var aItemObj = getidForArr(oPayload.VALUE.ITEMS, "ITEM_NO"); //array
			var aAttachObj = getidForArr(oPayload.VALUE.ATTACHMENTS, "FILE_ID");
			var aEventObj = getEventArrForST(oPayload.VALUE);
			//Note Kaustubh add HOSP_CODE for Terumo CR 10.03.2022 in function getHeaderArrForST

			Result = execProcedure(sUserId, sBuCode, sSubBuCode, sDist_Reason, aHeaderObj, aItemObj, aAttachObj, aEventObj);

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

			execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_CLAIM_APPROVE');
			var iCrNo = oPayload.VALUE.CR_NO;
			var sBuCode = oPayload.VALUE.BU_CODE;
			var sSubBuCode = oPayload.VALUE.BU_SUB_CODE;
			var sUserId = oPayload.VALUE.USER_ID;
			var sLevel = oPayload.VALUE.APPROVER_LEVEL;
			var sRole = oPayload.VALUE.APPROVER_ROLE;
			var sSAPCredit = oPayload.VALUE.SAP_CREDIT_NOTE;
			var sApprType = oPayload.VALUE.APRROVE_TYPE;
			//Change Request 21.02.2022 KAustubh (Add entries for TP and SAP Credit note amount)
			var sCasNo = oPayload.VALUE.CAS_NO;
			var sUTID = oPayload.VALUE.UTID_NO;
			var sSAPCreditAmount = oPayload.VALUE.SAP_CREDIT_NOTE_AMOUNT;
			var sSAPCreditAmountDate = oPayload.VALUE.SAP_CREDIT_NOTE_DATE;
			//////////////////////
			var aItemObj = [];
			if (oPayload.VALUE.ITEMS && oPayload.VALUE.ITEMS.length > 0) {
				aItemObj = getidForArr(oPayload.VALUE.ITEMS, "ITEM_NO"); //array
			}
			var aAttachObj = [];
			if (oPayload.VALUE.ATTACHMENTS && oPayload.VALUE.ATTACHMENTS.length > 0 && sLevel === 4) {
				aAttachObj = getidForArr(oPayload.VALUE.ATTACHMENTS, "FILE_ID");
			}

			if (checkUserDetails(oPayload.VALUE, conn)) {
				var aEventObj = getUserNameAndRole(oPayload.VALUE, conn);

				Result = execProcedure(iCrNo, sBuCode, sSubBuCode, sUserId, sLevel, sRole, sSAPCredit, sCasNo , sUTID , sSAPCreditAmount, sSAPCreditAmountDate,
				aItemObj, aAttachObj, aEventObj, sApprType);
				responseInfo(JSON.stringify(Result.OUT_SUCCESS), "text/plain", 200);
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

			execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_CLAIM_SENDBACK');
			var iCrNo = oPayload.VALUE.CR_NO;
			var sBuCode = oPayload.VALUE.BU_CODE;
			var sSubBuCode = oPayload.VALUE.BU_SUB_CODE;
			var sUserId = oPayload.VALUE.USER_ID;
			var sRole = oPayload.VALUE.APPROVER_ROLE;

			if (checkUserDetails(oPayload.VALUE, conn)) {
				var aEventObj = getUserNameAndRole(oPayload.VALUE, conn);

				Result = execProcedure(iCrNo, sBuCode, sSubBuCode, sUserId, sRole, aEventObj);
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

			execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_CLAIM_RESEND');
			var iCrNo = oPayload.VALUE.CR_NO;
			var sBuCode = oPayload.VALUE.BU_CODE;
			var sSubBuCode = oPayload.VALUE.BU_SUB_CODE;
			var sClaimReason = oPayload.VALUE.COMMENT;
			var sUserId = oPayload.VALUE.USER_ID;
			var sLevel = oPayload.VALUE.APPROVER_LEVEL;
			var sRole = oPayload.VALUE.APPROVER_ROLE;
			var aItemObj = getidForArr(oPayload.VALUE.ITEMS, "ITEM_NO"); //array
			var sApprType = oPayload.VALUE.APRROVE_TYPE;

			if (checkUserDetails(oPayload.VALUE, conn)) {
				var aAttachObj = getSeparateidsForResend(oPayload.VALUE.ATTACHMENTS);
				var aEventObj = getUserNameAndRole(oPayload.VALUE, conn);

				Result = execProcedure(iCrNo, sBuCode, sSubBuCode, sClaimReason, sUserId, sLevel, sRole, aItemObj, aAttachObj, aEventObj, sApprType);
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
			execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_CLAIM_REJECT');
			var iCrNo = oPayload.VALUE.CR_NO;
			var sUserId = oPayload.VALUE.USER_ID;
			var sLevel = oPayload.VALUE.APPROVER_LEVEL;
			var sRole = oPayload.VALUE.APPROVER_ROLE;

			if (checkUserDetails(oPayload.VALUE, conn)) {
				var aEventObj = getUserNameAndRole(oPayload.VALUE, conn);

				Result = execProcedure(iCrNo, sUserId, sLevel, sRole, aEventObj);
				responseInfo(JSON.stringify(Result.OUT_SUCCESS), "text/plain", 200);
			}

		} catch (e) {
			conn.rollback();
			responseInfo(e.message, "text/plain", 400);
		} finally {
			conn.close();
		}
	}	
		//Added by Kaustubh 24.09.2021 : CAS Document Upload by SA change
		else if (sAction === "CASUpload") {
			conn = $.hdb.getConnection();
			try {
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_CLAIM_CAS');
				var dataobj = JSON.stringify(oProjectPayload);
				var CasPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(CasPayload);
				//Change request Kaustubh 18.02.2022 (CAS No to be addes)
				var casdata = oProjectPayload.Value.CLAIM_CAS;
				var Attachdata = oProjectPayload.Value.CLAIM_ATTACH;
				var CR_NO = Attachdata[0].CR_NO;
			    var fileid = conn.executeQuery(
			    'SELECT MAX("FILE_ID") as max_evt FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_CLAIM_ATTACHMENTS\" WHERE CR_NO = ?', parseInt(CR_NO));
			    var Attachdata = GetFileId(fileid[0].MAX_EVT,oProjectPayload.Value.CLAIM_ATTACH);
			    var CR_NO = Attachdata[0].CR_NO;
			    //Change request Kaustubh 18.02.2022 (CAS No to be addes)
			    var CAS_NO = casdata[0].CAS_NO;
				Result = execProcedure(CR_NO,CAS_NO, Attachdata);
				responseInfo(JSON.stringify(Result.OUT_SUCCESS), "text/plain", 200);
				
				// Result = execProcedure(CR_NO, userid, Attachdata, CrEvents);
				// responseInfo(JSON.stringify(Attachdata), "text/plain", 200);
			} catch (e) {
				conn.rollback();
				responseInfo(e.message, "text/plain", 400);
			} finally {
				conn.close();
			}
		}

	 else {
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
	$.response.setBody("Claim Creation Failed: " + err.toString());
}