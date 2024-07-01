interface Member {
    id: string;
    name: string
}

export class Channel {
    name: string;
    channelId: string;
    description: string;
    member: Member[];
    messages: any[];
    createdAt: any;
    creator: string;

    /**
     * Constructs a new instance of the channel class
     * @param {any} obj - An object containing values used to initialize the channel properties. If not provided, defaults will be set.
     */
    constructor(obj?: any) {
        this.name = obj ? obj.name : '',
            this.channelId = obj ? obj.channelId : '',
            this.description = obj ? obj.description : '',
            this.member = obj ? obj.member : [],
            this.messages = obj ? obj.messages : [],
            this.createdAt = obj ? obj.createdAt : new Date().getTime(),
            this.creator = obj ? obj.creator : ''
    }


    /**
     * Converts the channel instance to a JSON representation.
     * @returns {object} An object containing the properties of the channel.
     */
    toJSON() {
        return {
            name: this.name,
            channelId: this.channelId,
            description: this.description,
            member: this.member,
            messages: this.messages,
            createdAt: this.createdAt,
            creator: this.creator
        }
    }
}