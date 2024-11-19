import pool from "../db.mjs";

class RulesController {
    async createRule(req, res) {
        try{
            const { rulename, description } = req.body;
            const newRule = await pool.query(`INSERT INTO rules (ruleid, rulename, description, type) VALUES ($1, $2, $3, $4) RETURNING *`, [1, rulename, description, 'Short']);
            res.json(newRule.rows[0]);
        } catch(e){
            console.error('Error creating a rule:', e);
            res.status(500).json({ message: 'An error occurred' });
        }
    }

    async getAllRules(req, res) {
        try{
            const users = await pool.query(`SELECT * FROM rules`);
            res.json(users.rows);
        } catch(e){
            console.error('Error getting rules:', e);
            res.status(500).json({ message: 'An error occurred' });
        }
    }

    async getAllRulesForCat(req, res) {
        try{
            const cat = req.params.cat;
            const results = await pool.query(`SELECT * FROM rules WHERE type = '${cat}'`);
            res.json(results.rows)
        } catch(e){
            console.error('Error getting rules:', e);
            res.status(500).json({ message: 'An error occurred' });
        }
    }

    async changeStatus(req, res) {
        try {
            const id = req.params.id; 
            const query = `
                UPDATE rules
                SET status = CASE WHEN status = true THEN false ELSE true END
                WHERE ruleid = $1
                RETURNING *
            `;
    
            const result = await pool.query(query, [id]);
    
            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ message: 'Rule not found' });
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            res.status(500).json({ message: 'An error occurred' });
        }
    }

    async changeConnectionStatus(req, res) {
        try {
            const id = req.params.id; 
            const query = `
                UPDATE rules
                SET connect_status = CASE WHEN connect_status = true THEN false ELSE true END
                WHERE ruleid = $1
                RETURNING *
            `;
    
            const result = await pool.query(query, [id]);
    
            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ message: 'Rule not found' });
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            res.status(500).json({ message: 'An error occurred' });
        }
    }


    // Controllers to get signals by the rule
    async getSignalsForRule(req, res){
        try{
            const ruleName = req.params.name;
            const timeframe = req.params.timeframe;

            const query = `
            SELECT signalid, tradingpair, timeframe, rule, data, ratio, to_char(timestamp, 'YYYY-MM-DD HH24:MI:SSOF') AS timestamp
            FROM public.signals
            WHERE rule = $1
            ${timeframe === 'all' ? "AND timeframe <> '5m'" : `AND timeframe = '${timeframe}'`}
            ORDER BY timestamp DESC
            LIMIT 50
            `
            const result = await pool.query(query, [ruleName]);
            
            if (result.rows.length > 0) {
                res.json(result.rows);
            } else {
                res.status(404).json({ message: 'Rule not found' });
            }
        } catch (error) {
            console.error('Error getting signals:', error);
            res.status(500).json({ message: 'An error occurred retrieving the data' });
        }
    }

    // Controller to get signals for timeframe and pair
    async getSignalsForTimframes(req, res){
        try{
            const pairName = req.params.pair;
            const timeframe = req.params.timeframe;

            const query = `
            SELECT signalid, tradingpair, timeframe, rule, data, ratio, to_char(timestamp, 'YYYY-MM-DD HH24:MI:SSOF') AS timestamp
            FROM public.signals
            WHERE tradingpair = $1
            AND timeframe = $2
            ORDER BY timestamp DESC
            LIMIT 1
            `
            const result = await pool.query(query, [pairName, timeframe]);
            
            if (result.rows.length > 0) {
                res.json(result.rows);
            } else {
                res.status(404).json({ message: 'Rule not found' });
            }
        } catch (error) {
            console.error('Error getting signals:', error);
            res.status(500).json({ message: 'An error occurred retrieving the data' });
        }
    }
    

    async getTrendsByTimeframe(req, res){
        try{
            const timeframe = req.params.timeframe;
            const query = `
            SELECT trendid, longs, shorts, to_char(timestamp, 'YYYY-MM-DD HH24:MI:SSOF') AS timestamp,
                timeframe, candle_num, candle_color, rlong, along, blong, bfly, rshort, ashort, bshort, 
                gfly, total_long, total_short, data
            FROM public.trends
            WHERE timeframe = $1
            ORDER BY timestamp DESC
            LIMIT 50
            `
            const result = await pool.query(query, [timeframe]);

            if (result.rows.length > 0) {
                res.json(result.rows);
            } else {
                res.status(404).json({ message: 'Not found' });
            }
        } catch (error) {
            console.error('Error getting trends:', error);
            res.status(500).json({ message: 'An error occurred retrieving the data' });
        }
    }

    async getSignalsForTrends(req, res) {
        try {
            const {ids} = req.body;
            const query = `SELECT * FROM signals	
            WHERE signalid in (${ids.join(',')})
            ORDER BY timestamp DESC`;

            const result = await pool.query(query);
            if (result.rows.length > 0) {
                res.json(result.rows);
            } else {
                res.status(404).json({ message: 'Not found' });
            }
        } catch (error) {
            console.error('Error getting connections:', error);
            res.status(500).json({ message: 'An error occurred retrieving the data' });
        }
    }

    async getPairsForTrends(req, res) {
        try {
            const {param, timeframe} = req.params;
            const vnnn = param === 'VN' ? true : false;
            let field = '';
            switch (timeframe) {
                case '15m':
                    field = 'fifteen'
                    break;
                case '1h':
                    field = 'hour'
                    break;
                case '4h':
                    field = 'four'
                    break;
            
                default:
                    field = 'day'
                    break;
            }
            const query = `SELECT * FROM tradingpairs
            WHERE ${field} = $1
            ORDER BY changepercent DESC`;
            const result = await pool.query(query, [vnnn]);
            if (result.rows.length > 0) {
                res.json(result.rows);
            } else {
                res.status(404).json({ message: 'Not found' });
            }
        } catch (error) {
            console.error('Error getting connections:', error);
            res.status(500).json({ message: 'An error occurred retrieving the data' });
        }
    }

    async getConnections(req, res){
        try{
            const timeframe = req.params.timeframe;
            const type = req.params.type;
            const query = `
            SELECT connectid, tradingpair, data, 
                to_char(timestamp, 'YYYY-MM-DD HH24:MI:SSOF') AS timestamp
            FROM public.connections
            WHERE timeframe = $1
            AND type = $2
            ORDER BY timestamp DESC
            LIMIT 50
            `
            const result = await pool.query(query, [timeframe, type]);

            if (result.rows.length > 0) {
                res.json(result.rows);
            } else {
                res.status(404).json({ message: 'Not found' });
            }
        } catch (error) {
            console.error('Error getting connections:', error);
            res.status(500).json({ message: 'An error occurred retrieving the data' });
        }
    }

    async getTopConnections(req, res){
        try{
            const timeframe = req.params.timeframe;
            const tf = timeframe === '1' ? '1h' : timeframe === '4' ? '4h' : '15m';
            
            const pair = req.params.pair;

            const query = `
            SELECT connectid, tradingpair, data, 
                to_char(timestamp, 'YYYY-MM-DD HH24:MI:SSOF') AS timestamp
            FROM public.connections
            WHERE timeframe = $1
            AND tradingpair = $2
            ORDER BY timestamp DESC
            LIMIT 1
            `
            //AND timestamp >= NOW() - interval '5 days'
            
            const result = await pool.query(query, [tf, pair]);

            if (result.rows.length > 0) {
                res.json(result.rows);
            } else {
                res.json([]);
                // res.status(404).json({ message: 'Not found top' });
            }
        } catch (error) {
            console.error('Error getting connections:', error);
            res.status(500).json({ message: 'An error occurred retrieving the data' });
        }
    }

    async getTradingPairs(req, res){
        try{
            const query = `
            SELECT * FROM public.tradingpairs
            ORDER BY tradingpairname ASC 
            `
            const result = await pool.query(query);

            if (result.rows.length > 0) {
                res.json(result.rows);
            } else {
                res.status(404).json({ message: 'Not found' });
            }
        } catch (error) {
            console.error('Error getting trading pairs:', error);
            res.status(500).json({ message: 'An error occurred retrieving the data' });
        }
    }

    async getTopTradingPairs(req, res){
        try{
            const query = `
            SELECT * FROM public.tradingpairs
            WHERE future = True
            ORDER BY changepercent DESC
            LIMIT 9
            `
            const result = await pool.query(query);

            const query2 = `
            SELECT * FROM public.tradingpairs
            WHERE tradingpairname = 'BTCUSDT'
            `
            const result2 = await pool.query(query2);

            if (result.rows.length > 0 && result2.rows.length > 0) {
                const combinedResults = result.rows.concat(result2.rows);
                res.json(combinedResults);
            } else {
                res.status(404).json({ message: 'Not found' });
            }
        } catch (error) {
            console.error('Error getting trading pairs:', error);
            res.status(500).json({ message: 'An error occurred retrieving the data' });
        }
    }
    
    async getLevarages(req, res) {
        try {
            const query  = `
            SELECT * FROM public.leverage
            ORDER BY id ASC `;

            const result = await pool.query(query);

            if (result.rows.length > 0) {
                res.json(result.rows);
            } else {
                res.status(404).json({ message: 'Not found' });
            }
        } catch (error) {
            console.error('Error getting levarages:', error);
            res.status(500).json({ message: 'An error occurred retrieving the data' });
        }
    }

    async getOptions(req, res) {
        try {
            const query  = `
            SELECT * FROM public.options `;

            const result = await pool.query(query);

            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ message: 'Not found' });
            }
        } catch (error) {
            console.error('Error getting options:', error);
            res.status(500).json({ message: 'An error occurred retrieving the data' });
        }
    }

    async updateOption(req, res) {
        try {
            const {key, secretKey, levarage} = req.body;
            const query = `
                UPDATE public.options
                SET apikey = $1, secret = $2, selected_lev = $3
                RETURNING *
            `;
    
            const result = await pool.query(query, [key, secretKey, levarage]);
    
            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ message: 'Option is not found' });
            }
        } catch (error) {
            console.error('Error changing option:', error);
            res.status(500).json({ message: 'An error occurred' });
        }
    }

    // Pumps dumps new functionality

    async dumpsGetPreviousDates(req, res) {
        try {
            const query  = `
            SELECT id, timestamp
            FROM public.toppairs
            WHERE timeframe = '1d'
            ORDER BY timestamp DESC
            LIMIT 4`;

            const result = await pool.query(query);

            if (result.rows.length > 0) {
                res.json(result.rows);
            } else {
                res.status(404).json({ message: 'Not found' });
            }
        } catch (error) {
            console.error('Error getting dates:', error);
            res.status(500).json({ message: 'An error occurred retrieving the data' });
        }
    }

    async getDumpDataForDate(req, res) {
        try {
            const id = req.params.id;
            const query  = `
            SELECT data FROM public.toppairs
            WHERE id = $1`;

            const result = await pool.query(query, [id]);

            if (result.rows.length > 0) {
                res.json(result.rows);
            } else {
                res.status(404).json({ message: 'Not found' });
            }
        } catch (error) {
            console.error('Error getting data:', error);
            res.status(500).json({ message: 'An error occurred retrieving the data' });
        }
    }

    async getFourHoursForDate(req, res) {
        try {
            const date = req.params.date;
            const query  = `
            SELECT id, timestamp 
            FROM toppairsfour
            WHERE EXTRACT(day FROM timestamp) = $1
            ORDER BY "timestamp" DESC
            LIMIT 6`;

            const result = await pool.query(query, [date]);

            if (result.rows.length > 0) {
                res.json(result.rows);
            } else {
                res.status(404).json({ message: 'Not found' });
            }
        } catch (error) {
            console.error('Error getting data:', error);
            res.status(500).json({ message: 'An error occurred retrieving the data' });
        }
    }

    async getDumpForHours(req, res) {
        try {
            const id = req.params.id;
            const query  = `
            SELECT data 
            FROM toppairsfour
            WHERE id = $1`;

            const result = await pool.query(query, [id]);

            if (result.rows.length > 0) {
                res.json(result.rows);
            } else {
                res.status(404).json({ message: 'Not found' });
            }
        } catch (error) {
            console.error('Error getting data:', error);
            res.status(500).json({ message: 'An error occurred retrieving the data' });
        }
    }

    // Get Last signal for the top coins page
    async getTopSignal(req, res){
        try{
            const timeframe = req.params.timeframe;
            const tf = timeframe === '1' ? '1h' : timeframe === '4' ? '4h' : '15m';
            
            const pair = req.params.pair;
    
            // First query to get the first set of signals
            const firstQuery = `
            SELECT * FROM public.signals
            WHERE (rule = 'NN' OR rule = 'VN') AND
                  (tradingpair = $1) AND
                  (timeframe = $2)
            ORDER BY timestamp DESC
            LIMIT 1
            `;
    
            const firstResult = await pool.query(firstQuery, [pair, tf]);
            let secondQuery = '';
    
            if (firstResult.rows.length > 0 && firstResult.rows[0].rule === 'NN') {
                secondQuery = `
                SELECT * FROM public.signals
                WHERE data = 'long' AND
                      (tradingpair = $1) AND
                      (timeframe = '5m' OR timeframe = '3m')
                ORDER BY timestamp DESC
                LIMIT 1
                `;
            } else {
                secondQuery = `
                SELECT * FROM public.signals
                WHERE data = 'short' AND
                      (tradingpair = $1) AND
                      (timeframe = '5m' OR timeframe = '3m')
                ORDER BY timestamp DESC
                LIMIT 1
                `;
            }
    
            const secondResult = await pool.query(secondQuery, [pair]);
            const results = [];
    
            // Combine results from both queries
            if (firstResult.rows.length > 0) {
                results.push(firstResult.rows[0]);
            }
            if (secondResult.rows.length > 0) {
                results.push(secondResult.rows[0]);
            }
    
            if (results.length > 0) {
                res.json(results);
            } else {
                res.json([]);
            }
        } catch (error) {
            console.error('Error getting connections:', error);
            res.status(500).json({ message: 'An error occurred retrieving the data' });
        }
    }

    async getAdditionalOptions(req, res) {
        try {
            const query  = `
            SELECT data 
            FROM somewhere`;

            const result = await pool.query(query);

            if (result.rows.length > 0) {
                res.json(result.rows);
            } else {
                res.status(404).json({ message: 'Not found' });
            }
        } catch (error) {
            console.error('Error getting data:', error);
            res.status(500).json({ message: 'An error occurred retrieving the data' });
        }
    }

    async updateAdditionalOptions(req, res) {
        try {
            const options = req.body;
            const query = `
                UPDATE something
                SET something = $1
                RETURNING *
            `;
    
            const result = await pool.query(query, [options]);
    
            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ message: 'Option is not found' });
            }
        } catch (error) {
            console.error('Error changing option:', error);
            res.status(500).json({ message: 'An error occurred' });
        }
    }

}

export default new RulesController();
