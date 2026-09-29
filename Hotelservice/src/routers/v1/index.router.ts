import express from 'express';
import pingRouter from './ping.router';
import hotelRouter from './hotel.router';
import roomGenerationRouter from './roomGeneration.router';
import favoriteRouter from './favorite.router';
import internalRouter from './internal.router';

const v1Router = express.Router();



v1Router.use('/ping',  pingRouter);
v1Router.use('/hotels', hotelRouter);
v1Router.use('/room-generation', roomGenerationRouter);
v1Router.use('/favorites', favoriteRouter);
v1Router.use('/internal', internalRouter);


export default v1Router;