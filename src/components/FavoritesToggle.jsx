const FavoritesToggle = ({ active, count, onToggle }) => {
  return (
    <div className='controls'>
      <button
        type='button'
        className='favorites-toggle'
        aria-pressed={active}
        onClick={onToggle}
      >
        {active ? '★' : '☆'} Favorites ({count})
      </button>
    </div>
  );
};

export default FavoritesToggle;
