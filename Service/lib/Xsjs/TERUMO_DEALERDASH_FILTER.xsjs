$.response.contentType = "application/json";
$.response.status = 200;
$.response.contentType = "text/plain";
var conn = null;

function _fetchDealerDashRpt(oPostInputObj) {
	conn = $.db.getConnection();
	var sDiv = _getDiv(oPostInputObj);
	var sSubDiv = _getSubDiv(oPostInputObj);
	var sGPCName = _getGPCName(oPostInputObj);
	var oMastersList = {
		"GPC": sGPCName,
		"DIVISIONS": sDiv,
		"SUBDIVISIONS": sSubDiv
	};
	conn.close();
	$.response.setBody(JSON.stringify(oMastersList));
}

function _getGPCName(oPostInputObj) {
	var DISTID = oPostInputObj.Distributor;
	if (DISTID) {
		var pstmt, rs, query,
			aData = [];
		query = 'SELECT distinct \"BU_CODE\",\"BU_SUB_CODE\" FROM \"TERUMODRMS_DB.db.Tables::TERUMO_SALESHIERARCHY_MATRIX\" ' +
			'WHERE \"DISTRIBUTOR_ID\" = ?';
		pstmt = conn.prepareStatement(query);
		pstmt.setString(1, DISTID);
		rs = pstmt.executeQuery();
		while (rs.next()) {
			aData.push({
				"BU_CODE": rs.getString(1),
				"BU_SUB_CODE": rs.getString(2)
			});
		}
		rs.close();
		pstmt.close();

		// _GetGPCData(aData);
		var pstmt, rs, query,
			record = {},
			sData = [],
			sDivVal = '',
			sSubVal = '';
		for (var i = 0; i < aData.length; i++) {
			sDivVal += "'" + aData[i].BU_CODE + "'" + ',';
			sSubVal += "'" + aData[i].BU_SUB_CODE + "'" + ',';
			if (i === aData.length - 1) {
				sDivVal = sDivVal.substring(0, sDivVal.length - 1);
				sSubVal = sSubVal.substring(0, sSubVal.length - 1);
			}
		}
		query = 'SELECT distinct \"GPC_NAME\",\"BU_CODE\",\"SUB_DIV\" ' +
			'FROM \"TERUMODRMS_DB.db.Tables::TERUMO_MATERIEL_MASTER\" ' +
			'WHERE \"BU_CODE\" in (' + sDivVal +
			') AND \"SUB_DIV\" in (' + sSubVal + ')';

		pstmt = conn.prepareStatement(query);
		rs = pstmt.executeQuery();
		while (rs.next()) {
			sData.push({
				"GPC": rs.getString(1),
				"BU_CODE": rs.getString(2),
				"BU_SUB_CODE": rs.getString(3)
			});
		}
		rs.close();
		pstmt.close();
		return sData;
	}
}

function _GetGPCData(data) {
	var pstmt, rs, query,
		record = {},
		aData = [],
		sDivVal = '',
		sSubVal = '';
	for (var i = 0; i < data.length; i++) {
		sDivVal += "'" + data[i].BU_CODE + "'" + ',';
		sSubVal += "'" + data[i].BU_SUB_CODE + "'" + ',';
		if (i === data.length - 1) {
			sDivVal = sDivVal.substring(0, sDivVal.length - 1);
			sSubVal = sSubVal.substring(0, sSubVal.length - 1);
		}
	}
	query = 'SELECT distinct \"GPC_NAME\" ' +
		'FROM \"TERUMODRMS_DB.db.Tables::TERUMO_MATERIEL_MASTER\" ' +
		'WHERE \"BU_CODE\" in (' + sDivVal +
		') AND \"SUB_DIV\" in (' + sSubVal + ')';

	pstmt = conn.prepareStatement(query);
	rs = pstmt.executeQuery();
	while (rs.next()) {
		aData.push(rs.getString(1));
	}
	rs.close();
	pstmt.close();
	return aData;
}

function _getDiv(oPostInputObj) {
	var DISTID = oPostInputObj.Distributor;
	if (DISTID) {
		var pstmt, rs, query, aDiv = [];
		query = 'SELECT distinct \"BU_CODE\" FROM \"TERUMODRMS_DB.db.Tables::TERUMO_SALESHIERARCHY_MATRIX\" ' +
			'WHERE \"DISTRIBUTOR_ID\" = ?';
		pstmt = conn.prepareStatement(query);
		pstmt.setString(1, DISTID);
		rs = pstmt.executeQuery();
		while (rs.next()) {
			aDiv.push({
				"BU_CODE": rs.getString(1)
			});
		}
		rs.close();
		pstmt.close();
		return aDiv;
	}
}

function _getSubDiv(oPostInputObj) {
	var DISTID = oPostInputObj.Distributor;
	if (DISTID) {
		var pstmt, rs, query,
			aSubDiv = [];
		query = 'SELECT distinct \"BU_SUB_CODE\",\"BU_CODE\" FROM \"TERUMODRMS_DB.db.Tables::TERUMO_SALESHIERARCHY_MATRIX\" ' +
			'WHERE \"DISTRIBUTOR_ID\" = ?';
		pstmt = conn.prepareStatement(query);
		pstmt.setString(1, DISTID);
		rs = pstmt.executeQuery();
		while (rs.next()) {
			aSubDiv.push({
				"BU_SUB_CODE": rs.getString(1),
				"BU_CODE": rs.getString(2)
			});
		}
		rs.close();
		pstmt.close();
		return aSubDiv;
	}
}

//Implementation of GET call
function fnHandleGet() {

	var sUserLogId = $.request.parameters.get('DISTID');
	// var sUserLogId = '8000039';
	if (sUserLogId) {
		var obj = {
			"Distributor": sUserLogId
		}
		_fetchDealerDashRpt(obj);
	} else {
		throw 'Wrong Input Parameters passed while requesting data';
	}
	// var oInputObj = {
	// 	"payload": [{
	// 		"Distributor": "8000039"
	// 	}]
	// };
	// var oInputObj = JSON.parse($.request.body.asString());
	// var dataobj = JSON.stringify(oInputObj);
	// dataobj = JSON.parse(dataobj);
	// if (dataobj && dataobj.payload && dataobj.payload[0]) {
	// 	_fetchDealerDashRpt(dataobj.payload[0]);
	// } else {
	// 	throw 'Wrong Input Parameters posted while requesting data';
	// }
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

		break;
		//Handle your PUT calls here
	case $.net.http.POST:
		$.response.setBody(JSON.stringify(fnHandlePut()));
		// fnHandleGet();
		break;
	default:
		break;
	}
} catch (err) {
	$.response.setBody("Failed to execute action: " + err.toString());
}