

//The listener calls this script on the caller domain and checks whether there is a message in the caller message queue


var wp       = google.gears.workerPool;
wp.allowCrossOrigin();
wp.onmessage = function(a, b, message) {
	
	var origin = new String(message.origin);
	var parts  = origin.split("/");
	var domain = parts[2];
	parts      = domain.split(":"); // remove port
	domain     = parts[0];
	
	var recipient = domain;
	var channelId = message.text;
	

	var db = google.gears.factory.create('beta.database');
	db.open('database-xssinterface');
	db.execute('create table if not exists XSSMessageQueue' +
           ' (id INTEGER PRIMARY KEY AUTOINCREMENT, recipient_domain TEXT, channel_id TEXT, message TEXT, insert_time INTEGER)');
	
	// delete (and thus ignore) old messages
	var maxAge = new Date().getTime() - 2000;
	db.execute('delete from XSSMessageQueue where insert_time < ?',[maxAge]);
	
	// find new messages for me
	var rs = db.execute('select id, message from XSSMessageQueue where recipient_domain = ? and channel_id = ?', [recipient, channelId]);

	// there is a new message for the recipient
	if(rs.isValidRow()) {
		
		var id   = rs.field(0);
		var text = rs.field(1);
		db.execute("DELETE from XSSMessageQueue where id=?", [id]); // unqueue message
		wp.sendMessage(text, message.sender)
	}

	rs.close();
}
