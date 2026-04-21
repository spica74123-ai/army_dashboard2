const express = require('express');
const Unit = require('../models/Unit');

const router = express.Router();

router.get('/', async (req, res) => {
  const units = await Unit.find();
  res.json(units);
});

router.post('/', async (req, res) => {
  const unit = new Unit(req.body);
  await unit.save();
  res.json(unit);
});

router.put('/:id', async (req, res) => {
  const unit = await Unit.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(unit);
});

router.delete('/:id', async (req, res) => {
  await Unit.findByIdAndDelete(req.params.id);
  res.json({ message: 'Unit deleted' });
});

module.exports = router;