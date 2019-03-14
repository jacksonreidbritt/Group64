var config = {
    database: {
        host:       'localhost',    // database host
        user:       'root',         // your database username
        password:   'password',     // your database password
        port:       3306,           // default MySQL port
        db:         'SpotifyDB'          // your database name
    },
}

module.exports = config //Expose the current config as a module
