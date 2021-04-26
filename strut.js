const fetch = require("node-fetch");
const axios = require("axios").default;
const apikey = process.env.TGKEY

const HyperionSocketClient = require('@eosrio/hyperion-stream-client').default;
const client = new HyperionSocketClient('https://telos.caleos.io', {async: true, fetch});
 
client.onConnect = () => {
  client.streamActions({
    contract: 'eosio',
    action: 'unregprod',
    account: '',
    start_from: '2021-04-01T00:00:00.000Z',
    read_until: 0,
    filters: [],
  });

 client.streamActions({
    contract: 'eosio',
    action: 'regproducer',
    account: '',
    start_from: '2021-04-01T00:00:00.000Z',
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

let producers = {};
//producers["telosglobal1"] = {
//    owner: "telosglobal1",
//    is_active: 1,
//    missed_blocks_per_rotation: 0,
//    };

let msg = 0;
let state = "";
let msgtext = "";


// see 3 for handling data
client.onData = async (data, ack) => {
    console.log(data); // process incoming data, replace with your code
//    console.log(data.type); // process incoming data, replace with your code
    console.log(data.content.act.name); // process incoming data, replace with your code
    console.log(data.content.producer); // process incoming data, replace with your code
//    console.log(data.content.block_num); // process incoming data, replace with your code
    if (!producers[data.content.producer]) {
       producers[data.content.producer] = {
           owner: data.content.producer,
           is_active: 1,
           missed_blocks_per_rotation: 0,
           };
       }

    if (data.content.act.name = "regproducer") {
        axios({
           method: 'post',
           url: 'https://api.telegram.org/' + apikey + '/sendMessage',
           data: {
           chat_id: '@teloskickbot',
           text: data.content.producer.toUpperCase() + " Registered at block " + data.content.block_num 
           }
	});
    }

    if (data.content.act.name = "unregprod") {
        axios({
           method: 'post',
           url: 'https://api.telegram.org/' + apikey + '/sendMessage',
           data: {
           chat_id: '@teloskickbot',
           text: data.content.producer.toUpperCase() + " Unregistered at block " + data.content.block_num 
           }
	});
       }

//    producers[data.content.producer].missed_blocks_per_rotation++;
//    console.log(producers);
    ack(); // ACK when done
}
 
client.connect(() => {
  console.log('connected!');
});
