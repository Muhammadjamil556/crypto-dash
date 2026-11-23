import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import Spinner from '../components/Spinner';
import CoinChart from '../components/CoinChart';
const API_URL = import.meta.env.VITE_COIN_API_URL;

// CoinGecko returns null or omits market fields for some coins
const formatNumber = (value) => value?.toLocaleString() ?? 'N/A';
const formatUsd = (value) =>
  value != null ? `$${value.toLocaleString()}` : 'N/A';
// new Date(null) is 1970, so missing dates need their own check
const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : null;

const formatPriceChange = (change, percentage) => {
  const parts = [];
  if (change != null) parts.push(`$${change.toFixed(2)}`);
  if (percentage != null) parts.push(`(${percentage.toFixed(2)}%)`);
  return parts.join(' ') || 'N/A';
};

const formatRecord = (price, date) => {
  const formattedDate = formatDate(date);
  return price != null && formattedDate
    ? `${formatUsd(price)} on ${formattedDate}`
    : formatUsd(price);
};

const CoinDetailsPage = () => {
  const { id } = useParams();
  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Abort superseded requests so a stale response can't overwrite newer state
    const controller = new AbortController();

    const fetchCoin = async () => {
      // Clear the previous coin so its name doesn't stay in the title
      setCoin(null);
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_URL}/${id}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Failed to fetch data');
        const data = await res.json();
        setCoin(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.log(err);
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchCoin();

    return () => controller.abort();
  }, [id]);

  const market = coin?.market_data;
  const description = coin?.description?.en;
  const homepage = coin?.links?.homepage?.[0];
  const explorer = coin?.links?.blockchain_site?.[0];

  return (
    <div className='coin-details-container'>
      <Link to='/'>← Back To Home</Link>

      <h1 className='coin-details-title'>
        {coin
          ? `${coin.name}${coin.symbol ? ` (${coin.symbol.toUpperCase()})` : ''}`
          : 'Coin Details'}
      </h1>

      {loading && <Spinner />}
      {error && <div className='error'>❌ {error}</div>}

      {!loading && !error && coin && (
        <>
          <img
            src={coin.image?.large}
            alt={coin.name}
            className='coin-details-image'
          />

          {description && <p>{description.split('. ')[0] + '.'}</p>}

          <div className='coin-details-info'>
            <h3>
              Rank:{' '}
              {coin.market_cap_rank != null ? `#${coin.market_cap_rank}` : 'N/A'}
            </h3>
            <h3>Current Price: {formatUsd(market?.current_price?.usd)}</h3>
            <h4>Market Cap: {formatUsd(market?.market_cap?.usd)}</h4>
            <h4>24h High: {formatUsd(market?.high_24h?.usd)}</h4>
            <h4>24h Low: {formatUsd(market?.low_24h?.usd)}</h4>
            <h4>
              24h Price Change:{' '}
              {formatPriceChange(
                market?.price_change_24h,
                market?.price_change_percentage_24h
              )}
            </h4>
            <h4>
              Circulating Supply: {formatNumber(market?.circulating_supply)}
            </h4>
            <h4>Total Supply: {formatNumber(market?.total_supply)}</h4>
            <h4>
              All-Time High:{' '}
              {formatRecord(market?.ath?.usd, market?.ath_date?.usd)}
            </h4>
            <h4>
              All-Time Low:{' '}
              {formatRecord(market?.atl?.usd, market?.atl_date?.usd)}
            </h4>
            <h4>Last Updated: {formatDate(coin.last_updated) ?? 'N/A'}</h4>
          </div>

          <CoinChart coinId={coin.id} />

          <div className='coin-details-links'>
            {homepage && (
              <p>
                🌐{' '}
                <a
                  href={homepage}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Website
                </a>
              </p>
            )}
            {explorer && (
              <p>
                🧩{' '}
                <a
                  href={explorer}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Blockchain Explorer
                </a>
              </p>
            )}
            {coin.categories?.length > 0 && (
              <p>Categories: {coin.categories.join(', ')}</p>
            )}
          </div>
        </>
      )}

      {!loading && !error && !coin && <p>No Data Found!</p>}
    </div>
  );
};

export default CoinDetailsPage;
