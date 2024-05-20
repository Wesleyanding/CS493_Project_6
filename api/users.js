const { Router } = require('express')
const jwt = require('jsonwebtoken')
const { requireAuth, generateAuthToken } = require('../lib/auth')
const { User, UserClientFields } = require('../models/user')
const { ValidationError } = require('sequelize')

const { Business } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')

const router = Router()

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
  const authenticated = await bcrypt.compare(req.body.password, user.password)
  if (authenticated) {
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
  const ownerOfBusiness = req.user === userId
  if (ownerOfBusiness || req.user.isAdmin) {
    const userBusinesses = await Business.findAll({ where: { ownerId: userId }})
    res.status(200).json({
    businesses: userBusinesses
  })
} else {
  res.status(403).json({ error: 'Forbidden' })
}
});

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userId/reviews', requireAuth, async function (req, res) {
  const userId = req.params.userId
  const ownerOfReview = req.user === userId
  if (ownerOfReview || req.user.isAdmin) {
    const userReviews = await Review.findAll({ where: { userId: userId }})
    res.status(200).json({
    reviews: userReviews})
  } else {
    res.status(403).json({ error: 'Forbidden' })
  }
})

/*
 * Route to list all of a user's photos.
 */
router.get('/:userId/photos', requireAuth, async function (req, res) {
  const userId = req.params.userId
  const ownerOfPhoto = req.user === userId
  if (ownerOfPhoto || req.user.isAdmin) {
    const userPhotos = await Photo.findAll({ where: { userId: userId }})
    res.status(200).json({
      photos: userPhotos
  })
} else {
  res.status(403).json({ error: 'Forbidden' })
}
});

module.exports = router
