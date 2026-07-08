import { env } from './config/env';
import app from './app';

app.listen(env.port, () => {
  console.log(`Server is running on port ${env.port}`);
  console.log(`Swagger UI available at http://localhost:${env.port}/api-docs`);
});
