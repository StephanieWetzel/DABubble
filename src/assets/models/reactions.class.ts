export class Reaction{
    users: string[];
    emote: string;
    count: number

    constructor(obj?: any){
        this.users = obj ? obj.users : [];
        this.emote = obj ? obj.emote : '';
        this.count = obj ? obj.count : 1;
    }

    toJSON() {
        return {
          users: this.users,
          emote: this.emote,
          count: this.count
        };
      }
}