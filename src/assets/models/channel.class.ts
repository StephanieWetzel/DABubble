
export class Channel {
    name: string;
    channelId: string;
    description: string;
    member: string[];
    messages: any[];
    createdAt: any;

    constructor(obj?:any){
        this.name = obj ? obj.name : '',
        this.channelId = obj ? obj.channelId: '',
        this.description = obj ? obj.description: '',
        this.member = obj ? obj.member: [],
        this.messages = obj ? obj.messages: [],
        this.createdAt = obj ? obj.createdAt: new Date().getTime();
    }

    toJSON() {
        return {
            name: this.name,
            channelId: this.channelId,
            description: this.description,
            member: this.member,
            messages: this.messages,
            createdAt: this.createdAt
        }
    }
}