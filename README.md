# NC News - Backend

This repository contains the backend for the NC News project, a RESTful API built using Node.js, Express, and PostgreSQL. The API provides access to a database of news articles, topics, users, and comments, supporting a variety of operations such as filtering, sorting, and pagination.

## **Project Links**

### **Back-End**

- **Hosted Link (RENDER):** [NC News API](https://backend-project-nc-news-hftl.onrender.com/api)  
  _(This will show the currently available endpoints.)_

- **GitHub Repository:** [NC News Backend](https://github.com/rambatinoo/backend-project-NC-news)

### **Front-End**

- **Hosted Link (NETLIFY):** [NC News Frontend](https://nc-news-baz-frontend-project.netlify.app/)

- **GitHub Repository:** [NC News Frontend](https://github.com/rambatinoo/fe-nc-news)

---

### **_ENDPOINTS_**

All of the available endpoints are able to be viewed by going to https://backend-project-nc-news-hftl.onrender.com/api, or by looking in the `endpoints.json` file.

## **Installation Instructions**

### **REQUIREMENTS**

- Postgres ^v8.11.5
- Node.js ^v22.1.0
- express ^v4.1.9.2

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rambatinoo/backend-project-NC-news.git
   cd backend-project-NC-news
   ```

---

2. **Install dependencies:**

   ```bash
   npm install
   ```

---

3. **Set up your environment variables:**

   - Create two `.env` files in the root directory of the project: `.env.development` and `.env.test`.
   - Inside `.env.development`, add:
     ```
     PGDATABASE=nc_news
     ```
   - Inside `.env.test`, add:
     ```
     PGDATABASE=nc_news_test
     ```

---

4. **Set up the databases:**

   - Run the following command to create and set up the databases:
     ```
     npm run setup-dbs
     ```
   - Seed the development database by running:
     ```
     npm run seed
     ```

---

5. **Run the tests:**

   - To execute the tests, use the following command:
     ```
     npm test
     ```
   - Ensure that all tests pass before deploying or using the application.
