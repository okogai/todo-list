import mongoose from 'mongoose';
import crypto from 'crypto';
import User from './models/User';
import Task from './models/Task';

const run = async () => {
    await mongoose.connect('mongodb://localhost:27017/todo-list');

    const db = mongoose.connection;

    try {
        await db.dropCollection('users');
        await db.dropCollection('tasks');
    } catch (e) {
        console.log('Collections not found, skipping drop...');
    }

    const [johnDoe, janeDoe] = await User.create(
        {
            username: 'john',
            password: '123',
            token: crypto.randomUUID(),
        },
        {
            username: 'jane',
            password: '345',
            token: crypto.randomUUID(),
        }
    );

    await Task.create(
        {
            user: johnDoe._id,
            title: 'Complete project report',
            description: 'Finish the monthly project report by Friday.',
            status: 'new',
        },
        {
            user: johnDoe._id,
            title: 'Plan team meeting',
            description: 'Schedule the team meeting for next week.',
            status: 'in_progress',
        },
        {
            user: janeDoe._id,
            title: 'Buy groceries',
            description: 'Pick up vegetables, fruits, and milk from the store.',
            status: 'complete',
        },
        {
            user: janeDoe._id,
            title: 'Exercise',
            description: 'Go for a 30-minute run.',
            status: 'new',
        }
    );

    console.log('Fixture data created successfully!');
    await db.close();
};

run().catch(console.error);
