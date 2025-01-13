import mongoose, {Model} from 'mongoose';
import bcrypt from 'bcrypt';
import {randomUUID} from "node:crypto";

interface UserFields {
    username: string;
    password: string;
    token: string;
}

type UserModel = Model<UserFields, {}, UserMethods>;

interface UserMethods {
    checkPassword(password: string): Promise<boolean>;
    generateToken(): void;
}

const Schema = mongoose.Schema;

const SALT_WORK_FACTOR = 10;

const UserSchema = new Schema<UserFields, UserModel, UserMethods>({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    token: {
        type: String,
        required: [true, 'Token is required'],
    }
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.checkPassword = function (password: string) {
    return bcrypt.compare(password, this.password);
};
UserSchema.methods.generateToken = function () {
    this.token = randomUUID();
};

UserSchema.set('toJSON', {
    transform: (_doc, ret) => {
        delete ret.password;
        return ret;
    }
});

const User = mongoose.model('User', UserSchema);
export default User;