function geminiCall(sender, subject, body, textContent, folderString) {
  var apiKey = 'YOUR_API_KEY';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  // Payload for my api call that will prompt Gemini to decide out of 
  // the string of folder names, which one to place the text content inside of
  const payload = {
    contents: [{
      parts: [{
        text: "**Email:**\n" + "Sender: " + sender + "\nSubject: " + subject + "\n\nEmail Message:\n" + body + "\n\nAttachment:\n" + textContent + "\n\nAbove is an email sent by one of my customers, it includes their email, subject of the message, the message, and the attachment to the email. I have my Google Drive setup, and in my Drive are folders. Each folder is dedicated to one of my customers. I need your help deciding which folder this email should go into. Which of the following folders would you organize this email into?\n" + folderString + "\nThe only thing you will return is the 0-index of the folder in the list of folders provided to you. For example, if you think the text should go in the first folder name in the list above, then you would return 0, if it was the second folder, you would return 1, and so on. If you are not 100% certain that there is a folder that you would like to place this text in, choose the folder named NO_AVAILABLE_FOLDER to return. DO NOT make any assumptions, only choose a folder to use IF there is actual concrete evidence that it belongs in the folder. After you decided the folder, get the invoice number and invoice date. The invoice number will be a string of numbers and letters, if you are not 100% certain there is an invoice number, return NO_AVAILABLE_INVOICE_NUMBER. The invoice date can potentially be in different formats. There might be a date without a year, or the month and day will be written out in full english. If you cannot find an appropriate date, return NO_AVAILABLE_INVOICE_DATE. You will be returning these 3 pieces of information in a JSON format. The first object should be the 0-index of the folder, then the second object is the invoice number, and the third object is the invoice date. The invoice date should be formatted as YYYYMMDD. Here is an example output: {\"index\": 0, \"invoice_number\": \"123456\", \"invoice_date\": \"20220429\"}"
      }]
    }],
    // generationConfig: [{
    //   "response_mime_type": "application/json",
    // }],
    safetySettings: [
      {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_NONE",
      },
      {
        "category": "HARM_CATEGORY_HATE_SPEECH",
        "threshold": "BLOCK_NONE",
      },
      {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "threshold": "BLOCK_NONE",
      },
      {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold": "BLOCK_NONE",
      },
    ]
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

function noAttachmentGeminiCall(textContent, folderString) {
  var apiKey = 'YOUR_API_KEY';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  // Payload for my api call that will prompt Gemini to decide out of 
  // the string of folder names, which one to place the text content inside of
  const payload = {
    contents: [{
      parts: [{
        text: "**Email:**\n" + textContent + "\n\nAbove is an email thread between one of my customers and I, it includes my customer's email, subject of the message, the message, and dates the emails were sent. I have my Google Drive setup, and in my Drive are folders. Each folder is dedicated to one of my customer. I need your help deciding which folder this email thread should go into. Which of the following folders would you organize this email into?\n" + folderString + "\nThe only thing you will return is the 0-index of the folder in the list of folders provided to you. For example, if you think the text should go in the first folder name in the list above, then you would return 0, if it was the second folder, you would return 1, and so on. If you are not 100% certain that there is a folder that you would like to place this text in, choose the folder named NO_AVAILABLE_FOLDER to return. DO NOT make any assumptions, only choose a folder to use IF there is actual concrete evidence that it belongs in the folder. After you decided the folder, get the invoice number and invoice date. The invoice number will be a string of numbers and letters, if you are not 100% certain there is an invoice number, return NO_AVAILABLE_INVOICE_NUMBER. The invoice date can potentially be in different formats. There might be a date without a year, or the month and day will be written out in full english. If you cannot find an appropriate date, return NO_AVAILABLE_INVOICE_DATE. You will be returning these 3 pieces of information in a JSON format. The first object should be the 0-index of the folder, then the second object is the invoice number, and the third object is the invoice date. The invoice date should be formatted as YYYYMMDD. Here is an example output: {\"index\": 0, \"invoice_number\": \"123456\", \"invoice_date\": \"20220429\"}"
      }]
    }],
    // generationConfig: [{
    //   "response_mime_type": "application/json",
    // }],
    safetySettings: [
      {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_NONE",
      },
      {
        "category": "HARM_CATEGORY_HATE_SPEECH",
        "threshold": "BLOCK_NONE",
      },
      {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "threshold": "BLOCK_NONE",
      },
      {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold": "BLOCK_NONE",
      },
    ]
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
  var alphaFoldersIter = attachmentFolder.getFolders();

  var subFolders = []
  var idArray = []

  while (alphaFoldersIter.hasNext()) {
    var currAlphaFolder = alphaFoldersIter.next();

    if (currAlphaFolder.getName() === "NO_AVAILABLE_FOLDER") {
      continue;
    }

    // While we are in each alphabetized folder, we can begin to collect our vendor folders
    var currAlphaFolderSubFolders = currAlphaFolder.getFolders();
    while (currAlphaFolderSubFolders.hasNext()) {
      var folder = currAlphaFolderSubFolders.next();
      subFolders.push(folder.getName());
      idArray.push(folder.getId());
    }
  }

  folderString = subFolders.join(", ");

  Logger.log("Folder String:");
  Logger.log(folderString);
  Logger.log("ID Array:");
  Logger.log(idArray);
  
  return [folderString, idArray];
}

function getPDFExtractedText(file, parentFolderId) {
  // Check if the file is a PDF
  if (file.getMimeType() !== MimeType.PDF) {
    Logger.log("This function only supports PDF files.")
    return -1
    // throw new Error("This function only supports PDF files.");
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
      fields: 'id,name',
      supportsAllDrives: true
    }
  );

  const textContent = DocumentApp.openById(id).getBody().getText();

  // Delete the temporary Google Document since it is no longer needed
  DriveApp.getFileById(id).setTrashed(true);
  
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

//
function formatDate(date) {
  const year = date.getFullYear().toString();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return year + " " + month + " " + day;
}

function checkForPDF(messages) {
  for (const message of messages) {
    const attachments = message.getAttachments();
    for (const attachment of attachments) {
      Logger.log("Attachment Name:");
      Logger.log(attachment.getName());
      Logger.log("Attachment Type:");
      Logger.log(attachment.getContentType());
      if (attachment.getContentType() === "application/pdf") {
        return true;
      }
    }
  }

  return false;
}

function withAttachment(messages, cardSection, attachmentFolder, folderString, idArray, cards) {
  for (const message of messages) {
    var sender = message.getFrom();
    var subject = message.getSubject();    
    var body = message.getBody();
    var attachments = message.getAttachments();
    
    for (const attachment of attachments) {
      Logger.log("Attachment Name:");
      Logger.log(attachment.getName());
      cardSection.addWidget(
        CardService.newTextParagraph().setText("<b>" + attachment.getName() + "</b>"));
      
      // Upload the attachment to the root folder
      const file = attachmentFolder.createFile(attachment);

      // Get the text content
      // Will return -1 if the file is not a pdf
      textContent = getPDFExtractedText(file, attachmentFolder.getId());

      // If there is no pdf, then delete the file and move on
      if (textContent == -1) {
        file.setTrashed(true);
        continue;
      }

      // Gemini Call for the correct folder the invoice should go in
      var data = geminiCall(sender, subject, body, textContent, folderString);
      Logger.log(data);

      // The index in the folderString that the text content should go in
      var responseJSON = data.candidates[0].content.parts[0].text;
      Logger.log("Response JSON:")
      Logger.log(responseJSON);

      var cleanJSONString = "";

      // Find the starting index of the opening curly brace
      const startIndex = responseJSON.indexOf('{');

      // If the opening brace is found, extract the substring until the closing brace
      if (startIndex !== -1) {
        const endIndex = responseJSON.indexOf('}', startIndex + 1); // +1 to skip the opening brace
        if (endIndex !== -1) {
          cleanJSONString = responseJSON.slice(startIndex, endIndex + 1); // +1 to include the closing brace
          Logger.log("Clean JSON string:");
          console.log(cleanJSONString); // { "index": 6, "invoice_number": "8872", "invoice_date": "2024 04 12" }
        } else {
          Logger.log("No closing brace found");
        }
      } else {
        Logger.log("No opening brace found");
      }

      cleanJSONString = JSON.parse(cleanJSONString);
      Logger.log("Data parsed:");
      Logger.log(cleanJSONString);

      Logger.log("New predicted folder index:");
      Logger.log(cleanJSONString["index"] | 0);

      var predictedFolderIndex = cleanJSONString["index"] | 0;

      // Google Drive ID for the predicted folder
      const predictedFolderId = idArray[predictedFolderIndex];

      // DriveApp folder object for the predicted folder
      const predictedFolder = DriveApp.getFolderById(predictedFolderId);

      Logger.log(attachment.getName() + " should go in the folder named: " + predictedFolder.getName());

      file.moveTo(predictedFolder);    
      
      file.setName(cleanJSONString["invoice_date"] + "_" + cleanJSONString["invoice_number"] + ".pdf");
    }

    const card = CardService.newCardBuilder()
        .setName("Card name")
        .setHeader(CardService.newCardHeader().setTitle("Discovered Attachments:"))
        .addSection(cardSection)
        .build();
    
    cards.push(card);
  }
}

function noAttachment(messages, cardSection, attachmentFolder, folderString, idArray, cards) {
  // Since there are no attachments in this thread, we will convert the thread into a pdf to save

  var textContent = "";
  
  for (const message of messages) {
    textContent += "<b>Sender:</b> " + message.getFrom() + "<br>";

    textContent += "<b>To:</b> " + message.getTo() + "<br>";

    var date = message.getDate();          
    textContent += "<b>Date:</b> " + date + "<br>";
    
    textContent += "<b>Subject:</b> " + message.getSubject() + "<br>";
    
    textContent += "<b>Body:</b> " + message.getBody() + "<br>";

    const formattedDate = formatDate(date); // Output: YYYYMMDD (e.g., 20240429 for today)

    var tempFile = attachmentFolder.createFile("temp.html", textContent, MimeType.HTML);
    var file = attachmentFolder.createFile(tempFile.getAs(MimeType.PDF)).setName(formattedDate + ".pdf");
    tempFile.setTrashed(true);

    const data = noAttachmentGeminiCall(textContent, folderString);
    Logger.log(data);

    // The index in the folderString that the text content should go in
    const responseJSON = data.candidates[0].content.parts[0].text;
    Logger.log("Response JSON:");
    Logger.log(responseJSON);

    var cleanJSONString = "";

    // Find the starting index of the opening curly brace
    const startIndex = responseJSON.indexOf('{');

    // If the opening brace is found, extract the substring until the closing brace
    if (startIndex !== -1) {
      const endIndex = responseJSON.indexOf('}', startIndex + 1); // +1 to skip the opening brace
      if (endIndex !== -1) {
        cleanJSONString = responseJSON.slice(startIndex, endIndex + 1); // +1 to include the closing brace
        Logger.log("Clean JSON string:");
        console.log(cleanJSONString); // { "index": 6, "invoice_number": "8872", "invoice_date": "2024 04 12" }
      } else {
        Logger.log("No closing brace found");
      }
    } else {
      Logger.log("No opening brace found");
    }

    cleanJSONString = JSON.parse(cleanJSONString);
    Logger.log("Data parsed:");
    Logger.log(cleanJSONString);

    Logger.log("New predicted folder index:");
    Logger.log(cleanJSONString["index"] | 0);

    var predictedFolderIndex = cleanJSONString["index"] | 0;

    // Google Drive ID for the predicted folder
    const predictedFolderId = idArray[predictedFolderIndex];

    // DriveApp folder object for the predicted folder
    const predictedFolder = DriveApp.getFolderById(predictedFolderId);

    Logger.log(message.getSubject() + " thread should go in the folder named: " + predictedFolder.getName());

    file.moveTo(predictedFolder)

    file.setName(cleanJSONString["invoice_date"] + "_" + cleanJSONString["invoice_number"] + ".pdf");

    const card = CardService.newCardBuilder()
        .setName("Card name")
        .setHeader(CardService.newCardHeader().setTitle("Discovered Attachments:"))
        .addSection(cardSection)
        .build();
    
    cards.push(card);
  }
}

function buildAddOn(e) {
  // Activate temporary Gmail add-on scopes.
  // var accessToken = e.messageMetadata.accessToken;
  // GmailApp.setCurrentMessageAccessToken(accessToken);

  // var messageId = e.messageMetadata.messageId;
  // var message = GmailApp.getMessageById(messageId);

  var cards = [];

  Logger.log("Beginning Process");
  
  var sendToDriveLabel = GmailApp.getUserLabelByName("SendToDrive");
  var sentToDriveLabel = GmailApp.getUserLabelByName("SentToDrive");

  // Get the root folder that contains all of the organized folders and attachment uploads
  var attachmentFolder = DriveApp.getFoldersByName('GmailProcessor-Tests').next();

  // folderResult:
  // 0: folderString - string of comma separated folder names
  // 1: idArray - array of folder ids in the same order as the folderString
  const folderResult = getChildFolderString(attachmentFolder);
  const folderString = folderResult[0]
  const idArray = folderResult[1]

  // Get all threads with the label "SendToDrive"
  const threads = GmailApp.search('label:"SendToDrive"');  

  for (const thread of threads) {
    // Get emails in the threads
    const messages = thread.getMessages()

    // Create a new card to display in add-on UI
    const cardSection = CardService.newCardSection();

    // Check if the thread has a pdf invoice
    const hasPDF = checkForPDF(messages);

    if (!hasPDF) {
      Logger.log("This thread does not have an invoice PDF attachment.");

      noAttachment(messages, cardSection, attachmentFolder, folderString, idArray, cards);      
    } else {
      Logger.log("This thread has an invoice PDF attachment.");

      withAttachment(messages, cardSection, attachmentFolder, folderString, idArray, cards);
    }

    thread.addLabel(sentToDriveLabel);
    thread.removeLabel(sendToDriveLabel);   
  }  

  return cards;
}
