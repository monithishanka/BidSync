import { Link } from 'react-router-dom';
import { IoTime, IoLocation, IoCash, IoPeople, IoLockClosed, IoBusiness, IoDocument } from 'react-icons/io5';
import './RFQCard.css';

const RFQCard = ({ rfq }) => {
  const getTimeRemaining = (closingDate) => {
    const now = new Date();
    const closing = new Date(closingDate);
    const diff = closing - now;
    
    if (diff <= 0) return 'Closed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Closing soon';
  };

  const getStatusClass = () => {
    if (rfq.status === 'awarded') return 'status-awarded';
    if (rfq.status === 'closed') return 'status-closed';
    if (rfq.status === 'cancelled') return 'status-cancelled';
    
    const now = new Date();
    const closing = new Date(rfq.closingDate);
    const diff = closing - now;
    const daysLeft = diff / (1000 * 60 * 60 * 24);
    
    if (daysLeft <= 2) return 'status-urgent';
    return 'status-open';
  };

  return (
    <Link to={`/tenders/${rfq._id}`} className={`rfq-card ${getStatusClass()}`}>
      {/* Top Right: Status Badges */}
      <div className="rfq-status-badges">
        {rfq.isSealed && (
          <span className="rfq-badge rfq-sealed-badge">
            <IoLockClosed size={10} /> Sealed
          </span>
        )}
        {rfq.status === 'cancelled' && (
          <span className="rfq-badge rfq-cancelled-badge">Cancelled</span>
        )}
        {rfq.status === 'closed' && (
          <span className="rfq-badge rfq-closed-badge">Closed</span>
        )}
        {rfq.status === 'awarded' && (
          <span className="rfq-badge rfq-awarded-badge">Awarded</span>
        )}
        {rfq.status === 'open' && rfq.isSealed && null}
      </div>

      {/* Row 1: Category Pill */}
      <span className="rfq-category">{rfq.category}</span>

      {/* Row 2: Title */}
      <h3 className="rfq-title">{rfq.title}</h3>
      
      {/* Row 3: Description */}
      <p className="rfq-description">{rfq.description}</p>
      
      {/* Row 4: Meta Info (Time, Location, Budget, Bids) */}
      <div className="rfq-meta">
        <div className="rfq-meta-item">
          <IoTime size={14} />
          <span className={getStatusClass()}>
            {rfq.status === 'cancelled' ? 'Cancelled' : getTimeRemaining(rfq.closingDate)}
          </span>
        </div>
        {rfq.deliveryLocation && (
          <div className="rfq-meta-item">
            <IoLocation size={14} />
            <span>{rfq.deliveryLocation}</span>
          </div>
        )}
        {rfq.budgetPrice && rfq.showBudget && (
          <div className="rfq-meta-item rfq-budget">
            <IoCash size={14} />
            <span>LKR {rfq.budgetPrice.toLocaleString()}</span>
          </div>
        )}
        <div className="rfq-meta-item">
          <IoPeople size={14} />
          <span>{rfq.bidCount || 0} bids</span>
        </div>
      </div>
      
      {/* Row 5: Buyer + Reference Code */}
      <div className="rfq-footer">
        <span className="rfq-footer-item">
          <IoBusiness size={14} />
          {rfq.organization || 'Organization'}
        </span>
        <span className="rfq-footer-item">
          <IoDocument size={14} />
          {rfq.referenceId}
        </span>
      </div>
    </Link>
  );
};

export default RFQCard;
