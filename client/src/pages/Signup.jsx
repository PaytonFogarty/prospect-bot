import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../api';

export default function Signup() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      setError('');
      const res = await api.post('/auth/signup', { email: data.email, password: data.password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: '0 1rem' }}>
      <div className="card">
        <h1 style={{ marginBottom: '0.5rem' }}>ProspectBot</h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Create your account</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" {...register('email', { required: 'Email is required' })} />
            {errors.email && <p className="error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } })} />
            {errors.password && <p className="error">{errors.password.message}</p>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" {...register('confirmPassword', { required: 'Please confirm', validate: v => v === password || 'Passwords do not match' })} />
            {errors.confirmPassword && <p className="error">{errors.confirmPassword.message}</p>}
          </div>

          {error && <p className="error mb-2">{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Get Started
          </button>
        </form>

        <p className="mt-2" style={{ textAlign: 'center', fontSize: '0.875rem' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
