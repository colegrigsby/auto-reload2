# auto-reload
PM2 module for reloading a specific sails process 

Runs npm update and bower update before reloading the process. 

Turn off watch in pm2 for this process to prevent double reloading 


## config 

- use the proc name and directory to ensure the right application is being watched 


## Make sure to set up processes git remotes as ssh and have ssh key configured for git account so auto pull is possible