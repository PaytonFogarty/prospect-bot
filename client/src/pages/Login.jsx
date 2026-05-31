import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../api';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setError('');
      const res = await api.post('/auth/login', data);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: '0 1rem' }}>
      <div className="card">
        <h1 style={{ marginBottom: '0.5rem' }}>Revara</h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Sign in to your account</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" {...register('email', { required: 'Email is required' })} />
            {errors.email && <p className="error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" {...register('password', { required: 'Password is required' })} />
            {errors.password && <p className="error">{errors.password.message}</p>}
          </div>

          {error && <p className="error mb-2">{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Sign In
          </button>
        </form>

        <p className="mt-2" style={{ textAlign: 'center', fontSize: '0.875rem' }}>
          Don't have an account? <Link to="/signup">Start your free trial</Link>
        </p>
      </div>
    </div>
  );
}
