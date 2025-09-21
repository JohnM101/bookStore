//src/componenrs/admin/OrderManagement.jsx
import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import './OrderManagement.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const { user } = useUser();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      console.error('Error fetching orders:', err);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdateError(null);
      
      // Log for debugging purposes
      console.log(`Updating order ${orderId} to status: ${status}`);
      console.log(`Using token: ${user.token ? "Token exists" : "No token"}`);
      
      // Try with modified endpoint that doesn't include /admin prefix
      const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      // Check for specific error status codes
      if (response.status === 404) {
        console.error('Endpoint not found. Trying alternate endpoint...');
        
        // Try alternate endpoint format if first one fails
        const altResponse = await fetch(`${API_URL}/api/orders/status/${orderId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status })
        });
        
        if (!altResponse.ok) {
          const errorText = await altResponse.text();
          throw new Error(`Failed to update order status: ${altResponse.status} - ${errorText || 'Unknown error'}`);
        }
        
        // If successful with alternate endpoint
        console.log('Order status updated successfully with alternate endpoint');
      } else if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update order status: ${response.status} - ${errorText || 'Unknown error'}`);
      } else {
        console.log('Order status updated successfully');
      }
      
      // Update the local state to reflect the change
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status } : order
      ));
      
      // If the current selected order is being updated, update it too
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (error) {
      setUpdateError(`Error: ${error.message}`);
      console.error('Error updating order status:', error);
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const getFilteredOrders = () => {
    if (filterStatus === 'all') return orders;
    return orders.filter(order => order.status === filterStatus);
  };

  const filteredOrders = getFilteredOrders();

  const getStatusClassName = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  if (loading) return <div className="loading">Loading orders...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="order-management">
      <h2>Order Management</h2>
      
      {updateError && (
        <div className="error-message">
          {updateError}
          <button onClick={() => setUpdateError(null)}>Dismiss</button>
        </div>
      )}
      
      <div className="filters">
        <label htmlFor="status-filter">Filter by Status:</label>
        <select 
          id="status-filter" 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      
      <div className="orders-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id.substring(0, 8)}...</td>
                  <td>{order.user?.name || 'Unknown User'}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>₱{order.totalPrice.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${getStatusClassName(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="actions">
                    <button 
                      className="btn-view" 
                      onClick={() => viewOrderDetails(order)}
                    >
                      View
                    </button>
                    <select 
                      value={order.status} 
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-orders">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedOrder && (
        <div className="order-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Order Details</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="order-info">
                <p><strong>Order ID:</strong> {selectedOrder._id}</p>
                <p>
                  <strong>Status:</strong> 
                  <span className={`status-badge ${getStatusClassName(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </p>
                <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                <p><strong>Customer:</strong> {selectedOrder.user?.name || 'Unknown'}</p>
                <p><strong>Email:</strong> {selectedOrder.user?.email || 'Unknown'}</p>
              </div>
              
              <div className="shipping-info">
                <h4>Shipping Information</h4>
                <p><strong>Address:</strong> {selectedOrder.shippingAddress?.address || selectedOrder.shippingAddress?.street || 'Not provided'}</p>
                <p><strong>City:</strong> {selectedOrder.shippingAddress?.city || 'Not provided'}</p>
                <p><strong>Postal Code:</strong> {selectedOrder.shippingAddress?.postalCode || 'Not provided'}</p>
                <p><strong>Country:</strong> {selectedOrder.shippingAddress?.country || 'Philippines'}</p>
              </div>
              
              <div className="payment-info">
                <h4>Payment Information</h4>
                <p><strong>Method:</strong> {selectedOrder.paymentMethod || 'Not specified'}</p>
                <p><strong>Paid:</strong> {selectedOrder.isPaid ? 
                  `Yes (${new Date(selectedOrder.paidAt).toLocaleString()})` : 
                  'No'}</p>
                <p><strong>Delivered:</strong> {selectedOrder.isDelivered ? 
                  `Yes (${new Date(selectedOrder.deliveredAt).toLocaleString()})` : 
                  'No'}</p>
              </div>
              
              <div className="order-items">
                <h4>Order Items</h4>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.orderItems?.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="item-thumbnail" 
                          />
                        </td>
                        <td>{item.name}</td>
                        <td>{item.qty || item.quantity || 1}</td>
                        <td>₱{item.price.toFixed(2)}</td>
                        <td>₱{((item.qty || item.quantity || 1) * item.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="order-summary">
                <h4>Order Summary</h4>
                {selectedOrder.itemsPrice !== undefined && (
                  <p><strong>Items Price:</strong> ₱{selectedOrder.itemsPrice.toFixed(2)}</p>
                )}
                {selectedOrder.shippingPrice !== undefined && (
                  <p><strong>Shipping Price:</strong> ₱{selectedOrder.shippingPrice.toFixed(2)}</p>
                )}
                {selectedOrder.taxPrice !== undefined && (
                  <p><strong>Tax Price:</strong> ₱{selectedOrder.taxPrice.toFixed(2)}</p>
                )}
                <p className="total-price"><strong>Total Price:</strong> ₱{selectedOrder.totalPrice.toFixed(2)}</p>
              </div>
              
              <div className="update-status">
                <h4>Update Order Status</h4>
                <select 
                  value={selectedOrder.status} 
                  onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
                  className="status-select-large"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
