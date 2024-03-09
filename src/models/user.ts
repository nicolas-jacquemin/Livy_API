import db from '../services/db.js';

export type User = {
    _id: any;
    password: string;
    email: string;
    name: string;
    inviteCode: string;
    createdAt: Date;
    role: string;
}

const userSchema = new db.Schema({
    password: { type: String, required: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    inviteCode: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, required: true },
    role: { type: String, required: true, default: "user" },
    likedLiveStreams: [{ type: db.Schema.Types.ObjectId, ref: "LiveStream" }],
});

const User = db.model("User", userSchema);

export default User;
