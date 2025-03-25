import Router from 'express';
import userController from '../controllers/user-controller.mjs';
import { body } from 'express-validator';
import authMiddleware from '../middlewares/auth-middleware.mjs';
import rulesController from '../controllers/rules-controller.mjs';

const router = new Router();

/**
 * @swagger
 * /api/registration:
 *   post:
 *     summary: Registers a new user
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of the user to register
 *     responses:
 *       200:
 *         description: Registration successful
 *       400:
 *         description: Invalid email or missing fields
 *       500:
 *         description: Internal server error
 */
router.post('/registration',
    body('email').isEmail(),
    userController.registerUser
);

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Logs in a user
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of the user to login
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post('/login', 
    body('email').isEmail(),
    userController.loginUser
);

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Logs out a user
 *     tags: [User Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Internal server error
 */
router.post('/logout', userController.logoutUser);

/**
 * @swagger
 * /api/activate/{link}:
 *   get:
 *     summary: Activates a user's account
 *     tags: [User Authentication]
 *     parameters:
 *       - in: path
 *         name: link
 *         required: true
 *         schema:
 *           type: string
 *         description: Activation link token
 *     responses:
 *       200:
 *         description: Account activated
 *       404:
 *         description: Link not found
 *       500:
 *         description: Internal server error
 */
router.get('/activate/:link', userController.activateUser);

/**
 * @swagger
 * /api/refresh:
 *   get:
 *     summary: Refreshes an important resource
 *     tags: [Refresh]
 *     responses:
 *       200:
 *         description: Successfully refreshed
 *       500:
 *         description: Failed to refresh
 */
router.get('/refresh', userController.refreshUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Retrieves all users
 *     tags: [User Management]
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized, token required
 *       500:
 *         description: Internal server error
 */
router.get('/users', authMiddleware, userController.getUsers);

// Rules router
/**
 * @swagger
 * /api/rules/:
 *   get:
 *     summary: Retrieves all rules
 *     tags: [Rules]
 *     responses:
 *       200:
 *         description: A list of all rules
 *       500:
 *         description: Internal server error
 */
router.get('/rules/', rulesController.getAllRules);

/**
 * @swagger
 * /api/rules/{cat}:
 *   get:
 *     summary: Retrieves all rules for a specific category
 *     tags: [Rules]
 *     parameters:
 *       - in: path
 *         name: cat
 *         required: true
 *         schema:
 *           type: string
 *         description: Category to filter rules
 *     responses:
 *       200:
 *         description: A list of rules filtered by category
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.get('/rules/:cat', rulesController.getAllRulesForCat);

/**
 * @swagger
 * /api/rules/create:
 *   post:
 *     summary: Creates a new rule
 *     tags: [Rules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the rule
 *               description:
 *                 type: string
 *                 description: Description of the rule
 *               category:
 *                 type: string
 *                 description: Category of the rule
 *     responses:
 *       201:
 *         description: Rule created successfully
 *       400:
 *         description: Invalid input, object invalid
 *       500:
 *         description: Internal server error
 */
router.post('/rules/create', rulesController.createRule);

/**
 * @swagger
 * /api/rules/status/{id}:
 *   put:
 *     summary: Changes the status of a rule
 *     tags: [Rules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rule ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: boolean
 *                 description: New status of the rule
 *     responses:
 *       200:
 *         description: Rule status updated successfully
 *       404:
 *         description: Rule not found
 *       500:
 *         description: Internal server error
 */
router.put('/rules/status/:id', rulesController.changeStatus);

/**
 * @swagger
 * /api/rules/connection/{id}:
 *   put:
 *     summary: Changes the connection status of a rule
 *     tags: [Rules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rule ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               connectionStatus:
 *                 type: boolean
 *                 description: New connection status of the rule
 *     responses:
 *       200:
 *         description: Rule connection status updated successfully
 *       404:
 *         description: Rule not found
 *       500:
 *         description: Internal server error
 */
router.put('/rules/connection/:id', rulesController.changeConnectionStatus);


/**
 * @swagger
 * /api/rules/signals/{name}/{timeframe}:
 *   get:
 *     summary: Gets signals for a specific rule within a specified timeframe
 *     tags: [Signals]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the rule
 *       - in: path
 *         name: timeframe
 *         required: true
 *         schema:
 *           type: string
 *         description: Timeframe of the signals
 *     responses:
 *       200:
 *         description: A list of signals
 *       404:
 *         description: Rule not found
 *       500:
 *         description: Internal server error
 */
router.get('/rules/signals/:name/:timeframe', rulesController.getSignalsForRule);

/**
 * @swagger
 * /api/timeframes/signals/{timeframe}/{pair}:
 *   get:
 *     summary: Gets signals for a specific trading pair within a specified timeframe
 *     tags: [Signals]
 *     parameters:
 *       - in: path
 *         name: timeframe
 *         required: true
 *         schema:
 *           type: string
 *         description: Timeframe of the signals
 *       - in: path
 *         name: pair
 *         required: true
 *         schema:
 *           type: string
 *         description: Trading pair of the signals
 *     responses:
 *       200:
 *         description: Latest signal for the specified trading pair and timeframe
 *       404:
 *         description: Signal not found
 *       500:
 *         description: Internal server error
 */
router.get('/timeframes/signals/:timeframe/:pair', rulesController.getSignalsForTimframes)

/**
 * @swagger
 * /api/trends/{timeframe}:
 *   get:
 *     summary: Retrieves trends for a specified timeframe
 *     tags: [Trends]
 *     parameters:
 *       - in: path
 *         name: timeframe
 *         required: true
 *         schema:
 *           type: string
 *         description: Timeframe for the trends
 *     responses:
 *       200:
 *         description: A list of trends for the specified timeframe
 *       404:
 *         description: Trends not found
 *       500:
 *         description: Internal server error
 */
router.get('/trends/:timeframe', rulesController.getTrendsByTimeframe);

/**
 * @swagger
 * /api/trends/signals:
 *   post:
 *     summary: Retrieves signals based on trends
 *     tags: [Trends]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: List of signal IDs to retrieve
 *     responses:
 *       200:
 *         description: Signals associated with the specified trend IDs
 *       404:
 *         description: Signals not found
 *       500:
 *         description: Internal server error
 */
router.post('/trends/signals', rulesController.getSignalsForTrends);

/**
 * @swagger
 * /api/connections/{timeframe}/{type}:
 *   get:
 *     summary: Retrieves connections based on timeframe and type
 *     tags: [Connections]
 *     parameters:
 *       - in: path
 *         name: timeframe
 *         required: true
 *         schema:
 *           type: string
 *         description: Timeframe for the connections
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: Type of connections to retrieve
 *     responses:
 *       200:
 *         description: A list of connections for the specified timeframe and type
 *       404:
 *         description: Connections not found
 *       500:
 *         description: Internal server error
 */
router.get('/connections/:timeframe/:type', rulesController.getConnections);

/**
 * @swagger
 * /api/connections/{istop}/{timeframe}/{pair}:
 *   get:
 *     summary: Retrieves top connections for a specified timeframe and trading pair
 *     tags: [Connections]
 *     parameters:
 *       - in: path
 *         name: istop
 *         required: true
 *         schema:
 *           type: boolean
 *         description: Filter for top connections
 *       - in: path
 *         name: timeframe
 *         required: true
 *         schema:
 *           type: string
 *         description: Timeframe for the connections
 *       - in: path
 *         name: pair
 *         required: true
 *         schema:
 *           type: string
 *         description: Trading pair for the connections
 *     responses:
 *       200:
 *         description: Top connections for the specified timeframe and trading pair
 *       404:
 *         description: Connections not found
 *       500:
 *         description: Internal server error
 */
router.get('/connections/:istop/:timeframe/:pair', rulesController.getTopConnections);

/**
 * @swagger
 * /api/tradingpairs/:
 *   get:
 *     summary: Retrieves all trading pairs
 *     tags: [Trading Pairs]
 *     responses:
 *       200:
 *         description: A list of all trading pairs
 *       500:
 *         description: Internal server error
 */
router.get('/tradingpairs/', rulesController.getTradingPairs);

/**
 * @swagger
 * /api/tradingpairs/top/:
 *   get:
 *     summary: Retrieves top trading pairs
 *     tags: [Trading Pairs]
 *     responses:
 *       200:
 *         description: A list of top trading pairs
 *       500:
 *         description: Internal server error
 */
router.get('/tradingpairs/top/', rulesController.getTopTradingPairs);

/**
 * @swagger
 * /api/tradingpairs/trends/{param}/{timeframe}:
 *   get:
 *     summary: Retrieves trading pairs for specific trends
 *     tags: [Trading Pairs]
 *     parameters:
 *       - in: path
 *         name: param
 *         required: true
 *         schema:
 *           type: string
 *         description: Parameter to filter trading pairs
 *       - in: path
 *         name: timeframe
 *         required: true
 *         schema:
 *           type: string
 *         description: Timeframe of the trends
 *     responses:
 *       200:
 *         description: Trading pairs for the specified parameters and timeframe
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.get('/tradingpairs/trends/:param/:timeframe', rulesController.getPairsForTrends);

/**
 * @swagger
 * /api/settings/leverages/:
 *   get:
 *     summary: Retrieves all leverage options
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: A list of all leverage options
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.get('/settings/levarages/', rulesController.getLevarages);

/**
 * @swagger
 * /api/settings/options/:
 *   get:
 *     summary: Retrieves all options settings
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Current settings options
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.get('/settings/options/', rulesController.getOptions);

/**
 * @swagger
 * /api/settings/options/update/:
 *   put:
 *     summary: Updates options settings
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *                 description: API key
 *               secretKey:
 *                 type: string
 *                 description: Secret API key
 *               leverage:
 *                 type: integer
 *                 description: Selected leverage
 *     responses:
 *       200:
 *         description: Options updated successfully
 *       404:
 *         description: Option not found
 *       500:
 *         description: Internal server error
 */
router.put('/settings/options/update/', rulesController.updateOption);

/**
 * @swagger
 * /api/dumps/dates:
 *   get:
 *     summary: Retrieves previous dates for dumps
 *     tags: [Dumps/Pumps]
 *     responses:
 *       200:
 *         description: A list of previous dates
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.get('/dumps/dates', rulesController.dumpsGetPreviousDates);

/**
 * @swagger
 * /api/dumps/dates/{id}:
 *   get:
 *     summary: Retrieves dump data for a specific date
 *     tags: [Dumps/Pumps]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the date to retrieve dump data
 *     responses:
 *       200:
 *         description: Dump data for the specified date
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.get('/dumps/dates/:id', rulesController.getDumpDataForDate);

/**
 * @swagger
 * /api/dumps/dates/time/{date}:
 *   get:
 *     summary: Retrieves four-hour intervals for a specific date
 *     tags: [Dumps/Pumps]
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *         description: Date to retrieve four-hour intervals
 *     responses:
 *       200:
 *         description: Four-hour intervals for the specified date
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.get('/dumps/dates/time/:date', rulesController.getFourHoursForDate);

/**
 * @swagger
 * /api/dumps/time/{id}:
 *   get:
 *     summary: Retrieves dump data for specific four-hour intervals
 *     tags: [Dumps/Pumps]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the interval to retrieve dump data
 *     responses:
 *       200:
 *         description: Dump data for the specified interval
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.get('/dumps/time/:id', rulesController.getDumpForHours);

router.get('/dumps/topsignals/:timeframe/:pair', rulesController.getTopSignal);

router.get('/settings/options/timeframe', rulesController.getAdditionalOptions);
router.put('/settings/options/timeframe', rulesController.updateAdditionalOptions);

export default router;
