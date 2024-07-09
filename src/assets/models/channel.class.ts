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


    constructor(obj?: any) {
        this.name = obj ? obj.name : '',
            this.channelId = obj ? obj.channelId : '',
            this.description = obj ? obj.description : '',
            this.member = obj ? obj.member : [],
            this.messages = obj ? obj.messages : [],
            this.createdAt = obj ? obj.createdAt : new Date().getTime(),
            this.creator = obj ? obj.creator : ''
    }


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


    /**
     * Removes a member from the channel based on the memberId.
     *
     * @param {string} memberId - The ID of the member to be removed.
     */
    removeMember(memberId: string) {
        this.member = this.member.filter(member => member.id !== memberId);
    }
}