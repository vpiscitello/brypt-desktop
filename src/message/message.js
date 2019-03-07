const bryptMessage = require("../../build/Release/brypt-message.node");
// var bryptMessage = require('bindings')('brypt-message');

export class MessageInterface {
    test() {
        let nodeID = "00-00-00-00-00"; // Set the message sender ID
        let command = 2; // Set the message command type
        let phase = 0; // Set the message command phase
        let data = "Hello World!"; // Set the message data
				let key = "1234567890123456789012345678901"
        let nonce = 998; // Set the message key nonce

        let first = new bryptMessage.Init(nodeID, command, phase, data, key, nonce);
        console.log(first.getPack());

        let second = new bryptMessage.Init(first.getPack(), key);
        console.log(second.getData());

        let respNodeID = "11-11-11-11-11"; // Set the message response sender ID
        let respData = "Re: Hello World! - Hi."; // Set the message response data
        let respPhase = 9999;
        second.setResponse(respNodeID, respData, respPhase); // Set the message's response using the known data
        console.log(second.getResponse());
    }
}

export default new MessageInterface();
