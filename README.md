# Strapi AzerothCore plugin

AzerothCore integration in Strapi CMS.

[![NPM Version](https://img.shields.io/npm/v/strapi-azerothcore?logo=npm)](https://www.npmjs.com/package/strapi-azerothcore)

## ✨ Features

-   **Multi-realm** support out of the box
-   **Registration** that also creates an in-game account with the same credentials
-   **Login** with the same credentials as the in-game account
-   **Password reset** and **password change**, which also change the in-game account password
-   **Account confirmation**
-   **Linking** of CMS account when in-game account already exists

## 📋✔️ Requirements

-   [Node.js](https://nodejs.org/en/download/)
-   An [AzerothCore](https://github.com/azerothcore/azerothcore-wotlk) server
-   A working [Strapi](https://strapi.io/) project, see [Quick Start Guide](https://docs.strapi.io/dev-docs/quick-start)

## 🛠️ Installation

Install the plugin in your Strapi project:

```bash
# using npm
npm install strapi-azerothcore

# using yarn
yarn add strapi-azerothcore
```

Using a text/code editor, open `config/plugins.js` (or `config/plugins.ts` if applicable), add a `"strapi-azerothcore"` object with an `enabled` property set to `true`:

```js
module.exports = ({ env }) => ({
	// ...
	"strapi-azerothcore": {
		enabled: true,
	},
	// ...
});
```

After installing the plugin, you must rebuild the admin dashboard for it to include the plugin.  
Use the `build` script to rebuild Strapi, or use `develop` if you'd like to start it as well:

```bash
# using npm
npm run build
# or
npm run develop

# using yarn
yarn build
# or
yarn develop
```

## ⚙️ Setup

The **AzerothCore** plugin should now appear in the left pane of your Strapi dashboard:
![Strapi dashboard left pane plugin](readme/left-pane-plugin.png)

### General settings

-   **Allow linking existing game accounts**  
    Check this to enable creating CMS user accounts for existing AzerothCore accounts. The users with existing AzerothCore accounts will need to go through the registration process on your website and make sure to provide the account name and password they're using to log into the game server.

### Realms settings

This is where you define your different realms.  
Typically you need to have one entry for each row in the `realmlist` table of your `acore_auth` database.

You can click the "➕ Create realm" button on the top right corner of the page to add an entry, click one of the table's rows to edit an entry, or click the 🗑️ button on the right to delete an entry.

Each entry has the following settings:

#### Characters Database

-   **Host**: the hostname on which your MySQL database server is running
-   **Port**: the port on which your MySQL database server is listening, usually `3306`
-   **Database**: the name of the database, usually `acore_characters`
-   **User**: the MySQL user to connect with. Make sure that the user has access to the specified database.
-   **Password**: the user's password

You can press the "Test Connection" button to ensure Strapi is able to connect to your database properly.

#### SOAP

-   **Host**: the hostname on which your AzerothCore worldserver is running. See `SOAP.IP` in your `worldserver.conf`.
-   **Port**: the port on which your AzerothCore worldserver is listening for SOAP connections, usually `7878`. See `SOAP.Port` in your `worldserver.conf`.
-   **Username**: the AzerothCore account name to connect with.  
    Make sure that the account has a security level of `3`:
    -   If you don't have an account for SOAP already, type this command in the `worldserver` console: `account create soap mypassword` (change `soap` and `mypassword` to your liking, they are the account name and password, respectively)
    -   Change the security level to `3` for your SOAP account by typing this command in the `worldserver` console: `account set gmlevel soap 3 -1` (change `soap` to the name of your SOAP account)
    -   [See AzerothCore's wiki on account creation](https://www.azerothcore.org/wiki/creating-accounts) for more info
-   **Password**: the SOAP account's password

You can press the "Test Connection" button to ensure Strapi is able to connect to your AzerothCore server via SOAP properly.

### Auth Database

-   **Host**: the hostname on which your MySQL database server is running
-   **Port**: the port on which your MySQL database server is listening, usually `3306`
-   **Database**: the name of the database, usually `acore_auth`
-   **User**: the MySQL user to connect with. Make sure that the user has access to the specified database.
-   **Password**: the user's password

You can press the "Test Connection" button to ensure Strapi is able to connect to your database properly.

### Users & permissions plugin

In the leftmost pane of the Strapi dashboard, click "⚙️ Settings", then visit the links from the "Users & permissions plugin" section:

#### Email templates

You can customize the emails sent to your users here.

#### Advanced settings

Make sure to change the "Reset password page" and "Redirection url" links:

-   **Reset password page**: when using the "forgot password" feature, an email is sent with the specified URL. Make sure to input a link to an existing page of your frontend, which needs to call the `reset-password` endpoint with a `code` contained as a query parameter in the link sent by email.
-   **Redirection url**: when registering, a verification email is sent with a link that will redirect to the specified URL. Make sure to input a link to an existing page of your frontend, where you can notify the user that the account was successfully verified, for instance.

## 🔌 API endpoints

Your frontend can query the following API endpoints:

### Auth

-   **Register**  
    POST `/api/strapi-azerothcore/auth/register`

    ```json
    {
    	"username": "myaccount",
    	"email": "user@test.com",
    	"password": "mypassword",
    	"repeatPassword": "mypassword"
    }
    ```

-   **Login**  
    POST `/api/strapi-azerothcore/auth/login`

    ```json
    {
    	"identifier": "myaccount",
    	"password": "mypassword"
    }
    ```

    You can also use the email address to log in:

    ```json
    {
    	"identifier": "user@test.com",
    	"password": "mypassword"
    }
    ```

    Example response:

    ```json
    {
    	"jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NzMsImlhdCI6MTcxOTE1MTY0MiwiZXhwIjoxNzIxNzQzNjQyfQ.IoEBek2debDordaC0y1X_mlksjFPx_roi-BoJUeYfIg",
    	"user": {
    		"id": 73,
    		"username": "myaccount",
    		"email": "user@test.com",
    		"provider": "local",
    		"confirmed": true,
    		"blocked": false,
    		"createdAt": "2024-06-20T10:51:14.841Z",
    		"updatedAt": "2024-06-20T10:51:14.841Z"
    	}
    }
    ```

    Use the provided [`jwt`](https://en.wikipedia.org/wiki/JSON_Web_Token) in the `Authorization` header (`Authorization: Bearer <your jwt>` without the brackets) for the endpoints that need authentication.

-   **Forgot Password**  
    POST `/api/auth/forgot-password`  
    This will send an email to the provided email address if a user is found. The email will contain a link with a `code` as a query parameter (`?code=xxxxx`) which is needed for the `reset-password` endpoint.

    ```json
    {
    	"email": "user@test.com"
    }
    ```

-   **Reset Password**  
    POST `/api/strapi-azerothcore/auth/reset-password`

    ```json
    {
    	"code": "xxxxxxxxxxxxxxxxxxxxxxx",
    	"password": "mynewpassword",
    	"passwordConfirmation": "mynewpassword"
    }
    ```

    The `code` is from a link sent via email when using the `reset-password` endpoint.  
    `password` is the new password to set, and `passwordConfirmation` must be the value of a repeat field in the form on your frontend.

-   **Change Password**  
    POST `/api/strapi-azerothcore/auth/change-password`  
    🔐 _Requires authentication_

    ```json
    {
    	"currentPassword": "password",
    	"password": "mynewpassword",
    	"passwordConfirmation": "mynewpassword"
    }
    ```

-   **Change Email**  
    POST `/api/strapi-azerothcore/auth/change-email`  
    🔐 _Requires authentication_

    ```json
    {
    	"email": "newuser@test.com"
    }
    ```

### Characters

-   **My Characters**  
    GET `/api/strapi-azerothcore/characters/:realm/my-characters`  
    🔐 _Requires authentication_  
    Returns data about the account's characters for a given `realm`

-   **My Guilds**  
    GET `/api/strapi-azerothcore/characters/:realm/my-guilds`  
    🔐 _Requires authentication_  
    Returns data about the account's owned guilds for a given `realm`

### Realms

-   **Realms**  
    GET `/api/strapi-azerothcore/realms`  
    Returns data about the realms

### User Activity

-   **User Activity**
    GET `/api/strapi-azerothcore/user-activity`  
    🔐 _Requires authentication_  
    Returns data about activity for the account, such as logins, failed logins, password changes, etc.  
    You can use [parameters](https://docs.strapi.io/dev-docs/api/rest/parameters) to control sorting and paging

## 🤝 Contributing

Contributions are **greatly appreciated**.

If you have a suggestion that would make this project better, feel free to fork the repository and create a Pull Request. You can also open a [Feature Request](https://github.com/r-o-b-o-t-o/strapi-azerothcore/issues/new?assignees=&labels=enhancement&template=feature_request.yml).

## ⭐️ Show your support

⭐️ Give the project a star if you like it!

<a href="https://ko-fi.com/roboto" target="_blank"><img height="35" style="border:0px; height:46px;" src="https://cdn.ko-fi.com/cdn/kofi5.png?v=3" border="0" alt="Buy Me a Coffee at ko-fi.com" />

## 🔗 Links

-   [NPM package](https://www.npmjs.com/package/strapi-azerothcore)
-   [GitHub repository](https://github.com/r-o-b-o-t-o/strapi-azerothcore)
-   [AzerothCore website](https://azerothcore.org/)
-   [Strapi developer docs](https://docs.strapi.io/dev-docs/intro)
-   [Strapi user guide](https://docs.strapi.io/user-docs/intro)

## 🌎 Community support

-   For general help using Strapi, please refer to [the official Strapi documentation](https://strapi.io/documentation/)
-   You can also get general help with Strapi on the [Strapi Discord server](https://discord.strapi.io/)
-   You can get help for AzerothCore or this plugin on the [AzerothCore Discord server](https://discord.com/invite/gkt4y2x)  
    Prefer the `#web` channel if you'd like to discuss this plugin
-   You can get in touch with me on Discord: `roboto_`
