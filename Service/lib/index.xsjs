/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict"

var conn = $.hdb.getConnection()
var query =
    'SELECT * FROM \"DBTEST_HDI_DB_1\".\"TERUMODRMS_DB.db.Tables::TERUMO_ATTACHMENT_TYPE_copy\"'
var rs = conn.executeQuery(query)
$.response.setBody(JSON.stringify(rs))
$.response.contentType = "application/json"
$.response.status = $.net.http.OK