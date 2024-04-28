# GmailAutomation

## Installation

App still has to go through Google marketplace verificaiton. So the copy of the Apps Script has to be shared with a new user.

Once it is shared:

_I was unable to test deploy the script after being shared on the project. It might work for someone else, but I suggest making a copy of the script._
_1. Go to project details and make a copy in the right corder next to the star._

Quickest testing:
1. Go to your root Google Drive, and create a folder named `GmailProcessor-Tests`
   1. This is a temporary feature, in the future you will be able to choose the desired root folder
2. Add potential vendor folders into the `GmailProcessor-Tests` folder.
3. In your Gmail, on the left tab, create 2 new labels, `SendToDrive` and `SentToDrive`.
4. Label an email thread of 1 email message that has an attachment.
5. In the script file, in the dropdown to the left of "Execution log", select `buildAddOn`
6. Press run
   1. You will likely have some errors, but that is because the app needs to be authorized by your account. Go ahead and authorize
7. Run again.