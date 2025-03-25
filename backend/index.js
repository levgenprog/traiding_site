import dotenv from 'dotenv';
import express from 'express';
import { json } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connect } from 'mongoose';
import router from './router/index.mjs';
import errorMiddleware from './middlewares/error-middleware.mjs';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './swagger.mjs'
import http from 'http';
import fs from 'fs';

dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();

app.use(json());
app.use(cookieParser());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(cors({
    credentials: true,
    origin: [process.env.CLIENT_URL, 'http://localhost:5173']
}));

app.use('/api', router);
app.use(errorMiddleware);

// const sslServer = https.createServer({
//     key: fs.readFileSync('/etc/letsencrypt/live/flowcapital.ai/privkey.pem'),
//     cert: fs.readFileSync('/etc/letsencrypt/live/flowcapital.ai/fullchain.pem')
//   }, app);
const sslServer = http.createServer(app);

const start = async () => {
    try {
        await connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        // app.listen(PORT, () => console.log('Server is running on port ' + PORT));
        sslServer.listen(PORT, () => console.log('Server is running on port ' + PORT));
    } catch (e) {
        console.log(e);
    }
};

start();
