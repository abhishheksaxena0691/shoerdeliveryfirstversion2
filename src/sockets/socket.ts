import * as http from "http";
import socketio from "socket.io";
import { Message, MessageType } from "../models/models";
import { logger } from "../config/winston";
import * as User from "../routes/user";

let connectionList: any = {};

export class Socket {
  private io: socketio.Server | undefined;

  constructor(server: http.Server) {
    this.init(server);
  }

  private init(server: http.Server) {
    this.io = socketio.listen(server);

    this.io.on("connection", (socket: any) => {
      let user: string;
      let bot: string;
      logger.silly("user connected");

      if (this.io) {
        this.io.emit(MessageType.USER_IDENTIFICATION, { data: "111111" });
      }

      connectionList[socket.id] = {};

      socket.on(MessageType.USER_IDENTIFICATION, (m: Message) => {
        user = m.data;
        connectionList[socket.id].user = user;
        logger.silly(m.data + " : has joined as user");
      });

      // socket.on(MessageType.BOT_IDENTIFICATION, (m: Message) => {
      //   bot = m.data;
      //   connectionList[socket.id].bot = bot;
      //   logger.silly(m.data + " : has joined as bot");
      // });

      // socket.on(MessageType.FILES_DETECTED, (m: Message) => {
      //   if (bot) {
      //     const files = m.files;

      //     for (let file in files){
      //       if (file.length > 4 && file.indexOf('.') != -1) {

      //       }
      //     }
      //     User.brochureToUserIdMap;
      //     logger.silly(m.data + " : has joined as bot");
      //   } else {
      //     logger.error("A non bot("+user||bot+") is trying to send files: " + m.data);
      //   }
      // });

      socket.on(MessageType.DISCONNECT, () => {
        logger.silly((bot || user) + " has left");

        if (connectionList[socket.id]) {
          delete connectionList[socket.id];
        }
      });
    });
  }

  /**
   * brochureReady
   */
  public brochureReady(userId: string, brochureName: string, brochurePath:string) {
    if (this.io) {
      this.io.emit(MessageType.BROCHURE_READY + "_" + userId, {
        data: {filename:brochureName, path:brochurePath}
      });
    }
  }
}
