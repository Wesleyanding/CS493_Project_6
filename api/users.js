const { Router } = require('express')
const jwt = require('jsonwebtoken')

const { Business } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')

const router = Router()

/*
 * Function to require authentication
 */
function requireAuth(req, res, next) {
  // Get the token from the header
  const auth_header = req.get('Authorization') || '';
  const auth_token = auth_header.split(' ')[1];

  try {
    jwt.verify(auth_token, process.env.JWT_SECRET);
    req.user = payload.sub;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' })
  }
}


/*
 * Function to generate Auth token
 */
function generateAuthToken(user) {
  const payload = { "sub": user };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
}

/*
 * Route to create a new user.
 */
router.post('/users', async function (req, res, next) {
  try {
    const user = await User.create(req.body, UserClientFields)
    res.status(201).json(user)
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ error: 'Validation error' })
    } else {
      next(err)
    }
  }
})

/*
 * Route to login a user.
 */

router.post('/users/login', async function (req, res, next) {
  const user = await User.findOne({ where: { email: req.body.email }})
  if (user && user.password === hash(req.body.password)) {
    const token = generateAuthToken(user.userId)
    res.status(200).json({ "token": token })
  } else {
    res.status(401).json({ error: 'Invalid login' })
  }
})

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userId/businesses', requireAuth, async function (req, res) {
  const userId = req.params.userId
  const userBusinesses = await Business.findAll({ where: { ownerId: userId }})
  res.status(200).json({
    businesses: userBusinesses
  })
})

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userId/reviews', requireAuth, async function (req, res) {
  const userId = req.params.userId
  const userReviews = await Review.findAll({ where: { userId: userId }})
  res.status(200).json({
    reviews: userReviews
  })
})

/*
 * Route to list all of a user's photos.
 */
router.get('/:userId/photos', requireAuth, async function (req, res) {
  const userId = req.params.userId
  const userPhotos = await Photo.findAll({ where: { userId: userId }})
  res.status(200).json({
    photos: userPhotos
  })
})

module.exports = router
