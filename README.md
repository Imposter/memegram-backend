# Memegram Backend
### Introduction
Memes are a form self-expression, humor and a way to convey emotion. However, memes have become a part of mainstream culture virtually undistinguishable from normal social media. We decided to create a platform exclusively devoted to memes and nothing else. Memegram allows users to quickly, efficiently and anonymously upload their own memes onto the site, and anyone can access and view them. Comments are also utilized so that other users can also express themselves and their opinions on the meme. When a meme is uploaded, the user is prompted to enter topics. These topics are tags which are utilized for searching. Memegram is a platform that we created to create a community for everyone who enjoys the humors of memes. Everyone is welcome to the platform and is encouraged to express their creativity, humor and feelings through memes.

### Requirements
The following are requirements to compile and run the server:
- Node.js with Node Package Manager (npm) ([Details](https://nodejs.org/en/download/))
- Typescript v2.x+ ([Details](https://www.typescriptlang.org/index.html#download-links))
- MongoDB v3.6.x+ server and database ([Details](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/))

### Setup
1. Run `npm install` to install Node.js packages
2. Run `mkdir build` to create the build directory
3. Copy `config/default.json` to `build/config/default.json` and update the configuration to suit your needs
4. Run `tsc` to compile the program (There may be errors compiling some of the external libraries, however those errors can be ignored)
5. Change directories into `build` and run `node name-gen.js` to generate a list of possible user names.
6. Run `node main.js` to start the server

### Authors
- Eyaz Rehman
- Rameet Sekhon