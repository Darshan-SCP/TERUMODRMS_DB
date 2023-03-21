//Mail Function
function ARMailNotification(CGMYPayload) {
	
	//Fetch AR Mail ID's
	var conn1 = $.hdb.getConnection();
	var mailline =[];
	var Maildata = conn1.executeQuery(
			    'SELECT EMAIL FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_USER_MASTER\" WHERE USER_ROLE = ?', 'AR');
	for (i = 0; i < Maildata.length; i++) {
		mailline.push({address: Maildata[i].EMAIL, nameEncoding: "US-ASCII"})
	}
	//Looping SO Orders for Mail
	var SONumbers = '';
	for (j = 0; j < CGMYPayload.length; j++) {
		SONumbers = SONumbers + CGMYPayload[j].SAP_ORDER_NO + ',';
	}	
	SONumbers = SONumbers.substring(0, SONumbers.length - 1);
   
    //Mail Body
    var Emailbody = "Dear Team,\n";
	var Emailbody1 = "The following Sales Orders are pending release of Delivery block: " + SONumbers + ".\n"+
			"\nPlease login to the DRMS portal and take necessary action:\n" +
			"https://terumodrmsdev.cpp.cfapps.ap11.hana.ondemand.com/site/IDealMpr#consmtdelblockrelease-Display" +"\n\nBest Regards" +
			"\nTerumo DRMS Team";		
	Emailbody = Emailbody + Emailbody1;
	
var mail = new $.net.Mail({
  sender: {address: "terumo_one@terumoindia.in"},
  to: mailline,
  //cc: ["cc1@sap.com", {address: "cc2@sap.com"}],
  //bcc: [{ name: "Jonnie Doe", address: "jonnie.doe@sap.com"}],
  subject: "DRMS : Delivery Block Pending release for Consignment Order",
  subjectEncoding: "UTF-8",
  parts: [ new $.net.Mail.Part({
      type: $.net.Mail.Part.TYPE_TEXT,
      text: Emailbody,
      contentType: "text/plain",
      encoding: "UTF-8",
  })]
});
var returnValue = mail.send();
// var response = "MessageId = " + returnValue.messageId + ", final reply = " + returnValue.finalReply;

// $.response.status = $.net.http.OK;
// $.response.contentType = "text/html";
// $.response.setBody(response);
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
		// var Action = "Material";
		var execProcedure;
		var Result;
		if (oProjectPayload.Value.Action[0].Flag === "Material") {
			try {
				// var dataobj = JSON.stringify(oProjectPayload);
				// var oPayload = dataobj.substring(1, dataobj.length - 1);
				// oProjectPayload = JSON.parse(oPayload);
				var mat = oProjectPayload.Value.MATERIAL;
				// conn.executeUpdate('DELETE FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_MATERIEL_MASTER\"';
				// conn.commit();
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_MATERIEL_CREATE');
				Result = execProcedure(mat);
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
		} else if (oProjectPayload.Value.Action[0].Flag === "Customer") {
			try {
				// var dataobj = JSON.stringify(oProjectPayload);
				// var oPayload = dataobj.substring(1, dataobj.length - 1);
				// oProjectPayload = JSON.parse(oPayload);
				var cust = oProjectPayload.Value.CUSTOMER;
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_CUST_CREATE');
				Result = execProcedure(cust);
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
		} else if (oProjectPayload.Value.Action[0].Flag === "InvoiceCRT") {
			try {
				// 		var dataobj = JSON.stringify(oProjectPayload);
				// 		var oPayload = dataobj.substring(1, dataobj.length - 1);
				// 		oProjectPayload = JSON.parse(oPayload);
				var invoice = oProjectPayload.Value.INVOICE;
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_INVOICE_CREATE');
				Result = execProcedure(invoice);
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
		} else if (oProjectPayload.Value.Action[0].Flag === "InvoiceUPD") {
			try {
				// 		var dataobj = JSON.stringify(oProjectPayload);
				// 		var oPayload = dataobj.substring(1, dataobj.length - 1);
				// 		oProjectPayload = JSON.parse(oPayload);
				var invoice = oProjectPayload.Value.INVOICE;
				for (i = 0; i < invoice.length; i++) {
					conn.executeUpdate(
						'DELETE FROM \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_INVOICE_MASTER\" WHERE INVOICE_NO = ? AND INVOICE_ITEMNO = ?',
						invoice[i].INVOICE_NO, invoice[i].INVOICE_ITEMNO);
					conn.commit();
				}

				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_INVOICE_CREATE');
				Result = execProcedure(invoice);
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
		} else if (oProjectPayload.Value.Action[0].Flag === "Factory") {
			try {
				// var dataobj = JSON.stringify(oProjectPayload);
				// var oPayload = dataobj.substring(1, dataobj.length - 1);
				// oProjectPayload = JSON.parse(oPayload);
				var fact = oProjectPayload.Value.FACTORY;
				execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_FACTORY_CREATE');
				Result = execProcedure(fact);
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
		//Change for Consignment KAustubh 11.05.2022
		 else if (oProjectPayload.Value.Action[0].Flag ===  "CON_DEL_UPDATE") {
			try {
				// var date = new Date();
				var congmet = oProjectPayload.Value.CONSIGNMENT;
				
                for (i = 0; i < congmet.length; i++) {
					conn.executeUpdate(
						'UPDATE \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PO_HEADER\" SET DEL_NO = ?, DEL_DATE = ?, DEL_STATUS = ? WHERE SAP_ORDER_NO=?',
						congmet[i].DEL_NO , congmet[i].DEL_DATE , 42 ,congmet[i].SAP_ORDER_NO );
					conn.commit();
				}
				$.response.setBody(JSON.stringify(congmet.length + ' Orders updated'));
				$.response.contentType = "application/json";
				$.response.status = 200;
				$.response.contentType = "text/plain";
				//Mail to be sent to AR Team
				ARMailNotification(congmet);
				
			} catch (e) {
				conn.rollback();
				$.response.setBody(e.message);
				$.response.contentType = "text/plain";
				$.response.status = 400;
			} finally {
				conn.close();
			}
		}
		//Change for Consignment KAustubh 11.05.2022
		 else if (oProjectPayload.Value.Action[0].Flag ===  "CON_DEL_MAILTEST") {
			try {
				var date = new Date();
				var congmet = oProjectPayload.Value.CONSIGNMENT;
				
    //          for (i = 0; i < congmet.length; i++) {
				// 	conn.executeUpdate(
				// 		'UPDATE \"TERUMODRMS_DB_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_PO_HEADER\" SET DEL_NO = ?, DEL_DATE = ? WHERE SAP_ORDER_NO=?',
				// 		congmet[i].DEL_NO , date , congmet[i].SAP_ORDER_NO );
				// 	conn.commit();
				// }
				// $.response.setBody(JSON.stringify(congmet.length + ' Orders updated'));
				ARMailNotification(congmet);
				// $.response.contentType = "application/json";
				// $.response.status = 200;
				// $.response.contentType = "text/plain";
				
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