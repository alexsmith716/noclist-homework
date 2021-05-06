# Noclist

## Retrieve the NOC list

The Bureau of Adversarial Dossiers and Securely Encrypted Code (`BADSEC`)
has asked you to retrieve a list of VIP users. Fortunately, BADSEC provides an API to the agency you've been working with. Unfortunately, it's not the best API in the world.

Your job is to write a program that securely and politely asks the BADSEC
server for this list of users and prints it to stdout in JSON format.

As the server that your application will be hitting is not well written, you
should seek to minimize the amount of communication it does. Furthermore, you
should write a client that is resilient to errors in the server.

## Instructions to build and run the code from source

[Comments file](./COMMENTS)
