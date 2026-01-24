import { OpenAPIBackend } from 'openapi-backend/backend';
import path from 'path';
import fs from 'fs';
import yaml from 'yaml';
const openApiPath = path.join(__dirname, '../doc/swaggerdoc.yaml');

const openApiDoc = yaml.parse(
  fs.readFileSync(openApiPath, 'utf8')
);
const api = new OpenAPIBackend({ definition: openApiDoc });

api.register({
  validationFail: (c, req, res) => res.status(400).json({ err: c.validation.errors }),
  notFound: (c, req, res) => res.status(404).json({ err: 'Endpoint not found' }),
  notImplemented: (c, req, res) => res.status(501).json({ err: 'Not implemented' })
});

export default api;