# CyberSecurity

Download and install node.js from: https://nodejs.org/en/

Download and install MongoDB server from: https://www.mongodb.com/download-center/community

Setup MongoDB database

On Windows run "mongo" from: 
```
C:\Program Files\MongoDB\Server\4.2\bin
```

Select database:

```
use cybersecurity_db
```

Create user for database:

```
db.createUser(
    {
         user: "root",
         pwd: "lEsjcYm#~PJdK9iL",
         roles: [{role: "readWrite", db: "cybersecurity_db"}]
    }
)
```

Install backend dependencies:

```
    cd backend
    npm install
```

Start node (express) server:

```
    npm run dev
```
