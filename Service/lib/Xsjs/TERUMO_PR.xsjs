function GneEventNo(EventPl) {
	for (var i = 0; i < EventPl.length; i++) {
		EventPl[i].EVENT_NO = i + 1;
	}
	return EventPl;
}

//For Unit Orders and DRAFT UNIT ORDERS
function GenItemNoUnit(ItemPld) {
	for (var i = 0; i < ItemPld.length; i++) {
		ItemPld[i].PR_ITEM_NO = i + 1;
	}
	return ItemPld;
}

function GenLogNo(LogPayload) {
	for (var i = 0; i < LogPayload.length; i++) {
		LogPayload[i].PR_ITEM_NO = i + 1;
		LogPayload[i].LOG_NO = i + 1;
	}
	return LogPayload;
}

function GetEventNo(maxevt,EventPl) {
	var evtcalc = maxevt;
	for (var i = 0; i < EventPl.length; i++) {
		EventPl[i].EVENT_NO = evtcalc + 1;
		evtcalc = evtcalc + 1 ;
	}
	return EventPl;
}

//For Consignement ORder Log no
function NextLogNo(maxlog,LogPayload) {
	var logcalc = maxlog;
	for (var i = 0; i < LogPayload.length; i++) {
		LogPayload[i].PR_ITEM_NO = i + 1;
		LogPayload[i].LOG_NO = logcalc + 1;
		logcalc = logcalc + 1 ;
	}
	return LogPayload;
}

try {

	switch ($.request.method) {
		//Handle  GET 
	case $.net.http.GET:
		var conn = $.hdb.getConnection();
		var Count = conn.executeQuery(
			'SELECT COUNT( * ) as "COUNT" FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_HEADER\" WHERE PR_STATUS = ?', 'PRDC');
		$.response.setBody(JSON.stringify(Count[0]));
		conn.close();
		break;

	case $.net.http.POST:
		var oProjectPayload = JSON.parse($.request.body.asString());
		var conn = $.hdb.getConnection();
		var Action = $.request.parameters.get("Action");
		var execProcedure;
		var Result;
		///////////////////For PURchase REQUEST CREATION//////////////////////
     	if (Action === "Create") {

			try {
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_BOOKORDER');
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var PrHeader = oProjectPayload.Value.PR_HEADER;
				var PrItems = GenItemNoUnit(oProjectPayload.Value.PR_ITEMS);
				var PrHistory = GenLogNo(oProjectPayload.Value.PR_HISTORY);
				var PrEvents = GneEventNo(oProjectPayload.Value.PR_EVENTS);
				Result = execProcedure(PrHeader, PrItems, PrHistory, PrEvents);
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
		//////////////////////////////////////////////////////////
		/////////////For DRAFT ORDER SCENARIOS////////////////////
	     else if (Action === "CreateDRAFT") {
			try {
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_PR_DRAFTCREATE');
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var PrHeader = oProjectPayload.Value.PR_HEADER;
				var PrItems = GenItemNoUnit(oProjectPayload.Value.PR_ITEMS);
				Result = execProcedure(PrHeader, PrItems);
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
		////////////////////////////////////////////////
		/////////////For DRAFT ORDER Update SCENARIOS////////////////////
	    else if (Action === "UpdDRAFT") {
			try {
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var PrHeader = oProjectPayload.Value.PR_HEADER;
				var PR_NO = PrHeader[0].PR_NO;
				//Fields to be updated////
				var BU = PrHeader[0].BU_CODE;
				var Ordertype = PrHeader[0].ORDER_TYPE;
				var KitCode = PrHeader[0].KIT_CODE;
				var shipto = PrHeader[0].SHIP_TO;
				var billto = PrHeader[0].BILL_TO;
				////
				var PrItems = GenItemNoUnit(oProjectPayload.Value.PR_ITEMS);
				//Delete Previous Items from Draft Line Items
				conn.executeUpdate('DELETE FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_ITEMS\" WHERE PR_NO = ?', parseInt(PR_NO));
				conn.commit();
				//
                execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_PR_DRAFTUPDATE'); 
				Result = execProcedure(PR_NO, BU, Ordertype,KitCode, shipto, billto, PrItems);
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
		////////////////////////////////////////////////
		/////////////For New Purchase Reqeusts from Draft ORDER SCENARIOS////////////////////
		else if (Action === "CreatePRDRAFT") {
			try {
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var PrHeader = oProjectPayload.Value.PR_HEADER;
				var PR_NO = PrHeader[0].PR_NO;
				//Fields to be updated////
				var BU = PrHeader[0].BU_CODE;
				var Ordertype = PrHeader[0].ORDER_TYPE;
				var KitCode = PrHeader[0].KIT_CODE;
				var shipto = PrHeader[0].SHIP_TO;
				var billto = PrHeader[0].BILL_TO;
				////
				var PrItems = GenItemNoUnit(oProjectPayload.Value.PR_ITEMS);
				var PrHistory = GenLogNo(oProjectPayload.Value.PR_HISTORY);
				var PrEvents = GneEventNo(oProjectPayload.Value.PR_EVENTS);
				//Delete Previous Items from Draft Line Items
				conn.executeUpdate('DELETE FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_ITEMS\" WHERE PR_NO = ?', parseInt(PR_NO));
				conn.commit();
				//
                execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_PR_FROM_DRAFT');
				Result = execProcedure(PR_NO, BU, Ordertype,KitCode, shipto, billto, PrItems, PrHistory, PrEvents);
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
		/////////////////////////////////////////////////////////////////////////////////////
		// Draft Deletion
		/////////////////////
		else if (Action === "DeleteDraft") {
			try {				
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var PrHeader = oProjectPayload.Value.PR_HEADER;
				var PR_NO = PrHeader[0].PR_NO;				
				//Delete Draft Entries from HEader and Items
				conn.executeUpdate('DELETE FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_HEADER\" WHERE PR_NO = ?', parseInt(PR_NO));
				conn.executeUpdate('DELETE FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_ITEMS\" WHERE PR_NO = ?', parseInt(PR_NO));
				conn.commit();
				//
				Result = ("Draft Order deleted with ID :" + PR_NO);
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
		///////
		// Purchase request Cancellation (Distributor Side)
		///////
		else if (Action === "ReqCancel") {
			try {
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_PR_CANCEL');
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var PrHeader = oProjectPayload.Value.PR_HEADER;
				var PR_NO = PrHeader[0].PR_NO;
				var evtno = conn.executeQuery(
			    'SELECT MAX("EVENT_NO") as max_evt FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_EVENTS_COMMENTS\" WHERE PR_NO = ?', parseInt(PR_NO));
				var PrEvents = GetEventNo(evtno[0].MAX_EVT ,oProjectPayload.Value.PR_EVENTS);
				Result = execProcedure(PR_NO, PrEvents);
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
		/////
		// Terumo CR : PO Cancellation 14.03.2022
		/////
		else if (Action === "POCancelCreate") {
			try {
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_PO_CANCELLATION');
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var PoHeader = oProjectPayload.Value.PO_HEADER;
				var PO_NO = PoHeader[0].SAP_ORDER_NO;
				var PR_NO = PoHeader[0].PR_NO;
				var action = Action;
				var evtno = conn.executeQuery(
			    'SELECT MAX("EVENT_NO") as max_evt FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_EVENTS_COMMENTS\" WHERE PR_NO = ?', parseInt(PR_NO));
				var PoEvents = GetEventNo(evtno[0].MAX_EVT ,oProjectPayload.Value.PO_EVENTS);
				Result = execProcedure(PO_NO,action, PoEvents);
				$.response.setBody(JSON.stringify(Result));
				// $.response.setBody(JSON.stringify(action));
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
		/////
		// Terumo CR : Consignment Order Creation 14.03.2022
		/////
		else if (Action === "CreateConOrder") {

			try {
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_CONSIGNMENT_ORDER_CREATE');
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var PrHeader = oProjectPayload.Value.PR_HEADER;
				var PrSubCode = oProjectPayload.Value.SUB_CODE;
				var PrItems = GenItemNoUnit(oProjectPayload.Value.PR_ITEMS);
				var PrHistory = GenLogNo(oProjectPayload.Value.PR_HISTORY);
				var PrEvents = GneEventNo(oProjectPayload.Value.PR_EVENTS);
				//For Consignment Order
				var BuCode = PrHeader[0].BU_CODE;
				var SubDiv = PrSubCode[0].BU_SUB_CODE;
				var DistID = PrHeader[0].DISTRIBUTOR_ID;
				///
				Result = execProcedure(BuCode,SubDiv,DistID,PrHeader, PrItems, PrHistory, PrEvents);
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
		////////////////////////////////////////////////
		/////////////For New Purchase Reqeusts from Draft ORDER SCENARIOS////////////////////
		else if (Action === "CreateConOrderFromDraft") {
			try {
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var PrHeader = oProjectPayload.Value.PR_HEADER;
				var PrSubCode = oProjectPayload.Value.SUB_CODE;
				var PR_NO = PrHeader[0].PR_NO;
				//Fields to be updated////
				var BU = PrHeader[0].BU_CODE;
				var Ordertype = PrHeader[0].ORDER_TYPE;
				var SubDiv = PrSubCode[0].BU_SUB_CODE;
				var DistID = PrHeader[0].DISTRIBUTOR_ID;
				var shipto = PrHeader[0].SHIP_TO;
				var billto = PrHeader[0].BILL_TO;
				////
				var PrItems = GenItemNoUnit(oProjectPayload.Value.PR_ITEMS);
				var PrHistory = GenLogNo(oProjectPayload.Value.PR_HISTORY);
				var PrEvents = GneEventNo(oProjectPayload.Value.PR_EVENTS);
				
				//Delete Previous Items from Draft Line Items
				conn.executeUpdate('DELETE FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_ITEMS\" WHERE PR_NO = ?', parseInt(PR_NO));
				conn.commit();
				//
                execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_CONSIGNMENT_ORDER_FROM_DRAFT');
				Result = execProcedure(PR_NO, BU,SubDiv, Ordertype,DistID, shipto, billto, PrItems, PrHistory, PrEvents);
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
		////////////////////////////////////////////////
		/////////////Consignment Order Resend from Distributor ////////////////////
		else if (Action === "ResendConOrder") {
			try {
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var PrHeader = oProjectPayload.Value.PR_HEADER;
				var PrSubCode = oProjectPayload.Value.SUB_CODE;
				var PR_NO = PrHeader[0].PR_NO;
				//Fields to be updated////
				var BU = PrHeader[0].BU_CODE;
				var SubDiv = PrSubCode[0].BU_SUB_CODE;
				var DistID = PrHeader[0].DISTRIBUTOR_ID;
				var shipto = PrHeader[0].SHIP_TO;
				var billto = PrHeader[0].BILL_TO;
				////
				var PrItems = GenItemNoUnit(oProjectPayload.Value.PR_ITEMS);
				var evtno = conn.executeQuery(
			    'SELECT MAX("EVENT_NO") as max_evt FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_EVENTS_COMMENTS\" WHERE PR_NO = ?', parseInt(PR_NO));
				var PrEvents = GetEventNo(evtno[0].MAX_EVT ,oProjectPayload.Value.PR_EVENTS);
				
				//Pick next Log no
				var maxlog = conn.executeQuery(
			    'SELECT MAX("LOG_NO") as max_log FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_HISTORY\" WHERE PR_NO = ?', parseInt(PR_NO));
				var PrHistory = NextLogNo(maxlog[0].MAX_LOG ,oProjectPayload.Value.PR_HISTORY);
	
				//Delete Previous Items from Draft Line Items
				conn.executeUpdate('DELETE FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_ITEMS\" WHERE PR_NO = ?', parseInt(PR_NO));
				conn.commit();
				//
                execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_CONSIGNMENT_ORDER_RESEND');
				Result = execProcedure(PR_NO, BU,shipto, billto, SubDiv,DistID, PrHeader, PrItems, PrHistory, PrEvents);
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
	$.response.setBody("Request Creation Failed: " + err.toString());
}