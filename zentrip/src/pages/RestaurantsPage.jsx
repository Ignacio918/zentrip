import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Utensils } from 'lucide-react';
import RestaurantsSection from '../components/RestaurantsSection';

const RestaurantsPage = () => {
  const [searchLocation, setSearchLocation] = useState('Madrid');
  const [searchInput, setSearchInput] = useState('Madrid');
  const [selectedCuisine, setSelectedCuisine] = useState('Todos');
  const [isSearching, setIsSearching] = useState(false);

  const cuisineTypes = [
    'Todos',
    'Española',
    'Italiana',
    'Mediterránea',
    'Japonesa',
    'Internacional',
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setIsSearching(true);
      setSearchLocation(searchInput);

      // Simular una pequeña espera para efectos visuales
      setTimeout(() => {
        setIsSearching(false);
      }, 800);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-red-600 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Descubre los mejores restaurantes
          </motion.h1>

          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <form
              onSubmit={handleSearch}
              className="flex flex-col md:flex-row gap-4"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="¿Dónde quieres comer?"
                  className="w-full px-10 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className={`px-6 py-3 bg-red-800 text-white rounded-lg hover:bg-red-900 transition focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  isSearching ? 'opacity-70 cursor-wait' : ''
                }`}
              >
                {isSearching ? 'Buscando...' : 'Buscar Restaurantes'}
              </button>
            </form>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {cuisineTypes.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => setSelectedCuisine(cuisine)}
                  className={`px-4 py-2 rounded-full transition text-sm ${
                    selectedCuisine === cuisine
                      ? 'bg-white text-red-800 font-medium'
                      : 'bg-red-700 text-white hover:bg-red-800'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-12">
        <RestaurantsSection initialLocation={searchLocation} />
      </div>

      {/* Sección de características */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Encuentra el restaurante perfecto
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-100 rounded-lg shadow-sm">
              <div className="mb-4 text-red-600">
                <Utensils size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Todas las cocinas</h3>
              <p className="text-gray-600">
                Desde tapas tradicionales españolas hasta sushi japonés,
                encuentra la cocina que más te guste.
              </p>
            </div>

            <div className="p-6 border border-gray-100 rounded-lg shadow-sm">
              <div className="mb-4 text-red-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Reseñas verificadas
              </h3>
              <p className="text-gray-600">
                Lee opiniones de clientes reales para ayudarte a tomar la mejor
                decisión.
              </p>
            </div>

            <div className="p-6 border border-gray-100 rounded-lg shadow-sm">
              <div className="mb-4 text-red-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Reserva fácil</h3>
              <p className="text-gray-600">
                Reserva una mesa en tus restaurantes favoritos con solo unos
                clics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantsPage;
