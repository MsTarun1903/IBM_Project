import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { supabase } from '../supabaseClient';
import { setUser } from '../slices/userSlice';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const dispatch = useDispatch();

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isSignUp) {
      const { data: { user }, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        console.error('Error signing up:', error.message);
      } else {
        // Insert user data into the users table
        const { error: insertError } = await supabase
          .from('users')
          .insert([{ user_ID: user.id, email, password }]);
        if (insertError) {
          console.error('Error inserting user data:', insertError.message);
        } else {
          dispatch(setUser(user));
        }
      }
    } else {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Error signing in:', error.message);
      } else {
        dispatch(setUser(user));
      }
    }
  };

  return (
    <div>
      <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
      <form onSubmit={handleAuth}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">{isSignUp ? 'Sign Up' : 'Sign In'}</button>
      </form>
      <button onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? 'Switch to Sign In' : 'Switch to Sign Up'}
      </button>
    </div>
  );
};

export default Auth;