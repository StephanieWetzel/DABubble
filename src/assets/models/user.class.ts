export class User {
    name: string;
    userId: string;
    email: string;
    state: string; //online / offline
    avatar: string;
    password: string;
    lastReaction1: string;
    lastReaction2: string;


    /**
     * Constructs a new instance of the User class.
     * @param {any} [obj] - An object containing values used to initialize the user properties. If not provided, defaults will be set.
     */
    constructor(obj?: any) {
        this.name = obj ? obj.name : '';
        this.userId = obj ? obj.userId : '';
        this.email = obj ? obj.email : '';
        this.state = obj ? obj.state : '';
        this.avatar = obj ? obj.avatar : '';
        this.password = obj ? obj.password : '';
        this.lastReaction1 = obj ? obj.lastReaction1 : '🙌🏻';
        this.lastReaction2 = obj ? obj.lastReaction2 : '✅';
    }


    /**
     * Converts the user instance to a JSON representation.
     * @returns {object} An object containing the properties of the user.
     */
    toJSON() {
        return {
            name: this.name,
            userId: this.userId,
            email: this.email,
            state: this.state,
            avatar: this.avatar,
            password: this.password
        }
    }
}