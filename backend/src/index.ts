import createApp from './app';
import dotenv from 'dotenv';

dotenv.config();

const port = parseInt(process.env.PORT!, 10) || 3001;
const app = createApp();

app.listen(port, '0.0.0.0', () => {
  console.log(`[server]: Server is running at http://0.0.0.0:${port}`);
});

export default app;
