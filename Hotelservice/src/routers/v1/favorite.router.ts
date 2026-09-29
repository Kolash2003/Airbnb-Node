import express from 'express';
import { requireAuth, AuthUser } from '../../middlewares/auth.middleware';
import { addFavoriteService, listFavoriteIdsService, removeFavoriteService } from '../../services/favorite.service';

const favoriteRouter = express.Router();

favoriteRouter.use(requireAuth);

favoriteRouter.get('/', async (req, res) => {
    const ids = await listFavoriteIdsService((res.locals.user as AuthUser).id);
    res.status(200).json({ message: "Favorites fetched", data: ids, success: true });
});

favoriteRouter.put('/:hotelId', async (req, res) => {
    await addFavoriteService((res.locals.user as AuthUser).id, Number(req.params.hotelId));
    res.status(200).json({ message: "Saved to favorites", data: null, success: true });
});

favoriteRouter.delete('/:hotelId', async (req, res) => {
    await removeFavoriteService((res.locals.user as AuthUser).id, Number(req.params.hotelId));
    res.status(200).json({ message: "Removed from favorites", data: null, success: true });
});

export default favoriteRouter;
