$.response.contentType = "application/json";
$.response.status = 200;
$.response.contentType = "text/plain";
var conn = null;
var sColumnName = '';

function _getPONos() {

	var query, pstmt, rs, aPoNo = [];
	// query = 'select distinct \"SAP_ORDER_NO\" from \"TERUMODRMS_DB.db.Tables::TERUMO_PAYMENTS\" ' +
	// 	' WHERE \"PAYMENT_METHOD\" in (1,2,3) order by \"SAP_ORDER_NO\" asc';
	query = 'select distinct \"SAP_ORDER_NO\" from \"TERUMODRMS_DB.db.Tables::TERUMO_PO_HEADER\" ' +
		'order by \"SAP_ORDER_NO\" asc';
	pstmt = conn.prepareStatement(query);
	rs = pstmt.executeQuery();

	while (rs.next()) {

		var record = {};
		record.PO_NO = rs.getBigInt(1);
		aPoNo.push(record);
	}
	rs.close();
	pstmt.close();
	return aPoNo;

}

function _getOrderTypeList() {

	var query, pstmt, rs, aOrderTypes = [];
	query = 'select distinct b.\"ORDER_CODE\", b.\"DESCRIPTION\" from \"TERUMODRMS_DB.db.Tables::TERUMO_PR_HEADER\" as a ' +
		'inner join \"TERUMODRMS_DB.db.Tables::TERUMO_ORDER_TYPE\" as b ' +
		'on a.\"ORDER_TYPE\" = b.\"ORDER_CODE\"';
	pstmt = conn.prepareStatement(query);
	rs = pstmt.executeQuery();

	while (rs.next()) {

		var record = {};
		record.ORDER_CODE = rs.getInt(1);
		record.DESCRIPTION = rs.getString(2);
		aOrderTypes.push(record);
	}
	rs.close();
	pstmt.close();
	return aOrderTypes;

}

function _getDistList(sColumn, sUserIdVal) {

	var sInd = 'Y';
	var pstmt, rs, query,
		aRes = [];

	if (sColumn === "DISTRIBUTOR_ID") {

		query = 'select \"USER_ID\",\"NAME\" from \"TERUMODRMS_DB.db.Tables::TERUMO_USER_MASTER\" where ' +
			'\"USER_ID\" = ?';
	} else if (sColumn === "BUH") {
		var pstmt1, rs1, qry1,
			aDistRes = [];
		qry1 = 'SELECT  \"BU_CODE\" FROM \"TERUMODRMS_DB.db.Tables::TERUMO_BUSINESS_UNIT_MASTER\" ' +
			'WHERE \"BU_HEAD_ID\" = ?';
		pstmt1 = conn.prepareStatement(qry1);
		pstmt1.setString(1, sUserIdVal);
		rs1 = pstmt1.executeQuery();
		while (rs1.next()) {
			var record = {};
			record.BU_CODE = rs1.getString(1);
			aDistRes.push(record);
		}
		rs1.close();
		pstmt1.close();
		var sDivVal = '';
		for (var i = 0; i < aDistRes.length; i++) {
			sDivVal += "'" + aDistRes[i].BU_CODE + "'" + ',';
			if (i === aDistRes.length - 1) {
				sDivVal = sDivVal.substring(0, sDivVal.length - 1);
			}
		}

		var pstmt2, rs2, qry2,
			aDRes = [];
		qry2 = 'SELECT  \"DISTRIBUTOR_ID\" FROM \"TERUMODRMS_DB.db.Tables::TERUMO_SALESHIERARCHY_MATRIX\" ' +
			'WHERE \"BU_CODE\" in (' + sDivVal + ')';
		pstmt2 = conn.prepareStatement(qry2);
		rs2 = pstmt2.executeQuery();
		while (rs2.next()) {
			var record = {};
			record.DISTRIBUTOR_ID = rs2.getString(1);
			aDRes.push(record);
		}
		rs2.close();
		pstmt2.close();
		var distId = '';
		for (var i = 0; i < aDRes.length; i++) {
			distId += "'" + aDRes[i].DISTRIBUTOR_ID + "'" + ',';
			if (i === aDRes.length - 1) {
				distId = distId.substring(0, distId.length - 1);
			}
		}

		query = 'select distinct \"USER_ID\",\"NAME\" from \"TERUMODRMS_DB.db.Tables::TERUMO_USER_MASTER\" where ' +
			'\"USER_ID\"  in (' + distId + ')';
		sInd = 'X';

	} else if (sColumn === 'CC' || sColumn === 'ADMIN' || sColumn === 'FD' || sColumn === 'SC' || sColumn === 'CM') {

		query = 'select \"USER_ID\",\"NAME\" from \"TERUMODRMS_DB.db.Tables::TERUMO_USER_MASTER\" WHERE ' +
			'\"USER_ROLE\" = \'DIST\'';
		sInd = 'X';

	} else {
		query = 'select \"USER_ID\",\"NAME\" from \"TERUMODRMS_DB.db.Tables::TERUMO_USER_MASTER\" where ' +
			'\"USER_ID\" in (select distinct \"DISTRIBUTOR_ID\" from \"TERUMODRMS_DB.db.Tables::TERUMO_SALESHIERARCHY_MATRIX\" ' +
			'WHERE \"' + sColumn + '\" = ?)';
	}

	pstmt = conn.prepareStatement(query);
	if (sInd === 'Y') {
		pstmt.setString(1, sUserIdVal);
	}
	rs = pstmt.executeQuery();
	while (rs.next()) {
		var record = {};
		record.USER_ID = rs.getString(1);
		record.NAME = rs.getString(2);
		aRes.push(record);
	}

	rs.close();
	pstmt.close();
	return aRes;

}

function _getMaterialMaster() {

	var query, pstmt, rs, aMat = [];
	query = 'select \"MATERIAL_CODE\",\"MATERIAL_DESC\" from \"TERUMODRMS_DB.db.Tables::TERUMO_MATERIEL_MASTER\"';
	pstmt = conn.prepareStatement(query);
	rs = pstmt.executeQuery();

	while (rs.next()) {

		var record = {};
		record.MATERIAL_CODE = rs.getString(1);
		record.MATERIAL_DESC = rs.getString(2);
		aMat.push(record);
	}
	rs.close();
	pstmt.close();
	return aMat;

}

function _getSubDiv(sUser) {

	var query, pstmt, rs, aSub = [];

	if (sColumnName === 'BUH') {

		query = 'select b.\"BU_CODE\",b.\"BU_SUB_CODE\",a.\"DESCRIPTION\" from \"TERUMODRMS_DB.db.Tables::TERUMO_BU_SUB_DIV_MASTER\" ' +
			'as b inner join \"TERUMODRMS_DB.db.Tables::TERUMO_BUSINESS_UNIT_MASTER\" as a ' +
			'on b.\"BU_CODE\" = a.\"BU_CODE\" where a.\"BU_HEAD_ID\" = ?';
		pstmt = conn.prepareStatement(query);
		pstmt.setString(1, sUser);
	} else if (sColumnName === 'SALES_ASSO_ID' || sColumnName === 'SALES_MGR_ID' || sColumnName === 'DISTRIBUTOR_ID' || sColumnName ===
		'SALES_REGIONALHEAD_ID') {

		query =
			'SELECT  distinct a.\"BU_CODE\",a.\"BU_SUB_CODE\",b.\"DESCRIPTION\" FROM \"TERUMODRMS_DB.db.Tables::TERUMO_SALESHIERARCHY_MATRIX\" as a ' +
			'inner join \"TERUMODRMS_DB.db.Tables::TERUMO_BU_SUB_DIV_MASTER\" as b on a.\"BU_CODE\" = b.\"BU_CODE\" ' +
			' and a.\"BU_SUB_CODE\" = b.\"BU_SUB_CODE\" WHERE \"' + sColumnName +
			'\" = ?';
		pstmt = conn.prepareStatement(query);
		pstmt.setString(1, sUser);

	} else {
		query = 'select \"BU_CODE\",\"BU_SUB_CODE\",\"DESCRIPTION\" from \"TERUMODRMS_DB.db.Tables::TERUMO_BU_SUB_DIV_MASTER\"'
		pstmt = conn.prepareStatement(query);
	}

	rs = pstmt.executeQuery();

	while (rs.next()) {

		var record = {};
		record.BU_CODE = rs.getString(1);
		record.BU_SUB_CODE = rs.getString(2);
		record.DESCRIPTION = rs.getString(3);
		aSub.push(record);
	}
	rs.close();
	pstmt.close();
	return aSub;

}

function _getDiv(sUserid) {

	var query, pstmt, rs, aDiv = [];
	if (sColumnName === 'BUH') {
		query = 'select \"BU_CODE\",\"DESCRIPTION\" from \"TERUMODRMS_DB.db.Tables::TERUMO_BUSINESS_UNIT_MASTER\" WHERE \"BU_HEAD_ID\" = ?'
		pstmt = conn.prepareStatement(query);
		pstmt.setString(1, sUserid);
	} else if (sColumnName === 'SALES_ASSO_ID' || sColumnName === 'SALES_MGR_ID' || sColumnName === 'DISTRIBUTOR_ID' || sColumnName ===
		'SALES_REGIONALHEAD_ID') {
		query = 'SELECT  distinct a.\"BU_CODE\",b.\"DESCRIPTION\" FROM \"TERUMODRMS_DB.db.Tables::TERUMO_SALESHIERARCHY_MATRIX\" as a ' +
			'inner join \"TERUMODRMS_DB.db.Tables::TERUMO_BUSINESS_UNIT_MASTER\" as b on a.\"BU_CODE\" = b.\"BU_CODE\" WHERE \"' + sColumnName +
			'\" = ?';
		pstmt = conn.prepareStatement(query);
		pstmt.setString(1, sUserid);
	} else {
		query = 'select \"BU_CODE\",\"DESCRIPTION\" from \"TERUMODRMS_DB.db.Tables::TERUMO_BUSINESS_UNIT_MASTER\"'
		pstmt = conn.prepareStatement(query);
	}
	rs = pstmt.executeQuery();

	while (rs.next()) {

		var record = {};
		record.BU_CODE = rs.getString(1);
		record.DESCRIPTION = rs.getString(2);
		aDiv.push(record);
	}
	rs.close();
	pstmt.close();
	return aDiv;
}

function _fetchBackorderDD(SUSERID) {

	if (SUSERID) {

		conn = $.db.getConnection();
		var pstmt, rs, query,
			record = {};

		query = 'SELECT top 1 \"USER_ROLE\" FROM \"TERUMODRMS_DB.db.Tables::TERUMO_USER_MASTER\" ' +
			'WHERE \"USER_ID\" = ?';
		pstmt = conn.prepareStatement(query);
		pstmt.setString(1, SUSERID);
		rs = pstmt.executeQuery();

		while (rs.next()) {
			record.USER_ROLE = rs.getString(1);
		}
		rs.close();
		pstmt.close();

		// if (record && record.USER_ROLE) {

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

		// } else {

		// 	throw 'User logged in is not available in User Master.'
		// }

		var aDistList = _getDistList(sColumnName, SUSERID);
		var aOrderType = _getOrderTypeList();
		var aPONos = _getPONos();
		var aMaterial = _getMaterialMaster();
		var aSubdiv = [];
		var aDiv = [];
		aDiv = _getDiv(SUSERID);
		aSubdiv = _getSubDiv(SUSERID);

		var bDistRole = (sColumnName === 'DISTRIBUTOR_ID') ? 'false' : 'true';
		var bDsDiv = 'false';
		if (sColumnName === 'SALES_ASSO_ID' || sColumnName === 'SALES_MGR_ID' || sColumnName === 'DISTRIBUTOR_ID' || sColumnName ===
			'SALES_REGIONALHEAD_ID') {
			bDsDiv = 'true';
		}
		var oMastersList = {
			"DSDIV": bDsDiv,
			"ROLE": bDistRole,
			"DISTRIBUTORS": aDistList,
			"ORDER_TYPES": aOrderType,
			"PONOLIST": aPONos,
			// "MATERIALS": aMaterial,
			"DIVISIONS": aDiv,
			"SUBDIVISIONS": aSubdiv
		};

		conn.close();
		$.response.setBody(JSON.stringify(oMastersList));

	} else {
		throw 'Wrong Input parameters passed';
	}

}

//Implementation of GET call

function fnHandleGet() {

	var sUserLogId = $.request.parameters.get('SUSERLOGID');
	/*var sUserLogId = 'kaustubhd2310@gmail.com';*/
	if (sUserLogId) {
		_fetchBackorderDD(sUserLogId);
	} else {
		throw 'Wrong Input Parameters passed while requesting data';
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
		//$.response.setBody(JSON.stringify(fnHandlePut()));
		break;
		//Handle your PUT calls here
	case $.net.http.POST:
		$.response.setBody(JSON.stringify(fnHandlePut()));
		/*fnHandleGet();*/
		break;
	default:
		break;
	}
} catch (err) {
	$.response.setBody("Failed to execute action: " + err.toString());
}