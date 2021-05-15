const fetch = require("node-fetch");
const axios = require("axios").default;
const eosjs = require("eosjs");
const HyperionSocketClient = require("@eosrio/hyperion-stream-client").default;
const INCREASE_EMOJI = "🚨";
const DECREASE_EMOJI = "🟢";
const PRODUCER_POLL_INTERVAL = 10 * 1000; // 10 seconds
class BPWatcher {
  constructor(apiKey, channel, rpcEndpoint, hyperionEndpoint) {
    this.apiKey = apiKey;
    this.channel = channel;
    this.rpc = new eosjs.JsonRpc(rpcEndpoint, { fetch });
    this.hyperionEndpoint = hyperionEndpoint;
    this.producers = {};
    //this.startFrom = "2021-04-01T00:00:00.000Z";
    this.startFrom = 0;
  }

  setDebug(debug) {
    this.debug = debug;
  }

  async init() {
    await this.loadProducers();
    await this.setupClient();
    this.checkInterval = setInterval(() => {
      this.loadProducers();
    }, PRODUCER_POLL_INTERVAL);
  }

  async loadProducers(filter) {
    let result = await this.rpc.get_table_rows({
      code: "eosio",
      scope: "eosio",
      table: "producers",
      limit: 1000,
    });

    let results = [];
    result.rows.forEach((row) => {
      if (!filter || filter.indexOf(row.owner) != -1)
        this.checkProducer(row, results);
      this.producers[row.owner] = row;
    });

    if (results.length) this.postToChannel(results.join("\n"));
  }

  checkProducer(bp, results) {
    if (this.producers[bp.owner]) {
      let old = this.producers[bp.owner];
      let blocksMissed = bp.missed_blocks_per_rotation;
      let oldBlocksMissed = old.missed_blocks_per_rotation;
      if (blocksMissed != 0 && blocksMissed != oldBlocksMissed) {
        let difference = blocksMissed - oldBlocksMissed;
        results.push(
          `${bp.owner} has now missed ${blocksMissed} this rotation, ${
            difference
              ? "an increase"
              : "a decrease (previous missed blocks sample was from a fork)"
          } of ${difference} - ${(difference
            ? INCREASE_EMOJI
            : DECREASE_EMOJI
          ).repeat(Math.abs(difference))}`
        );
      }
    }

    this.producers[bp.owner] = bp;
  }

  async setupClient() {
    this.client = new HyperionSocketClient(this.hyperionEndpoint, {
      async: true,
      fetch,
    });

    this.client.onConnect = () => {
      this.registerStreams();
    };

    this.client.onData = (data, ack) => {
      this.onData(data, ack);
    };

    this.client.connect(() => console.log("Connected!!!"));
  }

  async onData(data, ack) {
    let dataType = data.type;
    if (dataType == "action") {
      await this.handleAction(data);
    } else if (dataType == "delta") {
      await this.handleDelta(data);
    } else {
      console.error(`Unknown data type: ${dataType}`);
    }

    ack();
  }

  async handleAction(data) {
    if (data.content.act.name == "regproducer")
      await this.postToChannel(
        `${data.content.act.data.producer.toUpperCase()} Registered at block ${
          data.content.block_num
        }`
      );

    if (data.content.act.name == "unregprod")
      await this.postToChannel(
        `${data.content.act.data.producer.toUpperCase()} Unregistered at block ${
          data.content.block_num
        }`
      );
  }

  async handleDelta(data) {
    let bp = data.content.payer;
    if (!this.producers[bp]) {
      await this.loadProducers([bp]);
      if (!this.producers[bp]) {
        console.error(
          `Got delta for ${bp} but was unable to load them from producers table`
        );
        return;
      }
    }

    //  if (Object.keys(data.content.data).length > 3)
    console.log(JSON.stringify(data.content.data, null, 4));
    Object.assign(this.producers[bp], data.content.data);
  }

  async postToChannel(text) {
    if (this.debug) {
      console.log(`Posting to ${this.channel}:\n${text}\n`);
      return;
    }

    try {
      axios({
        method: "post",
        url: `https://api.telegram.org/${this.apiKey}/sendMessage`,
        data: {
          chat_id: this.channel,
          text,
        },
      });
    } catch (e) {
      console.error(`Failed to call telegram API: ${e.message}`);
    }
  }

  registerStreams() {
    this.client.streamActions({
      contract: "eosio",
      action: "unregprod",
      account: "",
      start_from: this.startFrom,
      read_until: 0,
      filters: [],
    });

    this.client.streamActions({
      contract: "eosio",
      action: "regproducer",
      account: "",
      start_from: this.startFrom,
      read_until: 0,
      filters: [],
    });

    /*
    this.client.streamDeltas({
      code: "eosio",
      table: "producers",
      scope: "eosio",
      start_from: this.startFrom,
      read_until: 0,
    });
    */
  }
}

module.exports = BPWatcher;
