import { useState } from 'react';
import CoinCard from '../components/CoinCard';
import UnavailableCoinCard from '../components/UnavailableCoinCard';
import LimitSelector from '../components/LimitSelector';
import FilterInput from '../components/FilterInput';
import SortSelector from '../components/SortSelector';
import FavoritesToggle from '../components/FavoritesToggle';
import Spinner from '../components/Spinner';
import useCoinList from '../hooks/useCoinList';
import useFavorites from '../hooks/useFavorites';

// CoinGecko accepts at most 250 ids per request
const MAX_IDS = 250;

const HomePage = () => {
  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('market_cap_desc');
  const { favorites, toggleFavorite } = useFavorites();
  // IDs to fetch for the favorites view, or null when it is off. Kept separate
  // from favorites so unstarring a coin doesn't trigger a refetch.
  const [favoriteIds, setFavoriteIds] = useState(null);
  const showFavorites = favoriteIds !== null;

  // Another tab can add favorites while the view is on
  if (showFavorites && favorites.some((id) => !favoriteIds.includes(id))) {
    setFavoriteIds(favorites);
  }

  const list = useCoinList(`per_page=${limit}`);
  const requestedIds = favoriteIds?.slice(0, MAX_IDS) ?? [];
  const favoritesQuery = requestedIds.length
    ? `ids=${requestedIds.map(encodeURIComponent).join(',')}&per_page=${MAX_IDS}`
    : null;
  const favoriteList = useCoinList(favoritesQuery);

  const noFavorites = showFavorites && favorites.length === 0;
  const { coins, loading, error } = showFavorites ? favoriteList : list;

  const filteredCoins = coins
    .filter((coin) => !showFavorites || favorites.includes(coin.id))
    .filter((coin) => {
      return (
        coin.name.toLowerCase().includes(filter.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(filter.toLowerCase())
      );
    })
    .slice()
    .sort((a, b) => {
      switch (sortBy) {
        case 'market_cap_desc':
          return b.market_cap - a.market_cap;
        case 'market_cap_asc':
          return a.market_cap - b.market_cap;
        case 'price_desc':
          return b.current_price - a.current_price;
        case 'price_asc':
          return a.current_price - b.current_price;
        case 'change_desc':
          return b.price_change_percentage_24h - a.price_change_percentage_24h;
        case 'change_asc':
          return a.price_change_percentage_24h - b.price_change_percentage_24h;
      }
    });

  // CoinGecko omits coins it has no data for, such as delisted ones. They still
  // need a card, or they could never be unstarred.
  const unavailableIds =
    showFavorites && favoriteList.loadedQuery === favoritesQuery
      ? requestedIds.filter(
          (id) =>
            favorites.includes(id) &&
            !coins.some((coin) => coin.id === id) &&
            id.toLowerCase().includes(filter.toLowerCase())
        )
      : [];

  return (
    <div>
      <h1>🚀 Crypto Dash</h1>
      {!noFavorites && loading && <Spinner color='white' />}
      {!noFavorites && error && <div className='error'>{error}</div>}

      <div className='top-controls'>
        <FilterInput filter={filter} onFilterChange={setFilter} />
        <FavoritesToggle
          active={showFavorites}
          count={favorites.length}
          onToggle={() => setFavoriteIds(showFavorites ? null : favorites)}
        />
        <LimitSelector
          limit={limit}
          onLimitChange={setLimit}
          disabled={showFavorites}
        />
        <SortSelector sortBy={sortBy} onSortChange={setSortBy} />
      </div>

      {noFavorites && <p>No favorites yet</p>}

      {!noFavorites && !loading && !error && (
        <main className='grid'>
          {filteredCoins.map((coin) => (
            <CoinCard
              key={coin.id}
              coin={coin}
              isFavorite={favorites.includes(coin.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
          {unavailableIds.map((id) => (
            <UnavailableCoinCard
              key={id}
              id={id}
              onToggleFavorite={toggleFavorite}
            />
          ))}
          {filteredCoins.length === 0 && unavailableIds.length === 0 && (
            <p>No matching coins</p>
          )}
        </main>
      )}
    </div>
  );
};

export default HomePage;
