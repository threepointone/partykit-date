import type * as Party from "partykit/server";

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  prevTimestamp = 0;
  prevClientTimestamp = 0;

  onMessage(message: string, sender: Party.Connection) {
    let data;

    try {
      data = JSON.parse(message);
    } catch (err) {
      console.error(`connection ${sender.id} sent invalid message: ${message}`);
      return;
    }

    if (data.type === "ping") {
      const currentTimestamp = Date.now();

      console.log(
        "client delta",
        data.payload.timestamp - this.prevClientTimestamp
      );
      console.log("server delta", currentTimestamp - this.prevTimestamp);
      console.log("=====");

      this.room.broadcast(
        JSON.stringify({
          type: "pong",
          payload: {
            timestamp: currentTimestamp,
            prevTimestamp: this.prevTimestamp,
            clientTimestamp: data.payload.timestamp,
            prevClientTimestamp: this.prevClientTimestamp,
          },
        })
      );

      this.prevClientTimestamp = data.payload.timestamp;
      this.prevTimestamp = currentTimestamp;
    }
  }
}

Server satisfies Party.Worker;
