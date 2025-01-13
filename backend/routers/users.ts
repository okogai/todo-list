import express from 'express';
import User from '../models/User';
import { Error } from 'mongoose';

const usersRouter = express.Router();

usersRouter.post('/', async (req, res, next) => {
    try {
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });

        user.generateToken();

        await user.save();
        res.send(user);
    } catch (error) {
        if (error instanceof Error.ValidationError) {
            res.status(400).send(error);
        }
        next(error);
    }
});

usersRouter.post('/sessions', async (req, res, next) => {
    try {
        const user = await User.findOne({username: req.body.username});
        if (!user) {
            res.status(404).send('User not found');
            return;
        }

        const isMatch = await user.checkPassword(req.body.password);

        user.generateToken();
        await user.save();

        if (!isMatch) {
            res.status(400).send({error: 'Password is wrong'});
            return;
        }
        res.send({message: 'Username and password is correct', user});
    } catch (error) {
        if (error instanceof Error.ValidationError) {
            res.status(400).send(error);
        }
        next(error);
    }
});

export default usersRouter;