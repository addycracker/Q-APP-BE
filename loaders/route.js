const { Router } = require('express');
const router = Router();

router.use('/api/v1', require('../src/app/modules/user/user.routes'));
router.use(
  '/api/v1',
  require('../src/app/modules/questionnaire-service/questionnaire.routes')
);

module.exports = router;
