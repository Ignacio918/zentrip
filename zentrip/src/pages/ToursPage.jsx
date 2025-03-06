import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Map, Calendar } from 'lucide-react';
import ToursSection from '../components/ToursSection';

const ToursPage = () => {
  const [searchLocation, setSearchLocation] = useState('Madrid');
  const [searchInput, setSearchInput] = useState('Madrid');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isSearching, setIsSearching] = useState(false);

  const tourCategories = [
    'Todos',
    'Cultural',
    'Gastronomía',
    'Aventura',
    'Histórico',
    'Familiar',
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
      <div className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Explora los mejores tours y atracciones
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
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="¿Qué lugar quieres explorar?"
                  className="w-full px-10 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className={`px-6 py-3 bg-green-800 text-white rounded-lg hover:bg-green-900 transition focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isSearching ? 'opacity-70 cursor-wait' : ''
                }`}
              >
                {isSearching ? 'Buscando...' : 'Buscar Tours'}
              </button>
            </form>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {tourCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full transition text-sm ${
                    selectedCategory === category
                      ? 'bg-white text-green-800 font-medium'
                      : 'bg-green-700 text-white hover:bg-green-800'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-12">
        <ToursSection initialLocation={searchLocation} />
      </div>

      {/* Sección de beneficios */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Descubre experiencias inolvidables
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Map className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Tours guiados</h3>
              <p className="text-gray-600">
                Descubre los secretos de cada destino con guías expertos
                locales.
              </p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reserva flexible</h3>
              <p className="text-gray-600">
                Cambia tus planes sin preocupaciones con nuestras políticas de
                cancelación.
              </p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Mejor precio garantizado
              </h3>
              <p className="text-gray-600">
                Encontramos las mejores ofertas para que disfrutes sin gastar de
                más.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de testimonios */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Lo que dicen nuestros viajeros
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 flex">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "La visita guiada por Madrid fue increíble. Nuestro guía conocía
                cada detalle histórico y nos llevó a lugares que nunca
                hubiéramos descubierto por nuestra cuenta."
              </p>
              <p className="font-medium">- María G.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 flex">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "El tour gastronómico en Barcelona superó todas nuestras
                expectativas. Probamos platos increíbles y el guía nos contó
                secretos culinarios fascinantes."
              </p>
              <p className="font-medium">- Carlos M.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 flex">
                  {'★★★★'.split('').map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Reservar a través de Zentrip fue muy sencillo y tuvimos una
                experiencia maravillosa en el tour de flamenco en Sevilla. ¡Lo
                recomendaré a todos mis amigos!"
              </p>
              <p className="font-medium">- Laura P.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToursPage;
