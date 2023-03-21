//For Unit Orders
function GenPrNoUnit(max_prno,ItemPld) {
	var maxprno = max_prno;
	for (var i = 0; i < ItemPld.length; i++) {
		ItemPld[i].PR_ITEM_NO = maxprno + 1;
		maxprno = maxprno + 1 ;
	}
	return ItemPld;
}
function GenLogNo(maxlog,LogPayload) {
	var logcalc = maxlog;
	for (var i = 0; i < LogPayload.length; i++) {
		// LogPayload[i].PR_ITEM_NO = i + 1;
		LogPayload[i].LOG_NO = logcalc + 1;
		logcalc = logcalc + 1 ;
	}
	return LogPayload;
}
function GenLogNoAddItems(max_prno,maxlog,LogPayload) {
	var logcalc = maxlog;
	var maxprno = max_prno;
	for (var i = 0; i < LogPayload.length; i++) {
		LogPayload[i].PR_ITEM_NO = maxprno + 1;
		LogPayload[i].LOG_NO = logcalc + 1;
		logcalc = logcalc + 1 ;
		maxprno = maxprno + 1 ;
	}
	return LogPayload;
}
function GneEventNo(maxevt,EventPl) {
	var evtcalc = maxevt;
	for (var i = 0; i < EventPl.length; i++) {
		EventPl[i].EVENT_NO = evtcalc + 1;
		evtcalc = evtcalc + 1 ;
	}
	return EventPl;
}

/////////////Req Order qty and Fullfilled order qty change 11.05.2021//
function GenItemNoUnit(ItemPld) {
	for (var j = 0; j < ItemPld.length; j++) {
		ItemPld[j].FULFILLED_ORDER_QTY = (ItemPld[j].FULFILLED_ORDER_QTY + ItemPld[j].APPROVED_QTY);
		ItemPld[j].APPROVED_QTY =(ItemPld[j].REQ_ORDER_QTY - ItemPld[j].FULFILLED_ORDER_QTY);
	}
	
	return ItemPld;
}
function GenLogNoPart(maxlog,LogPayload) {
	var logcalc = maxlog;
	for (var i = 0; i < LogPayload.length; i++) {
		LogPayload[i].PR_ITEM_NO = i + 1;
		LogPayload[i].LOG_NO = logcalc + 1;
		logcalc = logcalc + 1 ;
	}
	for (var j = 0; j < LogPayload.length; j++) {
		LogPayload[j].FULFILLED_ORDER_QTY = (LogPayload[j].FULFILLED_ORDER_QTY + LogPayload[j].APPROVED_QTY);
		LogPayload[j].APPROVED_QTY =(LogPayload[j].REQ_ORDER_QTY - LogPayload[j].FULFILLED_ORDER_QTY);
	}
	return LogPayload;
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
		///////////////////For Normal PURchase REQUEST CREATION//////////////////////
		if (Action === "RejectCC") {
			try {
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_PR_REJECT');
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var PrHeader = oProjectPayload.Value.PR_HEADER;
				var PR_NO = PrHeader[0].PR_NO;
				var evtno = conn.executeQuery(
			    'SELECT MAX("EVENT_NO") as max_evt FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_EVENTS_COMMENTS\" WHERE PR_NO = ?', parseInt(PR_NO));
				var PrEvents = GneEventNo(evtno[0].MAX_EVT ,oProjectPayload.Value.PR_EVENTS);
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
		} else if (Action === "DelItem") {
			try {
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_PR_LINEITEMDELETE');
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var PrItems = oProjectPayload.Value.PR_ITEMS;
				var PR_NO = PrItems[0].PR_NO;
				var PR_ITEM_NO = PrItems[0].PR_ITEM_NO;
				var maxlog = conn.executeQuery(
			    'SELECT MAX("LOG_NO") as max_log FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_HISTORY\" WHERE PR_NO = ?', parseInt(PR_NO));
				var PrHistory = GenLogNo(maxlog[0].MAX_LOG ,oProjectPayload.Value.PR_HISTORY);
				var evtno = conn.executeQuery(
			    'SELECT MAX("EVENT_NO") as max_evt FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_EVENTS_COMMENTS\" WHERE PR_NO = ?', parseInt(PR_NO));
				var PrEvents = GneEventNo(evtno[0].MAX_EVT ,oProjectPayload.Value.PR_EVENTS);
				//Deleting from PR Items
				for(var i=0; i < PrItems.length ; i++ ){
				conn.executeUpdate('DELETE FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_ITEMS\" WHERE PR_NO = ? AND PR_ITEM_NO = ?', parseInt(PrItems[i].PR_NO) ,parseInt(PrItems[i].PR_ITEM_NO));
				conn.commit();	
				}
				Result = execProcedure(PR_NO, PrHistory, PrEvents);
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
		else if (Action === "AddItem") {
			try {
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_PR_LINEITEMADD');
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var PrItems = oProjectPayload.Value.PR_ITEMS;
				var PR_NO = PrItems[0].PR_NO;
				var PR_KIT = PrItems[0].KIT_TYPE;
			    //Removed Kit Seperation 12.03.2021
				var maxprno = conn.executeQuery(
			    'SELECT MAX("PR_ITEM_NO") as max_prno FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_ITEMS\" WHERE PR_NO = ?', parseInt(PR_NO));
				var PrItemsUnit = GenPrNoUnit(maxprno[0].MAX_PRNO ,oProjectPayload.Value.PR_ITEMS)
				var maxlog = conn.executeQuery(
			    'SELECT MAX("LOG_NO") as max_log FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_HISTORY\" WHERE PR_NO = ?', parseInt(PR_NO));
				var PrHistory = GenLogNoAddItems(maxprno[0].MAX_PRNO ,maxlog[0].MAX_LOG ,oProjectPayload.Value.PR_HISTORY);
				var evtno = conn.executeQuery(
			    'SELECT MAX("EVENT_NO") as max_evt FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_EVENTS_COMMENTS\" WHERE PR_NO = ?', parseInt(PR_NO));
				var PrEvents = GneEventNo(evtno[0].MAX_EVT ,oProjectPayload.Value.PR_EVENTS);
				Result = execProcedure(PrItemsUnit , PrHistory , PrEvents);
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
		////Partial PR Updation Unit//////
		 else if (Action === "PrPartial") {
			try {
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var PrHeader = oProjectPayload.Value.PR_HEADER;
				var PR_NO = PrHeader[0].PR_NO;
				var PR_STS = PrHeader[0].PR_STATUS;
				
				var maxlog = conn.executeQuery(
			    'SELECT MAX("LOG_NO") as max_log FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_HISTORY\" WHERE PR_NO = ?', parseInt(PR_NO));
				var PrHistory = GenLogNoPart(maxlog[0].MAX_LOG ,oProjectPayload.Value.PR_HISTORY);
				var evtno = conn.executeQuery(
			    'SELECT MAX("EVENT_NO") as max_evt FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_EVENTS_COMMENTS\" WHERE PR_NO = ?', parseInt(PR_NO));
				var PrEvents = GneEventNo(evtno[0].MAX_EVT ,oProjectPayload.Value.PR_EVENTS);
				if (PR_STS === '4'){
					//For CC Team added Products // 25.03.2021
			     	var PrItemsNoChange = GenItemNoUnit(oProjectPayload.Value.PR_ITEMS);
					//Regenerate ITEMS of Purchase Request
			      	conn.executeUpdate('DELETE FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_ITEMS\" WHERE PR_NO = ?', parseInt(PR_NO));
			    	conn.commit();
					execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_PR_PARTIALUPDATE');
				    Result = execProcedure(PR_NO,PR_STS, PrItemsNoChange, PrHistory, PrEvents);
				    $.response.setBody(JSON.stringify(Result));
				    // $.response.setBody(JSON.stringify(PrItemsNoChange));
				}
				else if (PR_STS === '3'){
				var PrItemsPrim = GenItemNoUnit(oProjectPayload.Value.PR_ITEMS);	
				//Regenerate ITEMS of Purchase Request
				conn.executeUpdate('DELETE FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_ITEMS\" WHERE PR_NO = ?', parseInt(PR_NO));
				conn.commit();
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_PR_PARTIALUPDATE');
				Result = execProcedure(PR_NO,PR_STS, PrItemsPrim, PrHistory, PrEvents); 
				$.response.setBody(JSON.stringify(Result));
				}
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
		/////Insert SO details from SAP in Table/////////
		else if (Action === "SAPSOUpdt") {
			try {
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_PO_UPDATE');
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var PoHeader = oProjectPayload.Value.PR_HEADER;
				var PR_NO = PoHeader[0].PR_NO;
				var PoItems = oProjectPayload.Value.PR_ITEMS;
				//Kaustubh change for SO Number on SO Insert
				var PO_NO = PoHeader[0].SAP_ORDER_NO;
				var evtno = conn.executeQuery(
			    'SELECT MAX("EVENT_NO") as max_evt FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_EVENTS_COMMENTS\" WHERE PR_NO = ?', parseInt(PR_NO));
				var PrEvents = GneEventNo(evtno[0].MAX_EVT ,oProjectPayload.Value.PR_EVENTS);
				Result = execProcedure(PO_NO,PoHeader, PoItems, PrEvents);
				$.response.setBody(JSON.stringify(Result));
				// $.response.setBody(JSON.stringify(PO_NO));
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
		//Terumo CR :Change for PO Cancellation Line Item Cancel(Not used anymore as per Terumo Decision) -- Kaustubh 03.03.2022
		else if (Action === "POCancel") {
			try {
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_PO_CANCEL');
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var PoItems = oProjectPayload.Value.PO_ITEMS;
				Result = execProcedure(PoItems);
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
		//Terumo CR :Change for PO Cancellation from S/4 and DRMS -- Kaustubh 03.03.2022
		else if (Action === "POCancelApprove") {
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
				var PoEvents = GneEventNo(evtno[0].MAX_EVT ,oProjectPayload.Value.PO_EVENTS);
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
		//Terumo CR :Change for PO Cancellation from S/4 and DRMS -- Kaustubh 03.03.2022
			else if (Action === "POCancelReject") {
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
				var PoEvents = GneEventNo(evtno[0].MAX_EVT ,oProjectPayload.Value.PO_EVENTS);
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
		//Terumo CR :Change for Consignment Order Approval-- Kaustubh 16.03.2022
		else if (Action === "ApproveConOrder") {
			try {
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_CONSIGNMENT_APPROVAL');
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var PrHeader = oProjectPayload.Value.PR_HEADER;
				var PR_NO = PrHeader[0].PR_NO;
				var BuCode = PrHeader[0].BU_CODE;
				var DistID = PrHeader[0].DISTRIBUTOR_ID;
				var ApprLvl = PrHeader[0].APPROVER_LEVEL;
				var CurrApprRole = PrHeader[0].APPROVER_ROLE;
				// var action = Action;
				var evtno = conn.executeQuery(
			    'SELECT MAX("EVENT_NO") as max_evt FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_EVENTS_COMMENTS\" WHERE PR_NO = ?', parseInt(PR_NO));
				var PrEvents = GneEventNo(evtno[0].MAX_EVT ,oProjectPayload.Value.PR_EVENTS);
				Result = execProcedure(PR_NO,BuCode,DistID,ApprLvl,CurrApprRole, PrEvents);
				$.response.setBody(JSON.stringify(Result));
				// $.response.setBody(JSON.stringify(PrHeader));
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
		//Terumo CR :Change for Consignment Order Senback-- Kaustubh 25.03.2022
		else if (Action === "SendBackConOrder") {
			try {
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_CONSIGNMENT_SENDBACK');
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var PrHeader = oProjectPayload.Value.PR_HEADER;
				var PR_NO = PrHeader[0].PR_NO;
				var BuCode = PrHeader[0].BU_CODE;
				var CurrApprRole = PrHeader[0].APPROVER_ROLE;
				// var action = Action;
				var evtno = conn.executeQuery(
			    'SELECT MAX("EVENT_NO") as max_evt FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_EVENTS_COMMENTS\" WHERE PR_NO = ?', parseInt(PR_NO));
				var PrEvents = GneEventNo(evtno[0].MAX_EVT ,oProjectPayload.Value.PR_EVENTS);
				Result = execProcedure(PR_NO,BuCode,CurrApprRole, PrEvents);
				$.response.setBody(JSON.stringify(Result));
				// $.response.setBody(JSON.stringify(PrEvents));
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
		// Terumo CR :Change for Consignment Order AR Reject-- Kaustubh 17.05.2022
		else if (Action === "RejectCON") {
			try {
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_CONSIGNMENT_REJECT');
				var dataobj = JSON.stringify(oProjectPayload);
				var oPayload = dataobj.substring(1, dataobj.length - 1);
				oProjectPayload = JSON.parse(oPayload);
				var PrHeader = oProjectPayload.Value.PR_HEADER;
				var PR_NO = PrHeader[0].PR_NO;
				var evtno = conn.executeQuery(
			    'SELECT MAX("EVENT_NO") as max_evt FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PR_EVENTS_COMMENTS\" WHERE PR_NO = ?', parseInt(PR_NO));
				var PrEvents = GneEventNo(evtno[0].MAX_EVT ,oProjectPayload.Value.PR_EVENTS);
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