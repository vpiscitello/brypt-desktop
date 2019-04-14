const bryptMessage = require("../../build/Release/brypt-message.node");
// var bryptMessage = require('bindings')('brypt-message');

export class MessageInterface {
    test() {
        let sourceID = "0xFFFFFFFFFF"; // Set the message sender ID
        let destinationID = "1"; // Set the message sender ID
        let command = 2; // Set the message command type
        let phase = 0; // Set the message command phase
        let data = "Hello World!"; // Set the message data
				let key = "1234567890123456789012345678901"
        let nonce = 998; // Set the message key nonce

        let first = new bryptMessage.Init(sourceID, destinationID, command, phase, data, key, nonce);

        console.log(first.getPack());

        let second = new bryptMessage.Init(first.getPack(), key);
        console.log(second.getData());

        let respNodeID = "11-11-11-11-11"; // Set the message response sender ID
        let respData = "Re: Hello World! - Hi."; // Set the message response data
        second.setResponse(respNodeID, respData); // Set the message's response using the known data
        console.log(second.getResponse());
    }
}

export default new MessageInterface();
