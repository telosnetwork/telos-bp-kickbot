# KICKBOT2 Repository

## OVERVIEW
The Kickbot2 is a nodeJS package that looks for relevent Telos Validator events and sends a notification to the #Telos Kickbot Telegram channel.  This package connects to a hyperion history stream looking for specific events.  Once that event is seen, the script parses the event info, enriches with additional validator info and pushed to the Telegram webservice.

Currently, the following events are:

* Validator has REGISTERED
* Validator has UNREGISTERED
* Validator has missed a block

## index.js
This is the main package script.

To run this package:
`node index.js`

## bpvalidator.js
This does the heavy-lifting.  It is called by index.js.

## strut.js
This is a unit test file to verify the correct REG/UNREG events are working.

To run this package:
`node strut.js`





