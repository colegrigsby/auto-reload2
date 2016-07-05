var pmx = require('pmx');
var pm2 = require('pm2');
var Promise = require('bluebird');
var vizion = require('vizion');
var child = require('child_process');

/******************************
 *    ______ _______ ______
 *   |   __ \   |   |__    |
 *   |    __/       |    __|
 *   |___|  |__|_|__|______|
 *
 *      PM2 Module Sample
 *
 ******************************/

/**
 *    Module system documentation
 *       http://bit.ly/1hnpcgu
 *
 *   Start module in development mode
 *          $ cd to my-module
 *          $ pm2 install .
 *
 *  Official modules are published here
 *      https://github.com/pm2-hive
 */

/**
 *           Module Entry Point
 *
 *  We first initialize the module by calling
 *         pmx.initModule({}, cb);
 *
 *
 * More options: http://bit.ly/1EpagZS
 *
 */
var conf = pmx.initModule({

    // Options related to the display style on Keymetrics
    widget: {

        // Logo displayed
        logo: 'https://app.keymetrics.io/img/logo/keymetrics-300.png',

        // Module colors
        // 0 = main element
        // 1 = secondary
        // 2 = main border
        // 3 = secondary border
        theme: ['#141A1F', '#222222', '#3ff', '#3ff'],

        // Section to show / hide
        el: {
            probes: true,
            actions: true
        },

        // Main block to show / hide
        block: {
            actions: false,
            issues: true,
            meta: true,

            // Custom metrics to put in BIG
            main_probes: ['test-probe']
        }

    }

}, function (err, conf) {

    /**
     * Module specifics like connecting to a database and
     * displaying some metrics
     */

    /**
     *                      Custom Metrics
     *
     * Let's expose some metrics that will be displayed into Keymetrics
     *   For more documentation about metrics: http://bit.ly/1PZrMFB
     */
    var Probe = pmx.probe();

    var value_to_inspect = 0;

    /**
     * .metric, .counter, .meter, .histogram are also available (cf doc)
     */
    var val = Probe.metric({
        name: 'test-probe',
        value: function () {
            return value_to_inspect;
        },
        /**
         * Here we set a default value threshold, to receive a notification
         * These options can be overriden via Keymetrics or via pm2
         * More: http://bit.ly/1O02aap
         */
        alert: {
            mode: 'threshold',
            value: 20,
            msg: 'test-probe alert!',
            action: function (val) {
                // Besides the automatic alert sent via Keymetrics
                // You can also configure your own logic to do something
                console.log('Value has reached %d', val);
            }
        }
    });


    setInterval(function () {

        var chain = Promise.resolve();
        var running = false;


        if (running == true) return false;

        running = true; //nec with chaining?? //probably gonna device between running vs promises?
        // Then we can see that this value increase over the time in Keymetrics
        //PROMISE CHAIN???? for pull and restart or something based on give proc names
        vizion.update(
            {folder: "/opt/dev/source"}, //TODO from conf file
            function (err, meta) {
                console.log("meta", meta);
                console.log("err", err);
                //TODO exec start or restart?
                //console.log(process) //this is the current reload process
                //child.exec("Echo hello ", process);
                console.log("ID:", pm2.getProcessIdByName("asahi", function(blank, id){return id}))


                //might have to chain? definitely a good idea
                if (meta.success)
                    child.exec("cd /opt/dev/source && pm2 reload process.json --only asahi")
                    //pm2.restart("/opt/dev/source/process.json"); //TODO CONFIG THIS,
                // this gets the right name but wrong proc -OOH IDEA! write out the whole app.js in proc
                //try restart with name then file next

                running = false;
            }
        );


        //idea - get process id by name, then send signal to the process id (restart)


        value_to_inspect++;
    }, 3000);



    //console.log(value_to_inspect);

    /**
     *                Simple Actions
     *
     *   Now let's expose some triggerable functions
     *  Once created you can trigger this from Keymetrics
     *
     */
    pmx.action('env', function (reply) {
        return reply({
            env: process.env
        });
    });

    /**
     *                 Scoped Actions
     *
     *     This are for long running remote function
     * This allow also to res.emit logs to see the progress
     *
     **/
    var spawn = require('child_process').spawn;

    pmx.scopedAction('lsof cmd', function (options, res) {
        var child = spawn('lsof', []);

        child.stdout.on('data', function (chunk) {
            chunk.toString().split('\n').forEach(function (line) {
                /**
                 * Here we send logs attached to this command
                 */
                res.send(line);
            });
        });

        child.stdout.on('end', function (chunk) {
            /**
             * Then we emit end to finalize the function
             */
            res.end('end');
        });

    });


    pm2.connect(function () {
        console.log('auto-reload2 module connected to pm2');

    })


});
