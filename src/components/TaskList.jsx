import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { deleteTask, updateTask } from '../slices/tasksSlice';

const TaskList = ({ tasks }) => {
  const dispatch = useDispatch();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [commentsMap, setCommentsMap] = useState({}); // Store comments by task ID
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    assignedTo: 'all',
    sortBy: 'dueDate'
  });

  // Filter tasks
  const getFilteredTasks = () => {
    return tasks.filter(task => {
      return (filters.status === 'all' || task.status === filters.status) &&
             (filters.priority === 'all' || task.priority === filters.priority) &&
             (filters.category === 'all' || task.category === filters.category) &&
             (filters.assignedTo === 'all' || task.assignedTo === filters.assignedTo);
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'dueDate':
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'priority': {
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
  };

  // Get unique values for filters
  const getUniqueValues = (field) => {
    return ['all', ...new Set(tasks.map(task => task[field]).filter(Boolean))];
  };

  // Calculate task progress
  const calculateProgress = (task) => {
    const statusWeights = {
      todo: 0,
      inProgress: 33,
      review: 66,
      completed: 100
    };
    return statusWeights[task.status] || 0;
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  // Task operations
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/tasks/${id}`);
      dispatch(deleteTask(id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleUpdate = async (id, updatedTask) => {
    try {
      const response = await axios.patch(`http://localhost:3001/tasks/${id}`, updatedTask);
      dispatch(updateTask(response.data));
      setEditingId(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setEditForm(task);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Comments handling
  const handleAddComment = async (taskId) => {
    const comment = commentsMap[taskId];
    if (!comment?.trim()) return;

    try {
      const response = await axios.post(`http://localhost:3001/tasks/${taskId}/comments`, {
        content: comment,
        createdAt: new Date(),
        author: 'Current User' // Replace with actual user info
      });
      
      dispatch(updateTask(response.data));
      setCommentsMap(prev => ({...prev, [taskId]: ''}));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Render filter section
  const FilterSection = () => (
    <div className="filters-container">
      <h3>Filters</h3>
      <div className="filter-controls">
        <select
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          {getUniqueValues('status').map(status => (
            <option key={status} value={status}>
              {status === 'all' ? 'All Statuses' : status}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => setFilters({...filters, priority: e.target.value})}
        >
          {getUniqueValues('priority').map(priority => (
            <option key={priority} value={priority}>
              {priority === 'all' ? 'All Priorities' : priority}
            </option>
          ))}
        </select>

        <select
          value={filters.category}
          onChange={(e) => setFilters({...filters, category: e.target.value})}
        >
          {getUniqueValues('category').map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
        >
          <option value="dueDate">Sort by Due Date</option>
          <option value="priority">Sort by Priority</option>
          <option value="status">Sort by Status</option>
        </select>
      </div>
    </div>
  );

  // Render edit form
  const EditForm = ({ task }) => (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleUpdate(task._id, editForm);
    }}>
      <div>
        <label>Title:</label>
        <input
          type="text"
          name="title"
          value={editForm.title}
          onChange={handleEditChange}
          required
        />
      </div>
      
      <div>
        <label>Description:</label>
        <textarea
          name="description"
          value={editForm.description}
          onChange={handleEditChange}
        />
      </div>

      <div>
        <label>Due Date:</label>
        <input
          type="date"
          name="dueDate"
          value={editForm.dueDate ? editForm.dueDate.split('T')[0] : ''}
          onChange={handleEditChange}
        />
      </div>

      <div>
        <label>Priority:</label>
        <select
          name="priority"
          value={editForm.priority}
          onChange={handleEditChange}
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
          value={editForm.category}
          onChange={handleEditChange}
        />
      </div>

      <div>
        <label>Assigned To:</label>
        <input
          type="text"
          name="assignedTo"
          value={editForm.assignedTo}
          onChange={handleEditChange}
        />
      </div>

      <div>
        <label>Estimated Time (hours):</label>
        <input
          type="number"
          name="estimatedTime"
          value={editForm.estimatedTime}
          onChange={handleEditChange}
          min="0"
          step="0.5"
        />
      </div>

      <div>
        <label>Status:</label>
        <select
          name="status"
          value={editForm.status}
          onChange={handleEditChange}
        >
          <option value="todo">To Do</option>
          <option value="inProgress">In Progress</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <button type="submit">Save</button>
      <button type="button" onClick={() => setEditingId(null)}>Cancel</button>
    </form>
  );

  // Render task details
  const TaskDetails = ({ task }) => (
    <div className="task-details">
      <h3>Title: {task.title}</h3>
      <p>Description: {task.description}</p>
      <p>Due Date: {formatDate(task.dueDate)}</p>
      <p>Priority: {task.priority}</p>
      <p>Category: {task.category || 'Not set'}</p>
      <p>Assigned To: {task.assignedTo || 'Unassigned'}</p>
      <p>Estimated Time: {task.estimatedTime ? `${task.estimatedTime} hours` : 'Not set'}</p>
      <p>Status: {task.status}</p>
      <p>Created: {formatDate(task.createdAt)}</p>
      <p>Last Updated: {formatDate(task.updatedAt)}</p>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${calculateProgress(task)}%` }} />
      </div>

      {/* Comments Section */}
      <div className="comments-section">
        <h4>Comments</h4>
        {task.comments?.map(comment => (
          <div key={comment._id} className="comment">
            <p>{comment.content}</p>
            <small>By {comment.author} on {formatDate(comment.createdAt)}</small>
          </div>
        ))}
        <div className="add-comment">
          <textarea
            value={commentsMap[task._id] || ''}
            onChange={(e) => setCommentsMap({...commentsMap, [task._id]: e.target.value})}
            placeholder="Add a comment..."
          />
          <button onClick={() => handleAddComment(task._id)}>Add Comment</button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="task-actions">
        <button onClick={() => startEdit(task)}>Edit</button>
        <button onClick={() => handleDelete(task._id)}>Delete</button>
        <button 
          onClick={() => handleUpdate(task._id, { 
            status: task.status === 'completed' ? 'todo' : 'completed' 
          })}
        >
          {task.status === 'completed' ? 'Reopen' : 'Complete'}
        </button>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="task-list">
      <h2>Task List</h2>
      <FilterSection />
      
      <div className="tasks-container">
        {getFilteredTasks().map(task => (
          <div key={task._id} className="task-card">
            {editingId === task._id ? (
              <EditForm task={task} />
            ) : (
              <TaskDetails task={task} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;