const express = require("express")
const { StatusCodes } = require("http-status-codes")
const router = express.Router()
const auth = require("../../middleware/auth")
const Profile = require("../../models/Profile")
const { check, validationResult } = require("express-validator/check")

// @route     GET api/profile/me
// @desc      Get current users profile
// @access    Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    ) // user is ObjectId from ProfileSchema -- populate user model

    if (!profile) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "There is no profile for this user" })
    }
    res.json(profile)
  } catch (error) {
    console.error(error.message)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Server error")
  }
})

// @route     POST api/profile
// @desc      Create or update user profile
// @access    Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() })
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      gihubusername,
      skills,
      youtube,
      facebook,
      twiiter,
      instagram,
      linkedin,
    } = req.body

    // Build profile object
    const profileFields = {}
    profileFields.user = req.user.id
    if (company) profileFields.company = company
    if (website) profileFields.website = website
    if (location) profileFields.location = location
    if (bio) profileFields.bio = bio
    if (status) profileFields.status = status
    if (gihubusername) profileFields.gihubusername = gihubusername
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim())  // user given type: html,css,js
    }

    // Build social object
    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube
    if (twiiter) profileFields.social.twiiter = twiiter
    if (facebook) profileFields.social.facebook = facebook
    if (linkedin) profileFields.social.linkedin = linkedin
    if (instagram) profileFields.social.instagram = instagram

    try {
      let profile = await Profile.findOne({ user: req.user.id })

      if (profile) {
        // Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        )
        return res.json(profile)
      }

      //Create
      profile = new Profile(profileFields)
      await profile.save()
      res.json(profile)
    } catch (error) {
      console.error(error.message)
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Server error")
    }
  }
)

// @route     GET api/profile
// @desc      Get all profiles
// @access    Public

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar'])
    res.json(profiles)
  } catch (error) {
    console.error(error.message)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server error');
  }
});

// @route     GET api/profile/user/:user_id
// @desc      Get profile by user ID
// @access    Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar'])
    if (!profile) {
      res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Profile not found' });
    }
    res.json(profile)
  } catch (error) {
    console.error(error.message)
    if (error.kind == 'ObjectId') {
      res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Profile not found' });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server error');
  }
});


module.exports = router
