import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fname:
    {
        type: String,
        required: [true, "First name is required"],
        trim: true
    },

    lname:
    {
        type: String,
        required: [true, "last name is required"],
        trim: true
    },

    mobNo:
    {
        type: Number,
        required: [true, "last name is required"],
    },
    email:
    {
        type: String,
        required: [true, "Email is required"],
        unique: true
        // match: [/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]/, "invalid email address"]
    },

    password:
    {
        type: String,
        required: [true, "password is required"],
    },

    dob:
    {
        type: Date,
        default: Date.now,
        required: true
    },

    gender:
    {
        type: String,
        required: [true, "gender is required"],
    },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);


export default User