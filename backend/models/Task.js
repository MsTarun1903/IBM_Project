import mongoose from 'mongoose';
import { type } from 'os';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  dueDate: {
    type: Date,
    required: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    required: false
  },
  assignedTo: {
    type: String,
    required: false
  },
  estimatedTime: {
    type: Number,
    required: false,
    min: 0
  },
  status: {
    type: String,
    enum: ['todo', 'inProgress', 'review', 'completed'],
    default: 'todo'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  comments: {
    type: String,
    required: true
  }
});

// Update the updatedAt timestamp before saving
taskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Task = mongoose.model('Task', taskSchema);

export default Task;