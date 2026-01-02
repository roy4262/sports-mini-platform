import { useEffect, useState } from "react";
import API from "../services/api";

export default function Games() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState("All");
  const [sports, setSports] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchMatches() {
      try {
        console.log("Fetching games from backend...");
        const res = await API.get("/games");
        console.log("Games response:", res);
        setMatches(res.data);

        // Extract unique sports
        const uniqueSports = ["All", ...new Set(res.data.map((m) => m.sport))];
        setSports(uniqueSports);

        // Fetch user's favorites
        try {
          const favRes = await API.get("/favorites");
          setFavorites(favRes.data || []);
        } catch (err) {
          console.log("Not authenticated or no favorites yet");
        }
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, []);

  // Toggle favorite
  const toggleFavorite = async (matchId) => {
    try {
      if (favorites.includes(matchId)) {
        await API.delete(`/favorites/${matchId}`);
        setFavorites(favorites.filter((id) => id !== matchId));
      } else {
        await API.post(`/favorites/${matchId}`);
        setFavorites([...favorites, matchId]);
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  };

  // Filter matches based on selected sport, favorites and search
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredMatches = matches.filter((match) => {
    const sportMatch = selectedSport === "All" || match.sport === selectedSport;
    const favoriteMatch = !showFavoritesOnly || favorites.includes(match.id);

    const searchMatch =
      !normalizedSearch ||
      (match.team_a && match.team_a.toLowerCase().includes(normalizedSearch)) ||
      (match.team_b && match.team_b.toLowerCase().includes(normalizedSearch)) ||
      (match.league && match.league.toLowerCase().includes(normalizedSearch)) ||
      (match.sport && match.sport.toLowerCase().includes(normalizedSearch));

    return sportMatch && favoriteMatch && searchMatch;
  });

  // Pagination (client-side)
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(6);
  const totalPages = Math.max(1, Math.ceil(filteredMatches.length / perPage));
  const paginatedMatches = filteredMatches.slice(
    (page - 1) * perPage,
    page * perPage
  );

  if (loading)
    return <div className="text-center p-10 text-xl">Loading matches...</div>;

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-8 text-center"></h1>

      {/* Search */}
      <div className="mb-6 flex justify-center">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by team, league, or sport..."
          className="w-full max-w-lg p-3 rounded-lg bg-white/10 placeholder-white/60 text-white border border-white/20 focus:outline-none"
        />
      </div>

      {/* Filter Section */}
      <div className="mb-8 flex flex-wrap gap-3 justify-center">
        <span className="text-lg font-semibold self-center">
          Filter by Sport:
        </span>
        {sports.map((sport) => (
          <button
            key={sport}
            onClick={() => setSelectedSport(sport)}
            className={`cursor-pointer px-6 py-2 rounded-full font-semibold transition-all ${
              selectedSport === sport
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white/20 text-white/80 hover:bg-white/30"
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      {/* Favorites Toggle */}
      <div className="mb-6 flex justify-center">
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`cursor-pointer px-6 py-2 rounded-full font-semibold transition-all flex items-center gap-2 ${
            showFavoritesOnly
              ? "bg-red-600 text-white shadow-lg"
              : "bg-white/20 text-white/80 hover:bg-white/30"
          }`}
        >
          ❤️ Show Favorites ({favorites.length})
        </button>
      </div>

      {/* Results count */}
      <p className="text-center text-white/70 mb-6">
        Showing {filteredMatches.length} match
        {filteredMatches.length !== 1 ? "es" : ""}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {paginatedMatches.map((match) => (
          <div
            key={match.id}
            className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-white/20 hover:scale-[1.02] transition-transform relative"
          >
            {/* Favorite Heart Button */}
            <button
              onClick={() => toggleFavorite(match.id)}
              className="cursor-pointer absolute top-3 right-3 text-2xl bg-black/40 p-2 rounded-full hover:bg-black/60 transition-all z-10"
              title={
                favorites.includes(match.id)
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
            >
              {favorites.includes(match.id) ? "❤️" : "🤍"}
            </button>

            <img
              src={match.image}
              alt={match.sport}
              onError={(e) =>
                (e.target.src =
                  "https://via.placeholder.com/640x480?text=No+Image")
              }
              className="w-full h-48 object-cover"
            />

            <div className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold">
                  {match.team_a} vs {match.team_b}
                </h2>
                <span className="text-xs bg-green-800 px-2 py-1 rounded text-white/70">
                  ID: {match.id}
                </span>
              </div>
              <p className="text-sm opacity-80">
                {match.sport} • {match.league}
              </p>
              <p className="text-sm opacity-70">
                {new Date(match.start_time).toLocaleString()}
              </p>

              <button className="mt-2 w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-medium">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className={`px-4 py-2 rounded cursor-pointer ${
            page === 1 ? "bg-white/10 text-white/50" : "bg-white/20 text-white"
          }`}
        >
          Prev
        </button>

        <div className="flex gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const p = idx + 1;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded cursor-pointer ${
                  page === p
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 text-white/80"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className={`px-4 py-2 rounded cursor-pointer ${
            page === totalPages
              ? "bg-white/10 text-white/50"
              : "bg-white/20 text-white"
          }`}
        >
          Next
        </button>

        <select
          value={perPage}
          onChange={(e) => {
            setPerPage(Number(e.target.value));
            setPage(1);
          }}
          className="ml-4 cursor-pointer bg-gray-800 text-white p-2 rounded border border-white/20 focus:outline-none focus:border-blue-500"
        >
          <option value={3}>3 / page</option>
          <option value={6}>6 / page</option>
          <option value={9}>9 / page</option>
        </select>
      </div>
    </div>
  );
}
