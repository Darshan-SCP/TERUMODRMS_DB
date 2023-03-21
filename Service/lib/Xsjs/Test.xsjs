//create email from JS Object and send
var mail = new $.net.Mail({
   sender: {address: "terumo_one@terumoindia.in"},
   to: [{ name: "John Doe", address: "kaustubh.d@intellectbizware.com", nameEncoding: "US-ASCII"}],
   //cc: ["cc1@sap.com", {address: "cc2@sap.com"}],
   //bcc: [{ name: "Jonnie Doe", address: "jonnie.doe@sap.com"}],
   subject: "subject",
   subjectEncoding: "UTF-8",
   parts: [ new $.net.Mail.Part({
       type: $.net.Mail.Part.TYPE_TEXT,
       text: "The body of the mail.",
       contentType: "text/plain",
       encoding: "UTF-8",
   })]
});
var returnValue = mail.send();
var response = "MessageId = " + returnValue.messageId + ", final reply = " + returnValue.finalReply;

$.response.status = $.net.http.OK;
$.response.contentType = "text/html";
$.response.setBody(response);