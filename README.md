# CSCI3916 Assignment Three & Four - Movie API

## Deployment Links
- **API (Render):** https://csci3916-assignmentthree.onrender.com
- **React Site (Netlify):** https://csci3916-hw3-react.netlify.app

## GitHub Repositories
- **API:** https://github.com/Marc-Cer323/CSCI3916_AssignmentThree
- **React:** https://github.com/Marc-Cer323/CSC3916_REACT19

---

## API Routes

| Route | GET | POST | PUT | DELETE |
|---|---|---|---|---|
| `/movies` | Return all movies | Save a single movie | 405 - Not Allowed | 405 - Not Allowed |
| `/movies/:movieparameter` | Return specific movie (add `?reviews=true` to include reviews) | 405 - Not Allowed | Update specific movie by title | Delete specific movie by title |
| `/reviews` | Return all reviews | Save a new review (JWT required) | - | - |

### Authentication Routes
| Route | Method | Description |
|---|---|---|
| `/signup` | POST | Register a new user |
| `/signin` | POST | Login and receive JWT token |

---

## Postman Collection

The Postman collection and environment files are located in the `/postman` folder of this repository.

To import and run:
1. Open Postman
2. Click **Import** → select the collection JSON file from `/postman`
3. Also import the environment JSON file from `/postman`
4. Set the environment to **No Environment** (collection variables are used)
5. Run the **Auth** folder first (Signup → Signin) to auto-generate JWT token
6. Run **Movies** and **Reviews** folders to test all routes

### Tests Included
**HW3 - Auth & Movies:**
- ✅ Signup a new user (random username/password in pre-request script)
- ✅ Signin and store JWT token as collection variable automatically
- ✅ GET all movies
- ✅ GET specific movie by title
- ✅ POST save a new movie
- ✅ PUT update a movie
- ✅ DELETE a movie
- ✅ Error: Duplicate user signup
- ✅ Error: Movie missing required actors
- ✅ Error: PUT on /movies (405 not allowed)
- ✅ Error: Movie not found (404)

**HW4 - Reviews:**
- ✅ GET movie with reviews (?reviews=true)
- ✅ POST save a review for a movie
- ✅ Error: Invalid movie request (not in DB)
- ✅ Error: Invalid save review (movie not in DB)

---

## Schemas

### Movie Schema
```javascript
{
  title: { type: String, required: true, index: true },
  releaseDate: { type: Number, min: 1900, max: 2100 },
  genre: { type: String, enum: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Thriller', 'Western', 'Science Fiction'] },
  actors: [{ actorName: String, characterName: String }]
}
```

### User Schema
```javascript
{
  name: String,
  username: { type: String, unique: true },
  password: String  // hashed with bcrypt
}
```

### Review Schema
```javascript
{
  movieId: { type: ObjectId, ref: 'Movie', required: true },
  username: { type: String, required: true },
  review: { type: String, required: true },
  rating: { type: Number, min: 0, max: 5, required: true }
}
```

---

## Environment Variables
| Key | Description |
|---|---|
| `DB` | MongoDB Atlas connection string |
| `SECRET_KEY` | JWT secret key |
| `PORT` | Server port (default 8080) |

## Resources
- https://www.mongodb.com/cloud/atlas
- https://render.com/docs/deploy-create-react-app
