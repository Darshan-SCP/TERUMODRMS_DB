$.response.contentType = "application/json";
$.response.status = 200;
$.response.contentType = "text/plain";

var conn = null,
	sColumnName = '',
	rColumnName = '';

function _addFiltersInWhereCondition(oInp, sBaseQuery) {
	if (oInp) {
		if (oInp.Finalyear.length) {
			sBaseQuery += 'AND \"FINANCIAL_YEAR\" in (' + oInp.Finalyear + ')';
		}
		if (oInp.Month.length) {
			sBaseQuery += 'AND \"MONTH\" in (' + oInp.Month + ')';
		}
		if (oInp.GPC.length) {
			sBaseQuery += 'AND \"GPC_NAME\" in (' + oInp.GPC + ')';
		}
		
		// sBaseQuery +='GROUP BY \"FINANCIAL_YEAR\"';
		// sBaseQuery += 'AND \"FINANCIAL_YEAR\" =' + '2022-2023';
		_fetchData(sBaseQuery);
	}
}

function _fetchData(eQuery) {

	var pstmt, rs, aResp = [];
	pstmt = conn.prepareStatement(eQuery);
	rs = pstmt.executeQuery();

	while (rs.next()) {
		var record = {};
		// record.DISTRIBUTOR_ID = rs.getString(1);
		// record.BU_CODE = rs.getString(2);
		// record.SUB_DIV = rs.getString(3);
		// record.MATERIAL_CODE = rs.getString(4);
		// record.FINANCIAL_YEAR = rs.getString(5);
		// record.MONTH = rs.getString(6);
		// record.MATERIAL_DESC = rs.getString(7);
		// record.GPC_NAME = rs.getString(8);
		record.NO_OPEN_SO = rs.getInt(1);

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

function _getDivData(SUSERID) {
	var pstmt, rs, query,
		aRes = [];
	query = 'SELECT distinct \"BU_CODE\" FROM \"TERUMODRMS_DB.db.Tables::TERUMO_SALESHIERARCHY_MATRIX\" ' +
		'WHERE \"DISTRIBUTOR_ID\" = ?';
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
	var div = '';
	for (var i = 0; i < aRes.length; i++) {
		div += "'" + aRes[i].BU_CODE + "'" + ',';
		if (i === aRes.length - 1) {
			div = div.substring(0, div.length - 1);
		}
	}
	return div;
}

function _getSubDivData(SUSERID) {
	var pstmt, rs, query,
		aRes = [];
	query = 'SELECT distinct \"BU_SUB_CODE\" FROM \"TERUMODRMS_DB.db.Tables::TERUMO_SALESHIERARCHY_MATRIX\" ' +
		'WHERE \"DISTRIBUTOR_ID\" = ?';
	pstmt = conn.prepareStatement(query);
	pstmt.setString(1, SUSERID);
	rs = pstmt.executeQuery();
	while (rs.next()) {
		var record = {};
		record.BU_SUB_CODE = rs.getString(1);
		aRes.push(record);
	}
	rs.close();
	pstmt.close();
	var subdiv = '';
	for (var i = 0; i < aRes.length; i++) {
		subdiv += "'" + aRes[i].BU_SUB_CODE + "'" + ',';
		if (i === aRes.length - 1) {
			subdiv = subdiv.substring(0, subdiv.length - 1);
		}
	}
	return subdiv;
}

function _fetchDealerRpt(oPostInputObj) {
	//USER_ROLE,NAME (SUSERID == USER_ID)
	var SUSERID = oPostInputObj.Distributor;
	if (SUSERID) {

		conn = $.db.getConnection();
		var pstmt, rs, query,
			record = {};

		var sInd = '';
		// var BUHquery = 'SELECT  \"Division\",\"SubDivision\",\"Region\",\"SA\",\"SM\",\"RH\",\"CustomerCode\",' +
		// 	'\"CustomerName\",\"POType\",\"CustomerPONo\",\"Date\",\"Material\",\"MaterialDesc\",' +
		// 	'\"OrderQuantity\",\"OrderUnitPrice\",\"Discount\",\"OrderNetValue\" ' +
		// 	'FROM \"TERUMODRMS_DB.db.View::TERUMO_BACKORDER_REPORT\"';

		var DSBCountquery =
			'SELECT SUM(\"NO_OPEN_SO\") AS \"NO_OPEN_SO\"' +
			'FROM \"TERUMODRMS_DB.db.View::TERUMO_DSB_SO_COUNTS\" (placeholder."$$DIST_ID$$"=>' + SUSERID + ')';

		// 'SELECT  \"DISTRIBUTOR_ID\",\"BU_CODE\",\"SUB_DIV\",\"MATERIAL_CODE\",\"FINANCIAL_YEAR\",\"MONTH\",\"MATERIAL_DESC\",' +
		// '\"GPC_NAME\" SUM(\"NO_OPEN_SO\") AS \"NO_OPEN_SO\",SUM(\"NO_OF_PI\") AS \"NO_OF_PI\", SUM(\"NO_OF_PAYMENTS\") AS \"NO_OF_PAYMENTS\",' +
		// 'SUM(\"NO_OF_BACK_ORDER\") AS \"NO_OF_BACK_ORDER\"' +
		// 'FROM \"TERUMODRMS_DB.db.View::newTERUMO_DSB_COUNTS\" (placeholder."$$DIST_ID$$"=>' + SUSERID + ')';

		if (!oPostInputObj.Div.length) {
			var div = _getDivData(SUSERID);
			DSBCountquery += 'WHERE \"BU_CODE\" in (' + div + ')';
		} else {
			DSBCountquery += 'WHERE \"BU_CODE\" in (' + oPostInputObj.Div + ')';
		}

		if (!oPostInputObj.Subdiv.length) {
			var subdiv = _getSubDivData(SUSERID);
			DSBCountquery += 'AND \"SUB_DIV\" in (' + subdiv + ')';
		} else {
			DSBCountquery += 'AND \"SUB_DIV\" in (' + oPostInputObj.Subdiv + ')';
		}

		_addFiltersInWhereCondition(oPostInputObj, DSBCountquery);

	} else {
		throw 'Wrong Input parameters passed';
	}

}

//Implementation of GET call

function fnHandleGet() {

	var oInputObj = {
		"payload": [{
			"Distributor": "8000039",
			"Finalyear": [],
			"Month": ['APRIL'],
			"GPC": [],
			"Div": [],
			"Subdiv": []
		}]
	};

	// var oInputObj = JSON.parse($.request.body.asString());
	var dataobj = JSON.stringify(oInputObj);
	dataobj = JSON.parse(dataobj);

	/*sUserLogId = $.request.parameters.get('SUSERLOGID');*/
	if (dataobj && dataobj.payload && dataobj.payload[0]) {
		_fetchDealerRpt(dataobj.payload[0]);
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
		// $.response.setBody(JSON.stringify(fnHandlePut()));
		break;
		//Handle your PUT calls here
	case $.net.http.POST:
		// fnHandleGet();
		break;
	default:
		break;
	}
} catch (err) {
	$.response.setBody("Failed to execute action: " + err.toString());
}