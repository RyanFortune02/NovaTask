import './Card.css'; // CSS for styling

// Card component to display task details
function Card({title, type, description, date, time, notification, onDelete, onComplete, onEdit, completed }) {
  return (
    <div className="card-container">
      <div className="card-header">
        <div className="card-title">
          <h3>{title}</h3>
        </div>
        <span className={`card-type ${type.toLowerCase()}`}>{type}</span>
      </div>
      <div className="card-body">
        <p>{description}</p>
        <div className="card-date">
          <span>🗓️ {date}</span>
          <span>⏰ {time}</span>
          <span>🔔 {notification}</span>
        </div>
      </div>
      <div className="card-footer">
        <label className="checkbox-label">
          <input 
            type="checkbox" 
            checked={completed} 
            onChange={onComplete} 
          />
          Complete
        </label>
        <button onClick={onEdit} className="edit-btn">Edit</button>
        <button onClick={onDelete} className="delete-btn">Delete</button>
      </div>
    </div>
  );
}

export default Card;