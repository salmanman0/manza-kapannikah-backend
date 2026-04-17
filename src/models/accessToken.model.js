const mongoose = require('mongoose');

const accessTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      select: false, // never expose hashed token in query results
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deviceInfo: {
      userAgent: String,
      ip: String,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

accessTokenSchema.index({ userId: 1 });

const AccessToken = mongoose.model('AccessToken', accessTokenSchema);
module.exports = AccessToken;
