import { Link } from 'react-router';

const CoinCard = ({ coin, isFavorite, onToggleFavorite }) => {
  return (
    <div className='coin-card'>
      <Link to={`/coin/${coin.id}`} className='coin-card-link'>
        <div className='coin-header'>
          <img src={coin.image} alt={coin.name} className='coin-image' />
          <div>
            <h2>{coin.name}</h2>
            <p className='symbol'>{coin.symbol.toUpperCase()}</p>
          </div>
        </div>
        <p>
          Price:{' '}
          {coin.current_price != null
            ? `$${coin.current_price.toLocaleString()}`
            : 'N/A'}
        </p>
        {coin.price_change_percentage_24h != null ? (
          <p
            className={
              coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'
            }
          >
            {coin.price_change_percentage_24h.toFixed(2)} %
          </p>
        ) : (
          <p>24h Change: N/A</p>
        )}
        <p>Market Cap: {coin.market_cap?.toLocaleString() ?? 'N/A'}</p>
      </Link>
      <button
        type='button'
        className='favorite-button'
        aria-pressed={isFavorite}
        aria-label={`Favorite ${coin.name}`}
        onClick={() => onToggleFavorite(coin.id)}
      >
        {isFavorite ? '★' : '☆'}
      </button>
    </div>
  );
};

export default CoinCard;
