export default function handler(req, res) {
    console.log('Función test invocada - Método:', req.method);
    console.log('URL recibida:', req.url);
    console.log('Body recibido:', req.body);
    res.status(200).json({ message: 'Función test funcionando correctamente' });
  }