export class Message{
    sendId: string;
    getId: string;
    time: number;
    content: string;

    constructor(obj?: Message){
        this.sendId = obj ? obj.sendId : '';
        this.getId = obj ? obj.getId : '';
        this.time = obj ? obj.time :  new Date().getTime();
        this.content = obj ? obj.content : '';
    }
}