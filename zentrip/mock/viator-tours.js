export default [
  {
    url: '/api/viator-tours',
    method: 'post',
    response: () => ({
      products: [
        {
          productCode: 'MOCK1',
          title: 'Mock Tour de Prueba',
          thumbnailUrl: 'https://via.placeholder.com/150',
          price: { formattedPrice: '$50' },
          webUrl: 'https://example.com',
        },
      ],
    }),
  },
];
