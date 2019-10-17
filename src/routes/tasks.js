const Task = require('../models/task');
const router = require('express').Router();

const { ensureAuthentication } = require('../helpers/auth');

router.use((req, res, next) => {
  ensureAuthentication(req, res, next);
});

// ADD: RENDERING VIEW TASK FORM
router.get('/add', (req, res) => {
    res.render('tasks/add');
});

// SAVE A TASK
router.post('/add', async (req, res) => {
  let { title, details} = req.body;
  let errors = [];

  if (!title) {
    errors.push({text: 'Please add a title'});
  }
  if (!details) {
    errors.push({text: 'Please add a Detail'});
  }

  // Rendering Error
  if (errors.length > 0) {
    res.render('tasks/add', {
      errors,
      title,
      details
    });
  }
  else { // Saving Task
    const newTask = {
      title: req.body.title,
      details: req.body.details,
      user: req.user.id
    }
    let task = new Task(newTask);
    await task.save();
    req.flash('success_msg', 'Task added.');
    res.redirect('/tasks');
  }
});

// RENDEDERING TASKS
router.get('/', async (req, res) => {
  let tasks = await Task.find({user: req.user.id})
              .sort({date: 'desc'});
  res.render('tasks/index', {
    tasks
  });
});

// RENDERING TASK EDIT
router.get('/edit/:id', async (req, res) => {
  let task = await Task.findById(req.params.id);
  if (task.user != req.user.id) {
    req.flash('error_msg', 'Not Authorized');
    res.redirect('/tasks');
  } else {
    res.render('tasks/edit', {
      task
    });
  }
});

// EDITING
router.put('/edit/:id', async (req, res) => {
  let task = await Task.findById(req.params.id);
  task.title = req.body.title;
  task.details = req.body.details;
  await task.save();
  req.flash('success_msg', 'Task updated.');
  res.redirect('/tasks');
});

// DELETE TASK
router.delete('/delete/:id', async (req, res) => {
  await Task.removeById(req.params.id);
  req.flash('success_msg', 'Task removed.');
  res.redirect('/tasks');
});

module.exports = router;
