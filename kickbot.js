const fetch = require("node-fetch");
const axios = require("axios");

const HyperionSocketClient = require('@eosrio/hyperion-stream-client').default;
const client = new HyperionSocketClient('https://telos.caleos.io', {async: true, fetch});
 
client.onConnect = () => {
  client.streamActions({
    contract: 'eosio',
    action: 'unregprod',
  //action: 'regproducer',
    //action: 'voteproducer',
    account: '',
    start_from: '2021-04-09T00:00:00.000Z',
    read_until: 0,
    filters: [],
  });

 client.streamActions({
    contract: 'eosio',
    //action: 'unregprod',
    action: 'regproducer',
    //action: 'voteproducer',
    account: '',
    start_from: '2021-04-09T00:00:00.000Z',
    read_until: 0,
    filters: [],
  });

//  client.streamDeltas({
//    code: 'eosio',
//    table: 'producers',
//    scope: 'eosio',
    //payer: 'telosuknodes',
//    payer: '',
//    start_from: '2021-04-09T00:31:00.000Z',
    //start_from: 0,
    //read_until: 0,
    //read_until: '2021-03-03T02:36:00.000Z',
//  });
}

// see 3 for handling data
client.onData = async (data, ack) => {
    console.log(data); // process incoming data, replace with your code
    console.log(data.type); // process incoming data, replace with your code
    console.log(data.content.act.name); // process incoming data, replace with your code
    console.log(data.content.producer); // process incoming data, replace with your code
    console.log(data.content.block_num); // process incoming data, replace with your code

	// send a POST request
//    axios({
//      method: 'post',
//      url: 'https://api.telegram.org/bot1743786618:AAGIepzI_GNfsN8MxlGSqC53sIQSOTSV9-I/sendMessage',
//      data: {
//        chat_id: '@teloskickbot',
//        text: '❌ $data.timestamp testing one two three'
//      }
//    });
    ack(); // ACK when done
}
 
client.connect(() => {
  console.log('connected!');
});

