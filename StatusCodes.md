# HTTP Status Code Errors and Their Meaning

## 100 - Continue
**`res.status(100)`**
- **What it means:** The server has received the request headers and the client should proceed to send the request body.
- **When to use:** When the server wants to inform the client that it’s okay to continue.

## 101 - Switching Protocols
**`res.status(101)`**
- **What it means:** The server is switching protocols as requested by the client.
- **When to use:** When upgrading from HTTP to WebSockets or another protocol.

## 200 - OK
**`res.status(200)`**
- **What it means:** The request was successful.
- **When to use:** For successful GET, POST, PUT, DELETE, etc., requests.

## 201 - Created
**`res.status(201)`**
- **What it means:** A new resource has been successfully created.
- **When to use:** After a successful POST request that creates data.

## 202 - Accepted
**`res.status(202)`**
- **What it means:** The request has been accepted but not yet processed.
- **When to use:** For asynchronous processing.

## 204 - No Content
**`res.status(204)`**
- **What it means:** The request was successful but there’s no content to return.
- **When to use:** When a DELETE request succeeds but no response body is needed.

## 301 - Moved Permanently
**`res.status(301)`**
- **What it means:** The requested resource has been permanently moved to a new URL.
- **When to use:** For permanent URL redirections.

## 302 - Found (Temporary Redirect)
**`res.status(302)`**
- **What it means:** The resource is temporarily located at a different URL.
- **When to use:** For temporary URL redirections.

## 304 - Not Modified
**`res.status(304)`**
- **What it means:** The resource hasn’t been changed since the last request.
- **When to use:** To reduce bandwidth when the client’s cached version is still up-to-date.

## 400 - Bad Request
**`res.status(400)`**
- **What it means:** The server cannot process the request due to client-side errors (like invalid input, missing fields, etc.).
- **When to use:** When the client sends malformed or insufficient data.

## 401 - Unauthorized
**`res.status(401)`**
- **What it means:** Authentication is required, and the client has not provided valid credentials.
- **When to use:** When access to a resource is denied due to lack of proper authentication.

## 403 - Forbidden
**`res.status(403)`**
- **What it means:** The client is authenticated but does not have permission to access the requested resource.
- **When to use:** When an authenticated user tries to access something they shouldn’t.

## 404 - Not Found
**`res.status(404)`**
- **What it means:** The requested resource could not be found on the server.
- **When to use:** When the client requests an endpoint or file that does not exist.

## 405 - Method Not Allowed
**`res.status(405)`**
- **What it means:** The request method is not supported for the resource.
- **When to use:** When using GET, POST, PUT, etc., on an endpoint that doesn’t support it.

## 409 - Conflict
**`res.status(409)`**
- **What it means:** A conflict occurred due to the current state of the server.
- **When to use:** When attempting to create a resource that already exists or when there’s a versioning conflict.

## 418 - I’m a Teapot
**`res.status(418)`**
- **What it means:** An April Fools’ joke in the HTTP spec, not meant to be implemented.
- **When to use:** Just for fun.

## 429 - Too Many Requests
**`res.status(429)`**
- **What it means:** The user has sent too many requests in a given amount of time.
- **When to use:** For rate limiting.

## 500 - Internal Server Error
**`res.status(500)`**
- **What it means:** A generic server error, usually indicating an unexpected condition on the server.
- **When to use:** When something goes wrong on the server’s end, like an unhandled exception.

## 502 - Bad Gateway
**`res.status(502)`**
- **What it means:** The server acting as a gateway received an invalid response from an upstream server.
- **When to use:** When there’s an issue with communication between microservices or external APIs.

## 503 - Service Unavailable
**`res.status(503)`**
- **What it means:** The server is currently unable to handle the request due to overload or maintenance.
- **When to use:** During downtime or when the server is temporarily overloaded.

## 504 - Gateway Timeout
**`res.status(504)`**
- **What it means:** The server acting as a gateway did not receive a timely response from an upstream server.
- **When to use:** When a dependent service fails to respond in time.

