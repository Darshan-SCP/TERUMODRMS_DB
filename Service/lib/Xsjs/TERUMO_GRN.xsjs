$.response.contentType = "application/json";
$.response.status = 200;
$.response.contentType = "text/plain";

function samplePayload() {
	var payload = {
		"VALUE": {
			"DATA":  [
				{
					"DEL_NO" : 8140000347,
					"INVOICE_NO": 9140000517,
                    "SAP_ORDER_NO": 1140000649,
					"DISTRIBUTOR_ID" : "D0001",
					"SHIPPING_POINT" : "KOL",
					"LR_NO" : 1,
					"TRANSPORTER" : "DHL",
					"MATERIAL" : "MT001",
					"BATCH" : "B0001",
					"DISPATCH_DATE" : "2021-02-25T10:10:10",
                	"ACCEPTED_ON" : "2021-02-22T10:10:10",
					"STATUS" : "Accepted"
				},
				{
					"DEL_NO" : 8140000347,
					"INVOICE_NO": 9140000517,
                    "SAP_ORDER_NO": 1140000649,
					"DISTRIBUTOR_ID" : "D0001",
					"SHIPPING_POINT" : "KOL",
					"LR_NO" : 1,
					"TRANSPORTER" : "DHL",
					"MATERIAL" : "MT001",
					"BATCH" : "B0001",
					"DISPATCH_DATE" : "2021-02-25T10:10:10",
                	"ACCEPTED_ON" : "2021-02-22T10:10:10",
					"STATUS" : "Accepted"
				}
			]
		}
	};
	
	return payload;
}

function GenGRNNo(GRNItem) {
	for (var i = 0; i < GRNItem.length; i++) {
		GRNItem[i].GRN_NO = i + 1;
	}
	return GRNItem;
}

function responseInfo(setBody, contentType, status) {
	$.response.setBody(setBody);
	$.response.contentType = contentType;
	$.response.status = status;
}

//Implementation of POST call
function fnHandlePost() {
	// var sAction = $.request.parameters.get('ACTION');
	var oPayload = JSON.parse($.request.body.asString());
	// var oPayload = samplePayload();
	
	if (oPayload.VALUE) {
		var conn = $.hdb.getConnection();
		var execProcedure;
		var Result;

		try {
			execProcedure = conn.loadProcedure('TERUMODRMS_DB.db.Procedure::TERUMO_GRN');
		
			var aDataObj = GenGRNNo(oPayload.VALUE.DATA); //array
			var delNo = aDataObj[0].DEL_NO;
			var orderNo = aDataObj[0].SAP_ORDER_NO;
			Result = execProcedure(delNo,orderNo,aDataObj);
				$.response.setBody(JSON.stringify(Result));
				$.response.contentType = "application/json";
				$.response.status = 200;
				$.response.contentType = "text/plain";
		} catch (e) {
			conn.rollback();
			responseInfo(err, "text/plain", 400);
		} finally {
			conn.close();
		}
		
	} else {
		// return {"error":"Undefined Payload"};
		var errorObj = "Undefined Action";
		responseInfo(JSON.stringify(errorObj), "text/plain", 400);
	}
}

//Implementation of GET call
function fnHandleGet() {
	return "Method not supported while posting data : GET";
}

try {
    switch ( $.request.method ) {
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
    $.response.setBody("GRN Creation Failed: " + err.toString());
}