import React, { useEffect } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import Auth from './components/Auth';
import { supabase } from './supabaseClient';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, clearUser } from './slices/userSlice';
import { setTasks } from './slices/tasksSlice';
import axios from 'axios';

function App() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const tasks = useSelector(state => state.tasks);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:3001/tasks');
      dispatch(setTasks(response.data));
    } catch (error) {
      console.error('There was an error fetching the tasks!', error);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session:', session);
      dispatch(setUser(session?.user ?? null));
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', session);
      dispatch(setUser(session?.user ?? null));
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, dispatch]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    dispatch(clearUser());
  };

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="App">
      <h1>Task Management Application</h1>
      <button onClick={handleLogout}>Logout</button>
      <TaskForm fetchTasks={fetchTasks} />
      <TaskList tasks={tasks} />
    </div>
  );
}

export default App;