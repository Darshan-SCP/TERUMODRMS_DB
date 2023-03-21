$.response.contentType = "application/json";
$.response.status = 200;
$.response.contentType = "text/plain";

var conn = null,
	sColumnName = '';

function _addFiltersInWhereCondition(ind, sBaseQuery, oInp) {
	if (oInp) {

		if (ind === 'X') {
			sBaseQuery += ' WHERE';
		}
		if (oInp.Distributor) {
			sBaseQuery += ' AND \"CustomerCode\" = \'' + oInp.Distributor + '\'';
		}
		if (oInp.PRNum) {
			sBaseQuery += ' AND \"CustomerPONo\" = \'' + oInp.PRNum + '\'';
		}
		if (oInp.OrderType) {
			sBaseQuery += ' AND \"POType\" = \'' + oInp.OrderType + '\'';
		}
		if (oInp.Material) {
			sBaseQuery += ' AND \"Material\" = \'' + oInp.Material + '\'';
		}
		if (oInp.Region) {
			sBaseQuery += ' AND \"Region\" = \'' + oInp.Region + '\'';
		}
		if (oInp.StartDate && oInp.EndDate) {
			sBaseQuery += ' AND \"Date\" >= \'' + oInp.StartDate + '\' AND \"Date\" <= \'' + oInp.EndDate + '\'';
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

	if (oPostInputObj.Div && oPostInputObj.Subdiv) {

		if (oPostInputObj.Div) {
			sDivVal += "'" + oPostInputObj.Div + "'" + ',';
		}
		if (oPostInputObj.Subdiv) {
			sSubVal += "'" + oPostInputObj.Subdiv + "'" + ',';
		}
		sDivVal = sDivVal.substring(0, sDivVal.length - 1);
		sSubVal = sSubVal.substring(0, sSubVal.length - 1);
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

	query = 'SELECT  \"Division\",\"SubDivision\",\"Region\",\"SA\",\"SM\",\"RH\",\"CustomerCode\",' +
		'\"CustomerName\",\"POType\",\"CustomerPONo\",\"Date\",\"Material\",\"MaterialDesc\",' +
		'\"OrderQuantity\",\"OrderUnitPrice\",\"Discount\",\"OrderNetValue\" ' +
		'FROM \"TERUMODRMS_DB.db.View::TERUMO_BACKORDER_REPORT\" ' +
		'WHERE \"Division\" in (' + sDivVal +
		') AND \"SubDivision\" in (' + sSubVal + ')';
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
		record.Division = rs.getString(1);
		record.SubDivision = rs.getString(2);
		record.Region = rs.getString(3);
		record.SA = rs.getString(4);
		record.SM = rs.getString(5);
		record.RH = rs.getString(6);
		record.CustomerCode = rs.getString(7);
		record.CustomerName = rs.getString(8);
		record.POType = rs.getString(9);
		record.CustomerPONo = rs.getBigInt(10);
		record.Date = rs.getTimestamp(11);
		record.Material = rs.getString(12);
		record.MaterialDesc = rs.getString(13);
		record.OrderQuantity = rs.getInt(14);
		record.OrderUnitPrice = rs.getDouble(15);
		record.Discount = rs.getDouble(16);
		record.OrderNetValue = rs.getDouble(17);
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
			sColumnName = 'SALES_ASSO_ID';
			break;
		case 'SM':
			sColumnName = 'SALES_MGR_ID';
			break;
		case 'DIST':
			sColumnName = 'DISTRIBUTOR_ID';
			break;
		case 'RH':
			sColumnName = 'SALES_REGIONALHEAD_ID';
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
		var BUHquery = 'SELECT  \"Division\",\"SubDivision\",\"Region\",\"SA\",\"SM\",\"RH\",\"CustomerCode\",' +
			'\"CustomerName\",\"POType\",\"CustomerPONo\",\"Date\",\"Material\",\"MaterialDesc\",' +
			'\"OrderQuantity\",\"OrderUnitPrice\",\"Discount\",\"OrderNetValue\" ' +
			'FROM \"TERUMODRMS_DB.db.View::TERUMO_BACKORDER_REPORT\"';

		if (sColumnName === 'BUH' || sColumnName === 'CC' || sColumnName === 'ADMIN' || sColumnName === 'FD' || sColumnName === 'SC' ||
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

		} else {
			_getDivAndSubDiv(SUSERID, oPostInputObj);
		}

	} else {
		throw 'Wrong Input parameters passed';
	}

}

//Implementation of GET call

function fnHandleGet() {

	var oInputObj = {
		"payload": [{
			"Distributor": "",
			"EndDate": "",
			"Material": "",
			"Name": "kaustubh.d@intellectbizware.com",
			"OrderType": "",
			"PRNum": "",
			"Region": "",
			"StartDate": "",
			"Div": "TIS",
			"Subdiv": "IO/EVT"
		}]
	};

	/*var oInputObj = JSON.parse($.request.body.asString());*/
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
		fnHandleGet();
		/*$.response.setBody(JSON.stringify(fnHandlePut()));*/
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