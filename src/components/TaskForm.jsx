import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addTask } from '../slices/tasksSlice';

const TaskForm = ({ fetchTasks }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    category: '',
    assignedTo: '',
    estimatedTime: '',
    status: 'todo'
  });
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/tasks', formData);
      dispatch(addTask(response.data));
      fetchTasks();
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        category: '',
        assignedTo: '',
        estimatedTime: '',
        status: 'todo'
      });
    } catch (error) {
      console.error('There was an error creating the task!', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title:</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Due Date:</label>
        <input
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Priority:</label>
        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div>
        <label>Category:</label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Assigned To:</label>
        <input
          type="text"
          name="assignedTo"
          value={formData.assignedTo}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Estimated Time (hours):</label>
        <input
          type="number"
          name="estimatedTime"
          value={formData.estimatedTime}
          onChange={handleChange}
          min="0"
          step="0.5"
        />
      </div>

      <div>
        <label>Status:</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="todo">To Do</option>
          <option value="inProgress">In Progress</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <button type="submit">Add Task</button>
    </form>
  );
};

export default TaskForm;