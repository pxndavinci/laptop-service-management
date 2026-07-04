import 'dotenv/config';
import app from './app';

const port = parseInt(process.env.PORT || '3000', 10);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});
