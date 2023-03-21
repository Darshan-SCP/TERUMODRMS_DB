$.response.contentType = "application/json";
$.response.status = 200;
$.response.contentType = "text/plain";

var conn = null,
	sColumnName = '',
	rColumnName = '';

function _addFiltersInWhereCondition(ind, sBaseQuery, oInp) {
	if (oInp) {

		if (ind === 'X') {
			sBaseQuery += ' WHERE';
		}
		if (oInp.Distributor) {
			sBaseQuery += ' AND \"CustomerCode\" = \'' + oInp.Distributor + '\'';
		}
		if (oInp.SONum) {
			sBaseQuery += ' AND \"SO_NUMBER\" = \'' + oInp.SONum + '\'';
		}
		if (oInp.OrderType) {
			sBaseQuery += ' AND \"OrderTypeDesc\" = \'' + oInp.OrderType + '\'';
		}
		if (oInp.Region) {
			sBaseQuery += ' AND \"Region\" = \'' + oInp.Region + '\'';
		}
		if (oInp.StartDate && oInp.EndDate) {
			sBaseQuery += ' AND \"PR_DATE\" >= \'' + oInp.StartDate + '\' AND \"PR_DATE\" <= \'' + oInp.EndDate + '\'';
		}
		sBaseQuery = sBaseQuery.trim();
		if (sBaseQuery.substring(sBaseQuery.length - 5) === 'WHERE') {
			sBaseQuery = sBaseQuery.replace(" WHERE", "");
		}
		sBaseQuery = sBaseQuery.replace("WHERE AND", "WHERE");
	}

	return sBaseQuery;

}

function _passFiltersToViewReport(aFilterResponse, oPostInputObj) {

	var query, sDivVal = '',
		sSubVal = '';

	if (oPostInputObj.Div || oPostInputObj.Subdiv) {

		if (oPostInputObj.Div) {
			sDivVal += "'" + oPostInputObj.Div + "'" + ',';
			sDivVal = sDivVal.substring(0, sDivVal.length - 1);
		}
		if (oPostInputObj.Subdiv) {
			sSubVal += "'" + oPostInputObj.Subdiv + "'" + ',';
			sSubVal = sSubVal.substring(0, sSubVal.length - 1);
		}

	} else {
		for (var i = 0; i < aFilterResponse.length; i++) {
			sDivVal += "'" + aFilterResponse[i].BU_CODE + "'" + ',';
			sSubVal += "'" + aFilterResponse[i].BU_SUB_CODE + "'" + ',';
			if (i === aFilterResponse.length - 1) {
				sDivVal = sDivVal.substring(0, sDivVal.length - 1);
				sSubVal = sSubVal.substring(0, sSubVal.length - 1);
			}
		}
	}

	// query = 'SELECT  \"Division\",\"SubDivision\",\"Region\",\"SA\",\"SM\",\"RH\",\"CustomerCode\",' +
	// 	'\"CustomerName\",\"POType\",\"CustomerPONo\",\"Date\",\"Material\",\"MaterialDesc\",' +
	// 	'\"OrderQuantity\",\"OrderUnitPrice\",\"Discount\",\"OrderNetValue\" ' +
	// 	'FROM \"TERUMODRMS_DB.db.View::TERUMO_BACKORDER_REPORT\" ' +
	// 	'WHERE \"Division\" in (' + sDivVal +
	// 	') AND \"' + rColumnName + '\" = \'' + oPostInputObj.Name + '\'';
	// // ') AND \"SubDivision\" in (' + sSubVal + ')';
	
		query = 'SELECT  \"PR_NO\",\"PR_DATE\",\"SO_NUMBER\",\"SO_CREATION_DATE\",\"OrderTypeCode\",\"OrderTypeDesc\",\"CustomerCode\",' +
			'\"CustomerName\",\"CustomerPaymentMethodCode\",\"CustomerPaymentMethodDesc\",\"Division\",\"SubDivision\",\"Region\",' +
			'\"SA\",\"SM\",\"RH\",\"PI_TOTAL_AMOUNT\" ' +
			'\"PI_WITHOUT_TAX_AMOUNT\",\"PI_WITHOUT_TAX_AMOUNT\",\"PaymentMethodCode\",\"PaymentMethodDesc\",\"Amount\",' +
			'\"FP_PaymentDate\",\"PP_PaymentDate\",\"FP_UTR_NO\",\"PP_UTR_NO\",' +
			'\"PartialAmount\",\"PP_CREDIT_NOTE_NO\",\"PP_CREDIT_NOTE_AMT\",\"SAPEntryRef\",' +
			'\"SOReleaseDate\",\"InvoiceNo\",\"InvoiceDate\",\"ShipmentDate\",\"PaymentRequestNo\" '+
			'FROM \"TERUMODRMS_DB.db.View::TERUMO_CONTROL_RPT\" ' +
		'WHERE \"Division\" in (' + sDivVal +
		') AND \"' + rColumnName + '\" = \'' + oPostInputObj.Name + '\'';
	
	if (sSubVal !== '') {
		query += ' AND \"SubDivision\" in (' + sSubVal + ')';
	}
	// 'WHERE \"Division\" in (' + sDivVal +
	// ') AND \"SubDivision\" in (' + sSubVal + ')';
	var sInd = 'Y';
	query = _addFiltersInWhereCondition(sInd, query, oPostInputObj);
	_fetchData(query);

}

function _getDivAndSubDiv(sUserIdVal, oPostInputObj) {

	var sColumn = sColumnName;
	var pstmt, rs, query,
		aRes = [];
	query = 'SELECT  \"BU_CODE\",\"BU_SUB_CODE\" FROM \"TERUMODRMS_DB.db.Tables::TERUMO_SALESHIERARCHY_MATRIX\" ' +
		'WHERE \"' + sColumn + '\" = ?';
	pstmt = conn.prepareStatement(query);
	pstmt.setString(1, sUserIdVal);
	rs = pstmt.executeQuery();

	while (rs.next()) {

		var record = {};
		record.BU_CODE = rs.getString(1);
		record.BU_SUB_CODE = rs.getString(2);
		aRes.push(record);
	}
	rs.close();
	pstmt.close();

	_passFiltersToViewReport(aRes, oPostInputObj);

}

function _fetchData(eQuery) {

	var pstmt, rs, aResp = [];
	pstmt = conn.prepareStatement(eQuery);
	rs = pstmt.executeQuery();

	while (rs.next()) {

		var record = {};
		record.PR_NO = rs.getBigInt(1);
		record.PR_DATE = rs.getTimestamp(2);
		record.SO_NUMBER = rs.getInt(3);
		record.SO_CREATION_DATE = rs.getTimestamp(4);
		record.OrderTypeCode = rs.getString(5);
		record.OrderTypeDesc = rs.getString(6);
		record.CustomerCode = rs.getString(7);
		record.CustomerName = rs.getString(8);
		record.CustomerPaymentMethodCode = rs.getString(9);
		record.CustomerPaymentMethodDesc = rs.getString(10);
		record.Division = rs.getString(11);
		record.SubDivision = rs.getString(12);
		record.Region = rs.getString(13);
		record.SA = rs.getString(14);
		record.SM = rs.getString(15);
		record.RH = rs.getString(16);
		record.PI_TOTAL_AMOUNT = rs.getDouble(17);
		record.PI_WITHOUT_TAX_AMOUNT = rs.getDouble(18);
		record.PaymentMethodCode = rs.getInt(19);
		record.PaymentMethodDesc = rs.getString(20);
		record.Amount = rs.getDouble(21);
		record.FP_PaymentDate = rs.getTimestamp(22);
		record.PP_PaymentDate = rs.getTimestamp(23);
		record.FP_UTR_NO = rs.getString(24);
		record.PP_UTR_NO = rs.getString(25);
		record.PartialAmount = rs.getDouble(26);
		record.PP_CREDIT_NOTE_NO = rs.getString(27);
		record.PP_CREDIT_NOTE_AMT = rs.getDouble(28);
		record.SAPEntryRef = rs.getString(29);
		record.SOReleaseDate = rs.getTimestamp(30);
		record.InvoiceNo = rs.getString(31);
		record.InvoiceDate = rs.getTimestamp(32);
		record.ShipmentDate = rs.getTimestamp(33);
		record.PaymentRequestNo = rs.getBigInt(34);
		aResp.push(record);
	}
	rs.close();
	pstmt.close();
	conn.close();

	$.response.setBody(JSON.stringify({
		"d": {
			"TotalRecords": aResp.length,
			"results": aResp

		}

	}));

}

function _fetchBackorderRpt(oPostInputObj) {
	//USER_ROLE,NAME (SUSERID == USER_ID)
	var SUSERID = oPostInputObj.Name;
	if (SUSERID) {

		conn = $.db.getConnection();
		var pstmt, rs, query,
			record = {};

		query = 'SELECT top 1 \"USER_ROLE\",\"NAME\" FROM \"TERUMODRMS_DB.db.Tables::TERUMO_USER_MASTER\" ' +
			'WHERE \"USER_ID\" = ?';
		pstmt = conn.prepareStatement(query);
		pstmt.setString(1, SUSERID);
		rs = pstmt.executeQuery();

		while (rs.next()) {
			record.USER_ROLE = rs.getString(1);
			record.NAME = rs.getString(2);
		}
		rs.close();
		pstmt.close();

		switch (record.USER_ROLE) {
		case 'SA':
			rColumnName = 'SA';
			sColumnName = 'SALES_ASSO_ID';
			break;
		case 'SM':
			sColumnName = 'SALES_MGR_ID';
			rColumnName = 'SM';
			break;
		case 'DIST':
			sColumnName = 'DISTRIBUTOR_ID';
			rColumnName = 'CustomerCode';
			break;
		case 'RH':
			sColumnName = 'SALES_REGIONALHEAD_ID';
			rColumnName = 'RH';
			break;
		case 'BUH':
			sColumnName = 'BUH';
			break;
		case 'CC':
			sColumnName = 'CC';
			break;
		case 'FD':
			sColumnName = 'FD';
			break;
		case 'SC':
			sColumnName = 'SC';
			break;
		case 'CM':
			sColumnName = 'CM';
			break;
		default:
			sColumnName = 'ADMIN';
		}

		var sInd = '';
		// var BUHquery = 'SELECT  \"Division\",\"SubDivision\",\"Region\",\"SA\",\"SM\",\"RH\",\"CustomerCode\",' +
		// 	'\"CustomerName\",\"POType\",\"CustomerPONo\",\"Date\",\"Material\",\"MaterialDesc\",' +
		// 	'\"OrderQuantity\",\"OrderUnitPrice\",\"Discount\",\"OrderNetValue\" ' +
		// 	'FROM \"TERUMODRMS_DB.db.View::TERUMO_BACKORDER_REPORT\"';
			
		var BUHquery = 'SELECT  \"PR_NO\",\"PR_DATE\",\"SO_NUMBER\",\"SO_CREATION_DATE\",\"OrderTypeCode\",\"OrderTypeDesc\",\"CustomerCode\",' +
			'\"CustomerName\",\"CustomerPaymentMethodCode\",\"CustomerPaymentMethodDesc\",\"Division\",\"SubDivision\",\"Region\",' +
			'\"SA\",\"SM\",\"RH\",\"PI_TOTAL_AMOUNT\" ' +
			'\"PI_WITHOUT_TAX_AMOUNT\",\"PI_WITHOUT_TAX_AMOUNT\",\"PaymentMethodCode\",\"PaymentMethodDesc\",\"Amount\",' +
			'\"FP_PaymentDate\",\"PP_PaymentDate\",\"FP_UTR_NO\",\"PP_UTR_NO\",' +
			'\"PartialAmount\",\"PP_CREDIT_NOTE_NO\",\"PP_CREDIT_NOTE_AMT\",\"SAPEntryRef\",' +
			'\"SOReleaseDate\",\"InvoiceNo\",\"InvoiceDate\",\"ShipmentDate\",\"PaymentRequestNo\" '+
			'FROM \"TERUMODRMS_DB.db.View::TERUMO_CONTROL_RPT\"';	

		if (sColumnName === 'CC' || sColumnName === 'ADMIN' || sColumnName === 'FD' || sColumnName === 'SC' ||
			sColumnName === 'CM') {

			if (oPostInputObj.Div) {
				BUHquery += ' WHERE \"Division\" = \'' + oPostInputObj.Div + '\'';
				if (oPostInputObj.Subdiv) {
					BUHquery += ' AND \"SubDivision\" = \'' + oPostInputObj.Subdiv + '\'';
				}
			} else {
				sInd = 'X';
			}
			BUHquery = _addFiltersInWhereCondition(sInd, BUHquery, oPostInputObj);
			_fetchData(BUHquery);

		} else if (sColumnName === 'BUH') {

			var pstmt, rs, query,
				aRes = [];
			query = 'SELECT  \"BU_CODE\" FROM \"TERUMODRMS_DB.db.Tables::TERUMO_BUSINESS_UNIT_MASTER\" ' +
				'WHERE \"BU_HEAD_ID\" = ?';
			pstmt = conn.prepareStatement(query);
			pstmt.setString(1, SUSERID);
			rs = pstmt.executeQuery();
			while (rs.next()) {
				var record = {};
				record.BU_CODE = rs.getString(1);
				aRes.push(record);
			}
			rs.close();
			pstmt.close();
			var sDivVal = '';
			for (var i = 0; i < aRes.length; i++) {
				sDivVal += "'" + aRes[i].BU_CODE + "'" + ',';
				if (i === aRes.length - 1) {
					sDivVal = sDivVal.substring(0, sDivVal.length - 1);
				}
			}

			if (oPostInputObj.Div) {
				BUHquery += ' WHERE \"Division\" = \'' + oPostInputObj.Div + '\'';
				if (oPostInputObj.Subdiv) {
					BUHquery += ' AND \"SubDivision\" = \'' + oPostInputObj.Subdiv + '\'';
				}
			} else {
				BUHquery += ' WHERE \"Division\" in (' + sDivVal + ')';
				sInd = 'Y';
			}

			if (!oPostInputObj.Distributor) {
				var pstmt, rs, query,
					aRes = [];
				query = 'SELECT  \"DISTRIBUTOR_ID\" FROM \"TERUMODRMS_DB.db.Tables::TERUMO_SALESHIERARCHY_MATRIX\" ' +
					'WHERE \"BU_CODE\" in (' + sDivVal + ')';
				pstmt = conn.prepareStatement(query);
				rs = pstmt.executeQuery();
				while (rs.next()) {
					var record = {};
					record.DISTRIBUTOR_ID = rs.getString(1);
					aRes.push(record);
				}
				rs.close();
				pstmt.close();
				var distId = '';
				for (var i = 0; i < aRes.length; i++) {
					distId += "'" + aRes[i].DISTRIBUTOR_ID + "'" + ',';
					if (i === aRes.length - 1) {
						distId = distId.substring(0, distId.length - 1);
					}
				}
				BUHquery += 'AND \"CustomerCode\" in (' + distId + ')';
				sInd = 'Y';
			}
			BUHquery = _addFiltersInWhereCondition(sInd, BUHquery, oPostInputObj);
			_fetchData(BUHquery);

		} else {
			_getDivAndSubDiv(SUSERID, oPostInputObj);
		}

	} else {
		throw 'Wrong Input parameters passed';
	}

}

//Implementation of GET call

function fnHandleGet() {

	/*var oInputObj = {
		"payload": [{
			"Distributor": "",
			"EndDate": "",
			"Name": "kaustubh.d@intellectbizware.com",
			"OrderType": "",
			"SONum": "",
			"Region": "",
			"StartDate": "",
			"Div": "TIS",
			"Subdiv": "IO/EVT"
		}]
	};*/

	var oInputObj = JSON.parse($.request.body.asString());
	var dataobj = JSON.stringify(oInputObj);
	dataobj = JSON.parse(dataobj);

	/*sUserLogId = $.request.parameters.get('SUSERLOGID');*/
	if (dataobj && dataobj.payload && dataobj.payload[0]) {
		_fetchBackorderRpt(dataobj.payload[0]);
	} else {
		throw 'Wrong Input Parameters posted while requesting data';
	}

	/*var vs = sUserLogId;*/
}

//Implementation of PUT call
function fnHandlePut() {
	return {
		"SMESSAGE": "Invalid method POST, for this operation"
	};
}

try {
	switch ($.request.method) {
		//Handle your GET calls here
	case $.net.http.GET:
		/*fnHandleGet();*/
		$.response.setBody(JSON.stringify(fnHandlePut()));
		break;
		//Handle your PUT calls here
	case $.net.http.POST:
		fnHandleGet();
		break;
	default:
		break;
	}
} catch (err) {
	$.response.setBody("Failed to execute action: " + err.toString());
}