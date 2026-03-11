const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['user', 'manager', 'admin'], default: 'user' },
    avatar: { type: String, default: '' },
    title: { type: String, default: '' },
    location: { type: String, default: '' },
    company: { type: String, default: '' },
    skills: [{ type: String }],
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    if (!this.avatar) {
        this.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=4F46E5&color=fff&size=64&bold=true`;
    }
    next();
});

// Compare password method
userSchema.methods.matchPassword = async function (entered) {
    return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
