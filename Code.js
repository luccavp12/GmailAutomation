function geminiCall(sender, subject, body, textContent, folderString) {
  var apiKey = 'YOUR_API_KEY_HERE';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  // Payload for my api call that will prompt Gemini to decide out of 
  // the string of folder names, which one to place the text content inside of
  const payload = {
    contents: [{
      parts: [{
        text: "**Email:**\n" + "Sender: " + sender + "\nSubject: " + subject + "\n\nEmail Message:\n" + body + "\n\nAttachment:\n" + textContent + "\n\nAbove is an email sent by a customer, it includes the customer's email, subject of the message, the message, and the attachment to the email. I have a Google Drive setup, and in my Drive are folders. Each folder is dedicated to a customer. I need your help deciding which folder this email should go into. Which of the following folders would you organize this email into?\n" + folderString + "\nThe only thing you will return is the 0-index of the folder in the list of folders provided to you. For example, if you think the text should go in the first folder name in the list above, then you would return 0, if it was the second folder, you would return 1, and so on. If you are not 100% certain that there is a folder that you would like to place this text in, create a new folder name based on the overal context of their email."
      }]
    }]
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

  return data;
}

function getChildFolderString(attachmentFolder) {
  subFoldersIter = attachmentFolder.getFolders()
  subFolders = []
  idArray = []
  while (subFoldersIter.hasNext()) {
    var folder = subFoldersIter.next();
    subFolders.push(folder.getName());
    idArray.push(folder.getId());
  }

  folderString = subFolders.join(", ");
  Logger.log(folderString);

  return [folderString, idArray];
}

// file = Drive file type
function getPDFExtractedText(file, parentFolderId) {
  // Check if the file is a PDF
  if (file.getMimeType() !== MimeType.PDF) {
    throw new Error("This function only supports PDF files.");
  }

  const {id, name} = Drive.Files.create(
    {
      name: file.getName().replace(/\.pdf$/, ''), 
      mimeType: MimeType.GOOGLE_DOCS,
      parents: [parentFolderId]
    },
    file.getBlob(),
    {
      ocrLanguage: "en",
      fields: 'id,name'
    }
  );

  const textContent = DocumentApp.openById(id).getBody().getText();

  // Delete the temporary Google Document since it is no longer needed
  DriveApp.getFileById(id).setTrashed(true);
  
  // Logger.log(textContent);

  return textContent;
}


function getLabeledThreads() {
  
}

function setThreadLabel(thread) {
    // change the label of the thread
    thread.addLabel(sentToDriveLabel);
    thread.removeLabel(sendToDriveLabel);

    return thread
}


function buildAddOn(e) {
  // Activate temporary Gmail add-on scopes.
  var accessToken = e.messageMetadata.accessToken;
  GmailApp.setCurrentMessageAccessToken(accessToken);

  var messageId = e.messageMetadata.messageId;
  var message = GmailApp.getMessageById(messageId);

  var cards = [];

  Logger.log("Beginning Process");
  
  var sendToDriveLabel = GmailApp.getUserLabelByName("SendToDrive");
  var sentToDriveLabel = GmailApp.getUserLabelByName("SentToDrive");

  // Get the root folder that contains all of the organized folders and attachment uploads
  // Ex:
  //    GmailProcessor/ // This is the root folder
  //        PsailaElectric/
  //            invoice3.pdf
  //        KauaiSoap/
  //            invoice4.pdf
  var attachmentFolder = DriveApp.getFoldersByName('GmailProcessor-Tests').next();
  Logger.log("Attachment Folder:");
  Logger.log(attachmentFolder);

  // folderString will be a String return type of a comma serpated list of all of the children folders
  // In the above example, it would be "PsailaElectric, KauaiSoap"
  // We will use this string for our input into Gemini/GenAI
  const folderResult = getChildFolderString(attachmentFolder);

  const folderString = folderResult[0]
  const idArray = folderResult[1]
  Logger.log("IdArray:");
  Logger.log(idArray);


  // Look for any email threads that have been labeled by user
  const threads = GmailApp.search('label:"SendToDrive"');
  Logger.log("Threads:")
  Logger.log(threads);
  

  // Go through threads
  for (const thread of threads) {
    // Get emails in the threads
    const messages = thread.getMessages()

    const cardSection = CardService.newCardSection();

    // Go through all messages
    for (const message of messages) {
      var sender = message.getFrom();
      // Logger.log(sender);
      
      var subject = message.getSubject();
      // Logger.log(subject);
      
      var body = message.getBody();
      // Logger.log(body);

      // Go through attachments and decide where to put them
      var attachments = message.getAttachments();
      for (const attachment of attachments) {
        Logger.log("Attachment Name:");
        Logger.log(attachment.getName());
        cardSection.addWidget(
          CardService.newTextParagraph().setText("<b>" + attachment.getName() + "</b>"));
        
        // Add each attachment to general Drive folder
        // Upload the pdf to Drive
        const file = attachmentFolder.createFile(attachment);

        // If the attachment is a PDF, get the text content
        textContent = getPDFExtractedText(file, attachmentFolder.getId());

        // Gemini Call for the correct folder the invoice should go in
        const data = geminiCall(sender, subject, body, textContent, folderString);

        Logger.log("Predicted folder index:");
        const predictedFolderIndex = data.candidates[0].content.parts[0].text;
        Logger.log(predictedFolderIndex);

        Logger.log("Predicted folder ID:")
        Logger.log(idArray[predictedFolderIndex]);

        // DriveApp folder object for the predicted folder
        const predictedFolder = DriveApp.getFolderById(idArray[predictedFolderIndex]);

        Logger.log("The folder " + attachment.getName() + " should go in is: " + predictedFolder.getName());

        file.moveTo(predictedFolder)
      }

      const card = CardService.newCardBuilder()
          .setName("Card name")
          .setHeader(CardService.newCardHeader().setTitle("Discovered Attachments:"))
          .addSection(cardSection)
          .build();
      
      cards.push(card);
    }

    thread.addLabel(sentToDriveLabel);
    thread.removeLabel(sendToDriveLabel);
    
  }  

  return cards;
}
