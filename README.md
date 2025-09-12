# Network-protocols-with-session-types

**Usage:**

Change 'input.ts' to use the desired session, program and port on the server or use another file which exports a config with a session, program and port.<br/>
With the default settings the server will close the connection immediately after the client connects because the session terminates.<br/>


**1.) How to start the server:**<br/>

Without filepath and name of the config:<br/>
\<*PATH*> npx tsx server.ts

With filepath **AND** name of the config:<br/>
\<*PATH*> npx tsx server.ts \<*FILEPATH*> \<*NAME*>

Opens a new connection to the server with the given session, program and port.<br/>
The server will be accessible after a short delay, if the session and program matches.<br/>
If a client connects to the server it will start processing the session and sends a message or request to the client if needed.

**2.) How to start the client:**<br/>

\<*PATH*> npx tsx client.ts

Start the client without any argument to receive help on connecting the client to the server.

\<*PATH*> npx tsx client.ts ws://localhost:<*PORT*>

The client tries to connect to the server with the given PORT. The PORT has to be the same as the one used to start the server.<br/>
If the connection is successful, the server starts the session and continues as far as possible without an input from the client.
As soon as an input is required, the client receives a request from the server with the information about the demanded type.

**3.) How to use the tests:**<br/>

\<*PATH*> npx tsx server.ts ./testsuite/test1.ts test1<br/> **OR** \<*PATH*> npm run test1
\<*PATH*> npx tsx server.ts ./testsuite/test2.ts test2 **OR** \<*PATH*> npm run test2

This will open a connection to the server with a session, program and port which is given by the respective file.<br/>

\<*PATH*> npx tsx client.ts ws://localhost:3000

Afterwards connect the client to the server and the session will be processed.
