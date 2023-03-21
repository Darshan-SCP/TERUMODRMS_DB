$.response.contentType = "application/json";
$.response.status = 200;
$.response.contentType = "text/plain";

function sampleBUMaterPayload() {
	var payload = {
		"VALUE": {
			"APP_NAME": "",
			"BU_CODE": "",
			"BU_HEAD_ID": "kaustubh.d@intellectbizware.com",
			"BU_SUB_CODE": "",
			"DESCRIPTION": "Abc",
			"DISTRIBUTOR_ID": "kaustubh.d@intellectbizware.com",
			"SALES_ASSO_ID": "kaustubh.d@intellectbizware.com",
			"SALES_MGR_ID": "kaustubh.d@intellectbizware.com",
			"SALES_REGIONALHEAD_ID": "kaustubh.d@intellectbizware.com"
		}
	};

	return payload;
}

function getKitSecCodeArr(secArr) {
	for (var i = 0; i < secArr.length; i++) {
		secArr[i].KIT_SEC_CODE = i + 1;
	}

	return secArr;
}

function getFormArr(oPayloadValue) {
	var array = [];
	if (oPayloadValue.ATTACHMENTS.length > 0) {
		var attachObj = oPayloadValue.ATTACHMENTS[0];

		attachObj.FORM_ID = 0;
		attachObj.PROD_GRP_CODE = oPayloadValue.PROD_GRP_CODE;
		attachObj.PROD_GRP_DESC = oPayloadValue.PROD_GRP_DESC;
		attachObj.FACTORY_NAME = oPayloadValue.FACTORY_NAME;
		attachObj.FORM_NAME = oPayloadValue.FORM_NAME;

		array.push(attachObj);
	}

	return array;
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
	//URL = "ACTION=UPDATE&APPTYPE=BU";
	var sAction = $.request.parameters.get('ACTION');
	var sAppType = $.request.parameters.get('APPTYPE');

	// sAppType = BU / CL / RGA / KIT / HOSP / USER / SCH

	var oPayload = JSON.parse($.request.body.asString());
	var oProjectPayload = JSON.parse($.request.body.asString());
	// var oPayload = sampleBUMaterPayload();

	var conn, execProcedure, Result;

	if ((sAction === "CREATE" || sAction === "EDIT" || sAction === "DELETE") && sAppType === "MATRIX") {
		//MATRIX - Matrix related Masters
		//URL = "ACTION=CREATE&APPTYPE=MATRIX";
		conn = $.hdb.getConnection();

		try {
			execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_MATRIX_MASTER');

			var sAppName = oPayload.VALUE.APP_NAME || "";
			var sRole = oPayload.VALUE.USER_ROLE || "";
			var sLevel = oPayload.VALUE.APPROVER_LEVEL || 0;
			var sNewRole = oPayload.VALUE.USER_ROLE_EDIT || "";
			var sNewLevel = oPayload.VALUE.APPROVER_LEVEL_EDIT || 0;
			var sTable = "";
			if (sAppName === "RGA") sTable = "\"TERUMODRMS_DB.db.Tables::TERUMO_RGA_MATRIX\"";
			else if (sAppName === "CLAIMS") sTable = "\"TERUMODRMS_DB.db.Tables::TERUMO_CLAIM_MATRIX\"";
			else if (sAppName === "CONSIGNMENT") sTable = "\"TERUMODRMS_DB.db.Tables::TERUMO_CONSIGNMENT_ORDER_MATRIX\"";
			else if (sAppName === "PAYMENTS") sTable = "\"TERUMODRMS_DB.db.Tables::TERUMO_PAYMENTS_MATRIX\"";

			Result = execProcedure(sRole, sLevel, sAppName, sTable, sNewRole, sNewLevel, sAction);

			responseInfo(JSON.stringify(Result.OUT_SUCCESS), "text/plain", 200);
		} catch (e) {
			conn.rollback();
			responseInfo(e.message, "text/plain", 400);
		} finally {
			conn.close();
		}
	} else if (sAction === "UPDATE" && sAppType === "BU") {
		//BU - BU related Masters
		conn = $.hdb.getConnection();
		// sAppName = 
		// 1) BUMAST - BU Master - 1st app,
		// 2) BUSUBDIV - BU Subdivision - 2nd app,
		// 3) SUBTODIST - Subdivision to Distributor Mapping - 3rd app,
		// 4) SUBTOSALES - Subdivision to Sales Mapping - 4th app

		try {
			execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_BUMASTERS_UPDATE');
			// Original Values
			var sAppName = oPayload.VALUE.APP_NAME || "";
			var sBuCode = oPayload.VALUE.BU_CODE || "";
			var sBuHeadId = oPayload.VALUE.BU_HEAD_ID || "";
			var sBuSubCode = oPayload.VALUE.BU_SUB_CODE || "";
			var sDescription = oPayload.VALUE.DESCRIPTION || "";
			var sDistId = oPayload.VALUE.DISTRIBUTOR_ID || "";
			var sSaId = oPayload.VALUE.SALES_ASSO_ID || "";
			var sSmId = oPayload.VALUE.SALES_MGR_ID || "";
			var sRhId = oPayload.VALUE.SALES_REGIONALHEAD_ID || "";

			// New Values
			var sBuSubCodeNew = oPayload.VALUE.NEW_BU_SUB_CODE || "";
			var sSaIdNew = oPayload.VALUE.NEW_SALES_ASSO_ID || "";
			var sSmIdNew = oPayload.VALUE.NEW_SALES_MGR_ID || "";
			var sRhIdNew = oPayload.VALUE.NEW_SALES_REGIONALHEAD_ID || "";

			Result = execProcedure(sAppName, sBuCode, sBuHeadId, sBuSubCode, sDescription, sDistId, sSaId, sSmId, sRhId,
				sBuSubCodeNew, sSaIdNew, sSmIdNew, sRhIdNew);

			responseInfo(JSON.stringify(Result.OUT_SUCCESS), "text/plain", 200);
		} catch (e) {
			conn.rollback();
			responseInfo(e.message, "text/plain", 400);
		} finally {
			conn.close();
		}

	} else if ((sAction === "CREATE" || sAction === "EDIT" || sAction === "DELETE") && sAppType === "CL") {
		//CL - Claim related Masters
		//URL = "ACTION=CREATE&APPTYPE=CL";
		conn = $.hdb.getConnection();

		try {
			var sAppName = oPayload.VALUE.APP_NAME || "";

			if (sAppName === "CLTYPE") {
				//CLaim Type Masters
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_CLTYPE_MASTER');

				var aDataObj = oPayload.VALUE.DATA; //array
				var iCode = aDataObj[0].CODE;
				var sDescription = aDataObj[0].DESCRIPTION;

				Result = execProcedure(iCode, sDescription, aDataObj, sAction);

			} else if (sAppName === "CLTOATTCH") {
				//Claim Type And Attachment Mapping App
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_CLTYPE_ATTACH');

				var aDataObj = oPayload.VALUE.DATA; //array
				var iClCode = aDataObj[0].CLAIM_CODE;
				var iAthCode = aDataObj[0].ATTACH_CODE;
				var iAthNo = aDataObj[0].ATTACH_NO;
				var sAthName = aDataObj[0].ATTACH_NAME;

				Result = execProcedure(iClCode, iAthCode, iAthNo, sAthName, aDataObj, sAction);
			}

			responseInfo(JSON.stringify(Result.OUT_SUCCESS), "text/plain", 200);
		} catch (e) {
			conn.rollback();
			responseInfo(e.message, "text/plain", 400);
		} finally {
			conn.close();
		}
	} else if ((sAction === "CREATE" || sAction === "EDIT" || sAction === "DELETE") && sAppType === "KIT") {
		//KIT - Kit Masters
		//URL = "ACTION=CREATE&APPTYPE=KIT";
		conn = $.hdb.getConnection();

		try {
			var sAppName = oPayload.VALUE.APP_NAME || "";

			if (sAppName === "KITMAST") { //Kit Master App
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_KITMASTER');

				var aPrimaryObj = oPayload.VALUE.PRIMARY || []; //array
				var aSecondaryObj = getKitSecCodeArr(oPayload.VALUE.SECONDARY) || []; //array
				var iKitCode = oPayload.VALUE.PRIMARY[0].KIT_CODE || 0;

				Result = execProcedure(sAction, iKitCode, aPrimaryObj, aSecondaryObj);
			}

			responseInfo(JSON.stringify(Result.OUT_SUCCESS), "text/plain", 200);
		} catch (e) {
			conn.rollback();
			responseInfo(e.message, "text/plain", 400);
		} finally {
			conn.close();
		}
	} else if ((sAction === "CREATE" || sAction === "EDIT" || sAction === "DELETE") && sAppType === "PC") {
		//PC - Product Complaint related Masters
		//URL = "ACTION=CREATE&APPTYPE=PC";
		conn = $.hdb.getConnection();

		try {
			var sAppName = oPayload.VALUE.APP_NAME || "";

			if (sAppName === "FORMMAST") { //Form Master App
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_FORM_MASTER');

				var sFId = oPayload.VALUE.FORM_ID || 0;
				var sFormName = oPayload.VALUE.FORM_NAME || "";
				var sPrdGrp = oPayload.VALUE.PROD_GRP || "";
				var sFactName = oPayload.VALUE.FACTORY_NAME || "";
				var aAttachArr = getFormArr(oPayload.VALUE) || "";

				Result = execProcedure(sFId, sFormName, aAttachArr, sAction);
			}

			responseInfo(JSON.stringify(Result.OUT_SUCCESS), "text/plain", 200);
		} catch (e) {
			conn.rollback();
			responseInfo(e.message, "text/plain", 400);
		} finally {
			conn.close();
		}
	} else if ((sAction === "CREATE" || sAction === "EDIT" || sAction === "DELETE") && sAppType === "HOSP") {
		//PC - Hospital Master
		//URL = "ACTION=CREATE&APPTYPE=HOSP";
		conn = $.hdb.getConnection();

		try {
			var sAppName = oPayload.VALUE.APP_NAME || "";

			if (sAppName === "HOSPMAST") { //Hospital Master App
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_HOSPITAL_MASTER');

				var sHospCode = oPayload.VALUE.DATA[0].CODE || 0;
				var sHospDesc = oPayload.VALUE.DATA[0].DESCRIPTION || "";
				var sPhone = oPayload.VALUE.DATA[0].PHONE || "";
				var sEmail = oPayload.VALUE.DATA[0].EMAIL || "";
				var sAddr1 = oPayload.VALUE.DATA[0].ADDRESS1 || "";
				var sAddr2 = oPayload.VALUE.DATA[0].ADDRESS2 || "";
				var sCity = oPayload.VALUE.DATA[0].CITY || "";
				var sSubDiv = oPayload.VALUE.DATA[0].BU_SUB_CODE || ""; //Added Kaustubh 30.07.1989
				var iPincode = oPayload.VALUE.DATA[0].PINCODE || 0;
				var sStartDate = oPayload.VALUE.DATA[0].START_DATE || null;
				var sEndDate = oPayload.VALUE.DATA[0].END_DATE || null;
				var sHospType = oPayload.VALUE.DATA[0].HOSP_TYPE || "";
				var sSate = oPayload.VALUE.DATA[0].STATE || ""; //Added Kaustubh 30.07.1989
				var sHospGrp = oPayload.VALUE.DATA[0].HOSP_GROUP || "";
				var aDataArr = oPayload.VALUE.DATA;

				var iDataLen = 0;
				if (oPayload.VALUE.DATA.length > 0) iDataLen = oPayload.VALUE.DATA.length;
				else throw "No data found!";

				Result = execProcedure(sAction, sHospCode, sHospDesc, sPhone, sEmail, sAddr1, sAddr2, sCity, iPincode, sStartDate, sEndDate, sHospType,
					sSate, sHospGrp, aDataArr, iDataLen, sSubDiv);
				// $.response.setBody(JSON.stringify(oPayload.VALUE.DATA[0].SUB_DIVISION));
			}

			responseInfo(JSON.stringify(Result.OUT_SUCCESS), "text/plain", 200);
		} catch (e) {
			conn.rollback();
			responseInfo(e.message, "text/plain", 400);
		} finally {
			conn.close();
		}
	} else if ((sAction === "CREATE" || sAction === "EDIT" || sAction === "DELETE") && sAppType === "USER") {
		//PC - Hospital Master
		//URL = "ACTION=CREATE&APPTYPE=USER";
		conn = $.hdb.getConnection();

		try {
			var sAppName = oPayload.VALUE.APP_NAME || "";

			if (sAppName === "USERMAST") { //Hospital Master App
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_USER_MASTER');

				var sUserId = oPayload.VALUE.DATA[0].USER_ID || "";
				var sBuCode = oPayload.VALUE.DATA[0].BU_CODE || "";
				var sName = oPayload.VALUE.DATA[0].NAME || "";
				var sType = oPayload.VALUE.DATA[0].USER_TYPE || "";
				var sRole = oPayload.VALUE.DATA[0].USER_ROLE || "";
				var sEmail = oPayload.VALUE.DATA[0].EMAIL || "";
				var sPhone = oPayload.VALUE.DATA[0].PHONE_NO || "";
				var sRegion = oPayload.VALUE.DATA[0].REGION || "";
				var sAddress = oPayload.VALUE.DATA[0].ADDRESS || "";
				var aDataArr = oPayload.VALUE.DATA;

				var iDataLen = 0;
				if (oPayload.VALUE.DATA.length > 0) iDataLen = oPayload.VALUE.DATA.length;
				else throw "No data found!";

				// Result = execProcedure(sAction, sUserId, sName,  aDataArr, iDataLen);
				Result = execProcedure(sAction, sUserId, sBuCode, sName, sType, sRole, sEmail, sPhone, sRegion, sAddress, aDataArr, iDataLen);
			}

			responseInfo(JSON.stringify(Result.OUT_SUCCESS), "text/plain", 200);
		} catch (e) {
			conn.rollback();
			responseInfo(e.message, "text/plain", 400);
		} finally {
			conn.close();
		}
	}
	//Scheme Master
	else if (sAction === "Create" && sAppType === "SCH") {
		conn = $.hdb.getConnection();
		try {
			var dataobj = JSON.stringify(oProjectPayload);
			var oPayload = dataobj.substring(1, dataobj.length - 1);
			oProjectPayload = JSON.parse(oPayload);
			var SchemeData = oProjectPayload.Value.SCHEMEDATA;
			execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_SCHEME_CREATE');
			Result = execProcedure(SchemeData);
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
	} else if (sAction === "Update" && sAppType === "SCH") {
		conn = $.hdb.getConnection();
		try {
			var dataobj = JSON.stringify(oProjectPayload);
			var oPayload = dataobj.substring(1, dataobj.length - 1);
			oProjectPayload = JSON.parse(oPayload);
			var SchemeData = oProjectPayload.Value.SCHEMEDATA;
			var SCH_ID = SchemeData[0].SCH_NO;
			var SCH_NAME = SchemeData[0].SCHEME_NAME;
			var PROD_GRP = SchemeData[0].PROD_GRP;
			var PROD_GRP_DESC = SchemeData[0].PROD_GRP_DESC;
			var REQ_QUANTITY = SchemeData[0].REQ_QUANTITY;
			var FOC_QUANTITY = SchemeData[0].FOC_QUANTITY;
			var SCHEME_STATUS = SchemeData[0].SCHEME_STATUS;
			execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_SCHEME_UPDATE');
			Result = execProcedure(SCH_ID, SCH_NAME, PROD_GRP, PROD_GRP_DESC, REQ_QUANTITY, FOC_QUANTITY, SCHEME_STATUS);
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
		$.response.setBody(JSON.stringify(fnHandleGet()));
		break;

		//Handle your POST calls here
	case $.net.http.POST:
		fnHandlePost();
		// $.response.setBody(JSON.stringify(fnHandlePut()));
		break;
	default:
		break;
	}
} catch (err) {
	$.response.setBody("Master Action Failed: " + err.toString());
}