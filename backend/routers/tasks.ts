import express from "express";
import auth, {RequestWithUser} from "../middleware/auth";
import {Error} from "mongoose";
import Task from "../models/Task";

const tasksRouter = express.Router();

tasksRouter.post('/', auth, async (req, res, next) => {
    const user = (req as RequestWithUser).user;
    if (!user){
        res.status(401).send({error: 'Token not provided!'});
        return;
    }

    try {
        const task = new Task({
            user: user._id,
            ...req.body
        });

        await task.save();
        res.send(task);
    } catch (error) {
        if (error instanceof Error.ValidationError) {
            res.status(400).send(error);
        }
        next(error);
    }
});

tasksRouter.get('/', auth, async (req, res) => {
    const user = (req as RequestWithUser).user;
    if (!user){
        res.status(401).send({error: 'Token not provided!'});
        return;
    }

    const tasks = await Task.find({ user: user._id });
    res.send(tasks);
});

tasksRouter.put('/:id', auth, async (req, res, next) => {
    const user = (req as RequestWithUser).user;
    if (!user){
        res.status(401).send({error: 'Token not provided!'});
        return;
    }

    const { id } = req.params;
    const { title, description, status } = req.body;

    try {
        const task = await Task.findById(id);

        if (!task) {
            res.status(404).json({ error: 'Task not found!' });
            return;
        }

        if (!task.user.equals(user._id)) {
            res.status(403).json({ error: 'Access denied: Not your task!' });
            return;
        }

        const updatedTask = {
            title: title? title : task.title,
            description: description? description : task.description,
            status: status? status : task.status
        }

        task.set(updatedTask);
        await task.save();

        res.send(task);
    } catch (error) {
        if (error instanceof Error.ValidationError) {
            res.status(400).send(error);
        }
        next(error);
    }
});


tasksRouter.delete('/:id', auth, async (req, res) => {
    const user = (req as RequestWithUser).user;

    if (!user){
        res.status(401).send({error: 'Token not provided!'});
        return;
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404).send({ error: 'Task not found!' });
        return;
    }

    if (!task.user.equals(user._id)) {
        res.status(403).send({ error: 'Access denied: Not your task!' });
        return;
    }

    await task.deleteOne();
    res.send({ message: 'Task deleted successfully' });
});

export default tasksRouter;