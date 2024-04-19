function buildAddOn(e) {
  // Activate temporary Gmail add-on scopes.
  var accessToken = e.messageMetadata.accessToken;
  GmailApp.setCurrentMessageAccessToken(accessToken);

  var messageId = e.messageMetadata.messageId;
  var message = GmailApp.getMessageById(messageId);

  Logger.log("Beginning Process");

  var apiKey = 'YOUR_API_KEY_HERE';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    
  const payload = {
    contents: [{ parts: [{ text: "This is the text to be analyzed." }] }],
  };
  
  const options = {
    method: "post",
    payload: JSON.stringify(payload),
    contentType: "application/json",
  };

  // Fetch data from the API
  const response = UrlFetchApp.fetch(url, options);

  // Parse the JSON response
  const data = JSON.parse(response.getContentText());

  // Process the response data (e.g., generated text)
  Logger.log(data);

  var sendToDriveLabel = GmailApp.getUserLabelByName("SendToDrive");
  var sentToDriveLabel = GmailApp.getUserLabelByName("SentToDrive");

  var attachmentFolder = DriveApp.getFoldersByName('GmailProcessor-Tests').next();
  Logger.log(attachmentFolder);

  // Look for any email threads that have been labeled by user
  const threads = GmailApp.search('label:"SendToDrive"');
  Logger.log("Threads:")
  Logger.log(threads);

  // Go through threads
  for (const thread of threads) {
    // Get emails in the threads
    const messages = thread.getMessages()

    Logger.log("Messages:")
    Logger.log(messages);

    // Go through all messages and look for stared emails
    for (const message of messages) {
      // Starred doesn't work right now, there are a lot of people that are having problems with
      // starring and unstarring... So I'll try and find a way around it for now.
      // I think it has to do with the green check mark... Who knows.
      var sender = message.getFrom();
      Logger.log(sender);
      var subject = message.getSubject();
      Logger.log(subject);
      var body = message.getBody();
      Logger.log(body);
      var attachments = message.getAttachments();
      for (const attachment of attachments) {
        Logger.log(attachment.getName());
        attachmentFolder.createFile(attachment);
      }
      Logger.log("Is message starred?");
      Logger.log(message.isStarred());
      message.unstar().refresh();
      Logger.log("Is message starred?");
      Logger.log(message.isStarred());
    }
    // change the label of the thread
    // thread.addLabel(sentToDriveLabel);
    // thread.removeLabel(sendToDriveLabel);
  }  
}