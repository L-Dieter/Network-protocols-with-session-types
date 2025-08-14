# Network-protocols-with-session-types

**Usage:**

Change 'input.ts' to use the desired session, program and port on the server.<br/>
With the default settings the server will close the connection after checking the program and session.


**1.) How to start the server:**<br/>

\<*PATH*> server.ts

Opens a new connection to the server with the given session, program and port.<br/>
The server will be accessible after a short delay, if the session and programs matches.<br/>
If a client connects to the server it will start processing the session and sends a message or request to the client if needed.

**2.) How to start the client:**<br/>

\<*PATH*> client.ts

Start the client without any argument to receive help on connecting the client to the server.

\<*PATH*> client.ts ws://localhost:<*PORT*>

The client tries to connect to the server with the given PORT. The PORT has to be the same as the one used to start the server.<br/>
If the connection is successful, the server starts the session and continues as far as possible without an input from the client.
As soon as an input is required, the client receives a request from the server with the information about the demanded type.

**3.) How to use the programs:**<br/>
- "send"
- "recv"
- "select"
- "choose"
- "end"
