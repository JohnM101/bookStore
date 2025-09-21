// UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import './UserManagement.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      console.error('Error fetching users:', err);
    }
  };

  const handleMakeAdmin = async (userId) => {
    if (!window.confirm('Are you sure you want to make this user an admin?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/make-admin`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to update user role');
      
      // Update the local state to reflect the change
      setUsers(users.map(u => 
        u._id === userId ? { ...u, isAdmin: true } : u
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleRemoveAdmin = async (userId) => {
    if (!window.confirm('Are you sure you want to remove admin privileges from this user?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/remove-admin`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to update user role');
      
      // Update the local state to reflect the change
      setUsers(users.map(u => 
        u._id === userId ? { ...u, isAdmin: false } : u
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete user');
      
      // Remove the user from the local state
      setUsers(users.filter(u => u._id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="user-management">
      <h2>User Management</h2>
      
      <div className="users-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.isAdmin ? 'Admin' : 'User'}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="actions">
                    <button 
                      className="btn-view" 
                      onClick={() => viewUserDetails(user)}
                    >
                      View
                    </button>
                    {!user.isAdmin ? (
                      <button 
                        className="btn-make-admin" 
                        onClick={() => handleMakeAdmin(user._id)}
                      >
                        Make Admin
                      </button>
                    ) : (
                      <button 
                        className="btn-remove-admin" 
                        onClick={() => handleRemoveAdmin(user._id)}
                      >
                        Remove Admin
                      </button>
                    )}
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-users">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedUser && (
        <div className="user-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>User Details</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p><strong>ID:</strong> {selectedUser._id}</p>
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Role:</strong> {selectedUser.isAdmin ? 'Admin' : 'User'}</p>
              <p><strong>Created At:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
              <p><strong>Updated At:</strong> {new Date(selectedUser.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
