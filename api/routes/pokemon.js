const express = require('express');
const { rawListeners } = require('../models/userData');
const router = express.Router();
const userData = require('../models/userData');

// findUserData
const FindUserData = async (userid) => {
  // console.log(userid);
  return await userData.find({ userid: userid });
};

router.get('/', async (req, res) => {
  res.send({ msg: 'API Up and Running.' }).status(200);
});

// SIGN UP
router.post('/signup', async (req, res) => {
  // console.log(req.body);
  let info = {
    userid: req.body.userid,
  };
  try {
    let result = await userData.find({ userid: req.body.userid });
    if (result.length === 0) {
      let result = await userData.create(info);
      res.send({
        exists: false,
        success: result,
      });
    } else {
      res.send({
        exists: true,
      });
    }
  } catch (error) {
    console.error(error);
  }
});

// EXISTENCE CHECK
router.post('/signin', async (req, res) => {
  // console.log(req.body);
  try {
    let result = await userData.find({ userid: req.body.userid });
    // console.log(typeof result);
    if (result.length === 0) {
      res.send({
        exists: false,
      });
    } else {
      res.send({
        exists: true,
        info: result,
      });
    }
  } catch (error) {
    console.error(error);
  }
});

//Catch Pokemon by using pokeball
router.post('/capture', async (req, res) => {
  if (req.body.captured === false) {
    try {
      let _id = req.body._id;
      let updates = {
        $set: { 'pokeball.pokeballCount': req.body.pokeballCount - 1 },
      };
      let options = { new: true };
      let result = await userData.findByIdAndUpdate(_id, updates, options);
      res
        .send({
          deducted: true,
          success: result,
        })
        .status(200);
    } catch (error) {
      console.error(error);
    }
    return;
  }
  let _id = req.body._id;
  // let pokeballCount = req.body.pokeballCount;
  // let pokeid = req.body.id;
  // let pokemonName = req.body.pokemonName;

  try {
    let options = { new: true };
    let updates = {
      $set: { 'pokeball.pokeballCount': req.body.pokeballCount - 1 },
      $push: {
        pokemonCollection: {
          pokeid: req.body.pokeid,
          name: req.body.pokemonName,
          is_legendary: req.body.is_legendary,
        },
      },
    };
    let result = await userData.findByIdAndUpdate(_id, updates, options);
    // console.log(result);
    res
      .send({
        created: true,
        success: result,
      })
      .status(201);
  } catch (error) {
    console.error(error);
  }
});

router.post('/getEnergy', async (req, res) => {
  try {
    let result = await userData.find({ userid: req.body.userid });
    // console.log(result[0]._id);
    let _id = result[0]._id;
    let currentCredit = result[0].credits;
    // console.log(currentCredit);
    let updates = {
      credits: currentCredit + 200,
    };
    let options = { new: true };
    let changeEnergy = await userData.findByIdAndUpdate(_id, updates, options);
    res.send({
      recharged: true,
      info: changeEnergy,
    });
  } catch (error) {
    console.error(error);
  }
});

router.post('/pokeball', async (req, res) => {
  // console.log(req.body);
  const { userid, value } = req.body;

  let result = await FindUserData(userid);

  let _id = result[0]._id;
  let currentpokeball = result[0].pokeball.pokeballCount;
  let updates = {
    $set: { 'pokeball.pokeballCount': currentpokeball + value },
  };
  let options = { new: true };

  let chgPokeBall = await userData.findByIdAndUpdate(_id, updates, options);
  // console.log(typeof chgPokeBall);
  if (Object.keys(chgPokeBall).length > 0) {
    res.send({
      addedItem: true,
      info: chgPokeBall,
    });
  } else {
    res.send({
      addedItem: false,
    });
  }
});

router.post('/berry', async (req, res) => {
  const { userid, berryName } = req.body;
  let result = await FindUserData(userid);

  let _id = result[0]._id;
  let currentBerryCount = result[0].berry.berryCount;
  let updates = {
    $set: { 'berry.berryCount': currentBerryCount + 1 },
  };
  let options = { new: true };

  let chgberryCount = await userData.findByIdAndUpdate(_id, updates, options);

  if (Object.keys(chgberryCount).length > 0) {
    res.send({
      addedBerry: true,
      info: chgberryCount,
    });
  } else {
    res.send({
      addedBerry: false,
    });
  }
});

module.exports = router;
