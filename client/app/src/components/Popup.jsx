import './Popup.css'

// A Popup component to display a popup message
// @param {Object} props - The properties passed to the component
// @param {boolean} props.trigger - Determines if the popup is visible
// @param {ReactNode} props.children - The content to display inside the popup
function Popup(props) {
  return (props.trigger) ? (
    <div className="popup">
      <div className="popup-inner">
        {props.children}
        <button className="close-btn" onClick={() => props.setTrigger(false)}>Close</button>
      </div>
    </div>
  ) : "";
}

export default Popup
