const { Router } = require('express')
const { ValidationError } = require('sequelize')
const { requireAuth } = require('../lib/auth')

const { Review, ReviewClientFields } = require('../models/review')

const router = Router()

/*
 * Route to create a new review.
 */
router.post('/', requireAuth, async function (req, res, next) {
  const ownerId = parseInt(req.body.userId)
  if (req.user !== ownerId || !req.user.isAdmin) {
    res.status(403).send({ error: 'Forbidden' })
    return
  }
  try {
    const review = await Review.create(req.body, ReviewClientFields)
    res.status(201).send({ id: review.id })
  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).send({ error: e.message })
    } else {
      throw e
    }
  }
})

/*
 * Route to fetch info about a specific review.
 */
router.get('/:reviewId', async function (req, res, next) {
  const reviewId = req.params.reviewId
  const review = await Review.findByPk(reviewId)
  if (review) {
    res.status(200).send(review)
  } else {
    next()
  }
})

/*
 * Route to update a review.
 */
router.patch('/:reviewId', requireAuth, async function (req, res, next) {
  const ownerId = parseInt(req.body.userId)
  if (req.user !== ownerId || !req.user.isAdmin) {
    res.status(403).send({ error: 'Forbidden' })
    return
  }
  const reviewId = req.params.reviewId

  /*
   * Update review without allowing client to update businessId or userId.
   */
  const result = await Review.update(req.body, {
    where: { id: reviewId },
    fields: ReviewClientFields.filter(
      field => field !== 'businessId' && field !== 'userId'
    )
  })
  if (result[0] > 0) {
    res.status(204).send()
  } else {
    next()
  }
})

/*
 * Route to delete a review.
 */
router.delete('/:reviewId', requireAuth, async function (req, res, next) {
  const ownerId = parseInt(req.body.userId)
  if (req.user !== ownerId || !req.user.isAdmin) {
    res.status(403).send({ error: 'Forbidden' })
    return
  }
  const reviewId = req.params.reviewId
  const result = await Review.destroy({ where: { id: reviewId }})
  if (result > 0) {
    res.status(204).send()
  } else {
    next()
  }
})

module.exports = router
