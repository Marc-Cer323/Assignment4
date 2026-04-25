require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const authJwtController = require('./auth_jwt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./Users');
const Movie = require('./Movies');
const Review = require('./Reviews');

// Connect to MongoDB
mongoose.connect(process.env.DB)
    .then(() => {
        console.log('Connected to MongoDB');
        seedMovies().catch(console.error);
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

const router = express.Router();

// Seed at least 5 movies with imageUrls
async function seedMovies() {
    const count = await Movie.countDocuments();
    if (count > 0) {
        // Always update imageUrls to ensure they are current
        await Movie.updateOne({ title: 'The Dark Knight' },
            { $set: { imageUrl: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg' } });
        await Movie.updateOne({ title: 'Inception' },
            { $set: { imageUrl: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg' } });
        await Movie.updateOne({ title: 'The Shawshank Redemption' },
            { $set: { imageUrl: 'https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg' } });
        await Movie.updateOne({ title: 'The Silence of the Lambs' },
            { $set: { imageUrl: 'https://m.media-amazon.com/images/M/MV5BNjNhZTk0ZmEtNjJhMi00YzFlLWE1MmEtYzM1M2ZmMGMwMTU4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg' } });
        await Movie.updateOne({ title: 'The Lord of the Rings: The Fellowship of the Ring' },
            { $set: { imageUrl: 'https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_SX300.jpg' } });
        return;
    }

    await Movie.insertMany([
        {
            title: 'The Dark Knight',
            releaseDate: 2008,
            genre: 'Action',
            imageUrl: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg',
            actors: [
                { actorName: 'Christian Bale', characterName: 'Bruce Wayne' },
                { actorName: 'Heath Ledger', characterName: 'The Joker' },
                { actorName: 'Aaron Eckhart', characterName: 'Harvey Dent' }
            ]
        },
        {
            title: 'Inception',
            releaseDate: 2010,
            genre: 'Science Fiction',
            imageUrl: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
            actors: [
                { actorName: 'Leonardo DiCaprio', characterName: 'Cobb' },
                { actorName: 'Joseph Gordon-Levitt', characterName: 'Arthur' },
                { actorName: 'Elliot Page', characterName: 'Ariadne' }
            ]
        },
        {
            title: 'The Shawshank Redemption',
            releaseDate: 1994,
            genre: 'Drama',
            imageUrl: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NiYyLTg3YzItOTc2M2JlZjdiOTVhXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg',
            actors: [
                { actorName: 'Tim Robbins', characterName: 'Andy Dufresne' },
                { actorName: 'Morgan Freeman', characterName: 'Ellis Boyd Redding' },
                { actorName: 'Bob Gunton', characterName: 'Warden Norton' }
            ]
        },
        {
            title: 'The Silence of the Lambs',
            releaseDate: 1991,
            genre: 'Thriller',
            imageUrl: 'https://m.media-amazon.com/images/M/MV5BNjNhZTk0ZmEtNjJhMi00YzFlLWE1MmEtYzM1M2ZmMGMwMTU4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg',
            actors: [
                { actorName: 'Jodie Foster', characterName: 'Clarice Starling' },
                { actorName: 'Anthony Hopkins', characterName: 'Hannibal Lecter' },
                { actorName: 'Scott Glenn', characterName: 'Jack Crawford' }
            ]
        },
        {
            title: 'The Lord of the Rings: The Fellowship of the Ring',
            releaseDate: 2001,
            genre: 'Fantasy',
            imageUrl: 'https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_SX300.jpg',
            actors: [
                { actorName: 'Elijah Wood', characterName: 'Frodo Baggins' },
                { actorName: 'Ian McKellen', characterName: 'Gandalf' },
                { actorName: 'Viggo Mortensen', characterName: 'Aragorn' }
            ]
        }
    ]);
    console.log('Seeded 5 movies with images');
}

// POST /signup
router.post('/signup', async (req, res) => {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({ success: false, msg: 'Please include both username and password to signup.' });
    }
    try {
        const user = new User({
            name: req.body.name,
            username: req.body.username,
            password: req.body.password,
        });
        await user.save();
        res.status(201).json({ success: true, msg: 'Successfully created new user.' });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ success: false, message: 'A user with that username already exists.' });
        }
        return res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
});

// POST /signin
router.post('/signin', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username }).select('name username password');
        if (!user) {
            return res.status(401).json({ success: false, msg: 'Authentication failed. User not found.' });
        }
        const isMatch = await user.comparePassword(req.body.password);
        if (isMatch) {
            const userToken = { id: user._id, username: user.username };
            const token = jwt.sign(userToken, process.env.SECRET_KEY, { expiresIn: '1h' });
            res.json({ success: true, token: 'JWT ' + token });
        } else {
            res.status(401).json({ success: false, msg: 'Authentication failed. Incorrect password.' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
});

// GET /movies - returns all movies sorted by average rating
// POST /movies - creates a new movie
router.route('/movies')
    .get(authJwtController.isAuthenticated, async (req, res) => {
        try {
            const movies = await Movie.aggregate([
                {
                    $lookup: {
                        from: 'reviews',
                        localField: '_id',
                        foreignField: 'movieId',
                        as: 'movieReviews'
                    }
                },
                {
                    $addFields: {
                        avgRating: { $avg: '$movieReviews.rating' }
                    }
                },
                {
                    $sort: { avgRating: -1 }
                }
            ]);
            res.status(200).json(movies);
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    })
    .post(authJwtController.isAuthenticated, async (req, res) => {
        const { title, releaseDate, genre, actors, imageUrl } = req.body;
        if (!title || !releaseDate || !genre || !actors || actors.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Movie must include title, releaseDate, genre, and at least 3 actors.'
            });
        }
        try {
            const movie = new Movie({ title, releaseDate, genre, actors, imageUrl });
            await movie.save();
            res.status(201).json({ success: true, movie });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    })
    .put(authJwtController.isAuthenticated, (req, res) => {
        res.status(405).json({ success: false, message: 'HTTP method not supported on /movies.' });
    })
    .delete(authJwtController.isAuthenticated, (req, res) => {
        res.status(405).json({ success: false, message: 'HTTP method not supported on /movies.' });
    });

// GET /movies/:movieparameter - returns specific movie, with reviews+avgRating if ?reviews=true
router.route('/movies/:movieparameter')
    .get(authJwtController.isAuthenticated, async (req, res) => {
        try {
            if (req.query.reviews === 'true') {
                const movie = await Movie.aggregate([
                    { $match: { title: req.params.movieparameter } },
                    {
                        $lookup: {
                            from: 'reviews',
                            localField: '_id',
                            foreignField: 'movieId',
                            as: 'reviews'
                        }
                    },
                    {
                        $addFields: {
                            avgRating: { $avg: '$reviews.rating' }
                        }
                    }
                ]);
                if (!movie || movie.length === 0) {
                    return res.status(404).json({ success: false, message: 'Movie not found.' });
                }
                res.status(200).json(movie[0]);
            } else {
                const movie = await Movie.findOne({ title: req.params.movieparameter });
                if (!movie) {
                    return res.status(404).json({ success: false, message: 'Movie not found.' });
                }
                res.status(200).json(movie);
            }
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    })
    .post(authJwtController.isAuthenticated, (req, res) => {
        res.status(405).json({ success: false, message: 'HTTP method not supported.' });
    })
    .put(authJwtController.isAuthenticated, async (req, res) => {
        try {
            const movie = await Movie.findOneAndUpdate(
                { title: req.params.movieparameter },
                req.body,
                { new: true, runValidators: true }
            );
            if (!movie) {
                return res.status(404).json({ success: false, message: 'Movie not found.' });
            }
            res.status(200).json({ success: true, movie });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    })
    .delete(authJwtController.isAuthenticated, async (req, res) => {
        try {
            const movie = await Movie.findOneAndDelete({ title: req.params.movieparameter });
            if (!movie) {
                return res.status(404).json({ success: false, message: 'Movie not found.' });
            }
            res.status(200).json({ success: true, message: 'Movie deleted successfully.' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    });

// GET /reviews - returns all reviews
// POST /reviews - creates a review, username pulled from JWT token
router.route('/reviews')
    .get(authJwtController.isAuthenticated, async (req, res) => {
        try {
            const reviews = await Review.find();
            res.status(200).json(reviews);
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    })
    .post(authJwtController.isAuthenticated, async (req, res) => {
        const { movieId, review, rating } = req.body;
        const username = req.user.username; // pulled from JWT token

        if (!movieId || !review || rating === undefined) {
            return res.status(400).json({ success: false, message: 'Review must include movieId, review, and rating.' });
        }
        try {
            const movie = await Movie.findById(movieId);
            if (!movie) {
                return res.status(404).json({ success: false, message: 'Movie not found.' });
            }
            const newReview = new Review({ movieId, username, review, rating });
            await newReview.save();
            res.status(201).json({ message: 'Review created!' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    });

// POST /search - search movies by partial title or actor name (extra credit)
router.route('/search')
    .post(authJwtController.isAuthenticated, async (req, res) => {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ success: false, message: 'Search query is required.' });
        }
        try {
            const movies = await Movie.aggregate([
                {
                    $match: {
                        $or: [
                            { title: { $regex: query, $options: 'i' } },
                            { 'actors.actorName': { $regex: query, $options: 'i' } }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'reviews',
                        localField: '_id',
                        foreignField: 'movieId',
                        as: 'movieReviews'
                    }
                },
                {
                    $addFields: {
                        avgRating: { $avg: '$movieReviews.rating' }
                    }
                },
                { $sort: { avgRating: -1 } }
            ]);
            res.status(200).json(movies);
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    });

app.use('/', router);

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found.' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
