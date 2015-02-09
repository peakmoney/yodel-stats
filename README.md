![Yodel Stats Logo](http://i.imgur.com/XTd4HJi.png)

A simple stats interface for [Yodel](https://github.com/SpireTeam/yodel). 

## Getting Started
Yodel Stats is a simple Express 4.x server intended to run on Node 0.10.x and above. It 
requires connections to Redis and MySQL servers.

### Adding Config Files
Of the 5 supported config files, only 2 are required. All have corresponding sample 
files in the config directory.

* knexfile.js (required)
* session.json (required)
* redis_session.json (optional)
* redis_subscriber.json (optional)
* sentry.json (optional)

The redis_subscriber config needs to be pointed at the same Redis DB as your redis_events
config in Yodel.

### DB and Package Setup
Ensure that you have MySQL and Redis running, and that you're MySQL server has a database 
matching you're knexfile. At that point, install npm packages and run the DB migration:

```
npm install
bin/migrate
```

### Starting Yodel Stats
You should be ready to start Yodel Stats now. That can be accomplished with 
the following command:

```
bin/start
```

Yodel Stats also supports the following options:
```
    -h, --help               output usage information
    -e, --environment <env>  Node Environment (defaults to development)
```

## Example

![Sample Screenshot](http://i.imgur.com/G07JWlY.png)
