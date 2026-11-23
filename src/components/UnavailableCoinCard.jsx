const UnavailableCoinCard = ({ id, onToggleFavorite }) => {
  return (
    <div className='coin-card'>
      <div className='coin-card-unavailable'>
        <div className='coin-header'>
          <h2>{id}</h2>
        </div>
        <p>No data available for this coin</p>
      </div>
      <button
        type='button'
        className='favorite-button'
        aria-pressed={true}
        aria-label={`Favorite ${id}`}
        onClick={() => onToggleFavorite(id)}
      >
        ★
      </button>
    </div>
  );
};

export default UnavailableCoinCard;
