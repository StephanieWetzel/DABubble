import { Reaction } from "./reactions.class";

export class Message{
    sendId: string;
    getId: string;
    time: number;
    content: string;
    messageId : string;
    reactions: Reaction[];
    fileUrls: string[];

    constructor(obj?: any){
        this.sendId = obj ? obj.sendId : '';
        this.getId = obj ? obj.getId : '';
        this.time = obj ? obj.time :  new Date().getTime();
        this.content = obj ? obj.content : '';
        this.messageId = obj ? obj.messageId : '';
        this.reactions = obj ? obj.reactions : [];
        this.fileUrls = obj ? obj.fileUrls : []
    }


    toJSON(obj: Message) {
    return {
      sendId: obj.sendId,
      getId: obj.getId,
      time: obj.time,
      content: obj.content,
      messageId: obj.messageId,
      reactions: obj.reactions,
      fileUrls: obj.fileUrls
    }
  }
}