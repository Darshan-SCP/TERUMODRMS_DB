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
		if (Action === "CreatePYReq") {
			try {
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_PAYMENTREQUEST_CR');
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var PyReq = oProjectPayload.Value.PY_REQ;
				var orderno = PyReq[0].SAP_ORDER_NO; //Added by komal
				var BU_CODE = PyReq[0].BU_CODE;
				var DISTRIBUTOR_ID = PyReq[0].DISTRIBUTOR_ID;
				var EX_FLAG;
				if (PyReq[0].EXCRDT_DAYS === null){
					EX_FLAG = '';
				}
				else{
					EX_FLAG = 'X';
				}
				var attachflag = PyReq[0].ATTACH;                      
				var PyAttachdata = GneFileID(oProjectPayload.Value.PY_ATTACHMENTS);
				var PyEvents = GneEventNo(oProjectPayload.Value.PY_EVENTS);
				Result = execProcedure(orderno,BU_CODE,EX_FLAG,attachflag,DISTRIBUTOR_ID, PyReq, PyAttachdata, PyEvents); //Added by komal
			
				$.response.setBody(JSON.stringify(Result));
				// $.response.setBody(JSON.stringify(PyReq));
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
		else if (Action === "Approval") {

			try {
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_PAYMENT_APPROVAL');
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var PyReq = oProjectPayload.Value.PY_REQ;
				var orderno = PyReq[0].SAP_ORDER_NO;
				var payno = PyReq[0].POP_NO;
				var aramount = PyReq[0].AR_AMOUNT_ENTERED;
				var docpost = PyReq[0].DOC_POST;
				var bucode = PyReq[0].BU_CODE;
				var DISTRIBUTOR_ID = PyReq[0].DISTRIBUTOR_ID;
			    var curr_approver_lvl = PyReq[0].APRROVER_LEVEL;
			    var curr_approver_role = PyReq[0].APRROVER_ROLE;
			    
			   //Adding SAP Payment No field for Control Reports-- KAustubh 14.03.2022
			   var SapPayNo = PyReq[0].SAP_PAYMENT_NO;
			   
				var evtno = conn.executeQuery(
			    'SELECT MAX("EVENT_NO") as max_evt FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PAYMENTS_EVENTS_COMMENTS\" WHERE POP_NO = ?', parseInt(payno));
				var PyEvents = UpdEventNo(evtno[0].MAX_EVT ,oProjectPayload.Value.PY_EVENTS);
				Result = execProcedure(orderno,payno,aramount,docpost,bucode,DISTRIBUTOR_ID,curr_approver_lvl,curr_approver_role,SapPayNo,PyReq, PyEvents);
				$.response.setBody(JSON.stringify(Result));
				// $.response.setBody(JSON.stringify(PyEvents));
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
		else if (Action === "SendBackforAppr") {

			try {
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_PAYMENT_UPDATE');
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
			    var PyReq = oProjectPayload.Value.PY_REQ;
			    var payno = PyReq[0].POP_NO;
			    var bucode = PyReq[0].BU_CODE;
			    var orderno = PyReq[0].SAP_ORDER_NO;
			    // var EXCRDT_DAYS = PyReq[0].EXCRDT_DAYS;
			    var EX_FLAG;
				if (PyReq[0].EXCRDT_DAYS === null){
					EX_FLAG = '';
				}
				else{
					EX_FLAG = 'X';
				}
				var attachflag = PyReq[0].ATTACH;
				var fildid = conn.executeQuery(
			    'SELECT MAX("FILE_ID") as max_fid FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PAYMENTS_ATTACHMENTS\" WHERE POP_NO = ?', parseInt(payno));
				var PyAttachdata = UpdFileID(fildid[0].MAX_FID, oProjectPayload.Value.PY_ATTACHMENTS);
				var evtno = conn.executeQuery(
			    'SELECT MAX("EVENT_NO") as max_evt FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PAYMENTS_EVENTS_COMMENTS\" WHERE POP_NO = ?', parseInt(payno));
				var PyEvents = UpdEventNo(evtno[0].MAX_EVT ,oProjectPayload.Value.PY_EVENTS);
				//Delete Previous Items from Payments
				conn.executeUpdate('DELETE FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PAYMENTS\" WHERE POP_NO = ?', parseInt(payno));
				conn.commit();
				//
		    	Result = execProcedure(parseInt(payno),orderno,bucode,EX_FLAG,attachflag, PyReq, PyAttachdata, PyEvents);
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
		else if (Action === "SendBack") {

			try {
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_PAYMENT_SENDBACK');
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
			    var PyReq = oProjectPayload.Value.PY_REQ;
			    var payno = PyReq[0].POP_NO;
			    var bucode = PyReq[0].BU_CODE;
			    var curr_approver_role = PyReq[0].APRROVER_ROLE;
				var evtno = conn.executeQuery(
			    'SELECT MAX("EVENT_NO") as max_evt FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PAYMENTS_EVENTS_COMMENTS\" WHERE POP_NO = ?', parseInt(payno));
				var PyEvents = UpdEventNo(evtno[0].MAX_EVT ,oProjectPayload.Value.PY_EVENTS);
		    	Result = execProcedure(parseInt(payno),bucode, curr_approver_role, PyEvents);
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
		else if (Action === "Hold") {

			try {
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_PAYMENT_HOLD');
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
			    var PyReq = oProjectPayload.Value.PY_REQ;
			    var payno = PyReq[0].POP_NO;
			    var curr_approver_role = PyReq[0].APRROVER_ROLE;
				var evtno = conn.executeQuery(
			    'SELECT MAX("EVENT_NO") as max_evt FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PAYMENTS_EVENTS_COMMENTS\" WHERE POP_NO = ?', parseInt(payno));
				var PyEvents = UpdEventNo(evtno[0].MAX_EVT ,oProjectPayload.Value.PY_EVENTS);
		    	Result = execProcedure(parseInt(payno), curr_approver_role, PyEvents);
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