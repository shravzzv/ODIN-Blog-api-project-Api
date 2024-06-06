# ODIN Blog api project's API

## Description

This repository provides the backend API for a blog application, built using Express.js and MongoDB. It follows the assignment guidelines from The Odin Project. Check out the assignment [here](https://www.theodinproject.com/lessons/nodejs-blog-api).

## Features

- RESTful API for managing users, posts and comments for a simple blog.
- User authentication with JWT (JSON Web Tokens) and Passport.js.

## Technologies Used

[![My Skills](https://skillicons.dev/icons?i=express,mongodb)](https://skillicons.dev)

## Installation

To install the project, follow these steps:

```bash
git clone https://github.com/shravzzv/ODIN-Blog-api-project-Api
cd ODIN-Blog-api-project-Api
npm install
npm run dev
```

## Usage

The API provides various endpoints for CRUD (Create, Read, Update, Delete) operations on blog posts and comments. Authentication is required for most actions except viewing published posts.

### Endpoints

- `/posts`(protected):
  - `GET`: Retrieve all posts.
  - `GET/:ID`: Retrieve a specific post.
  - `POST`: Create a new post.
  - `PUT/:ID`: Update an existing post.
  - `DELETE:/ID`: Delete a post.
- `/comments`(protected):
  - `GET`: Retrieve all comments for a specific post.
  - `POST`: Create a new comment on a post.
  - `DELETE/:ID`: Delete a comment.
  - `UPDATE/:ID`: Update a comment.
- `/user`:
  - `POST SIGNUP`: Create a new user.
  - `POST SIGNIN` : Signin a user.
  - `GET USER/:ID` : Get a specific user alongwith the user's posts.

### Authentication

1. Login to obtain a JWT token (details on login API endpoint to be added).
2. Include the JWT token in the Authorization header with the Bearer schema for protected requests.

### Example Usage with Postman:

1. Set up a POST request to the signin endpoint.
2. Send login credentials in the request body.
3. Upon successful login, store the JWT token received in the response.
4. Create a new GET request to /posts (or other protected endpoints).
5. Add the Authorization: Bearer `<your_jwt_token>` header to the request.

### Additional Notes

Refer to the API documentation within the code for detailed endpoint information and request/response formats.

## How to Contribute

If you'd like to contribute, follow these steps:

1. Fork the repository on GitHub.
2. Clone your fork locally.

   ```bash
   git clone https://github.com/shravzzv/ODIN-Blog-api-project-Api
   cd ODIN-Blog-api-project-Api
   ```

3. Create a new branch for your feature or bug fix.

   ```bash
   git checkout -b feature-or-bug-fix-name
   ```

4. Make your changes, commit them, and push them to your fork.

   ```bash
   git add .
   git commit -m "Your commit message here"
   git push origin feature-or-bug-fix-name
   ```

5. Open a Pull Request on GitHub, comparing your branch to the original repository's `main` branch.

## Issue Tracker

Find a bug or want to request a new feature? Please let us know by submitting an issue at the [issue Tracker](https://github.com/shravzzv/ODIN-Blog-api-project-Api/issues).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
