import db from '../services/db.js';

export type User = {
    password: string;
    email: string;
    name: string;
    inviteCode: string;
    createdAt: Date;
}

const userSchema = new db.Schema({
    password: { type: String, required: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    inviteCode: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, required: true }
});

const User = db.model("User", userSchema);

export default User;