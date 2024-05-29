const app = require("../app.js");
const db = require("../db/connection.js");
const request = require("supertest");
const seed = require("../db/seeds/seed.js");
const testData = require("../db/data/test-data");
const allEndpoints = require("../endpoints.json");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("No endpoint", () => {
  it("404: responds with a 404 and error message when request made to non-existent endpoint", () => {
    return request(app)
      .get("/not_an_endpoint")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Non existent endpoint");
      });
  });
});

describe("GET /api/topics", () => {
  it("200 responds with correct array of topics, containing description and slug", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          expect(typeof topic.description).toBe("string");
          expect(typeof topic.slug).toBe("string");
        });
      });
  });
});

describe("GET /api", () => {
  it("200: responds with object containing all available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(allEndpoints);
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  it("200: responds with the correct article", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          article_id: 2,
          title: "Sony Vaio; or, The Laptop",
          topic: "mitch",
          author: "icellusedkars",
          body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
          votes: 0,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
        expect(typeof article.created_at).toBe("string");
      });
  });
  it("400: responds with error message when an invalid id is passed", () => {
    return request(app)
      .get("/api/articles/not_an_id")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  it("404: responds with error message when passed valid but non-existant id", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No Article With That Id Found");
      });
  });
});

describe("GET /api/articles", () => {
  it("200: responds with list of all articles including the amount of comments for each, sorted by date (most recent first)", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(13);
        expect(articles).toBeSortedBy("created_at", { descending: true });
        articles.forEach((article) => {
          expect(Object.keys(article).length).toBe(8);
          expect(typeof article.article_id).toBe("number");
          expect(typeof article.author).toBe("string");
          expect(typeof article.title).toBe("string");
          expect(typeof article.topic).toBe("string");
          expect(typeof article.created_at).toBe("string");
          expect(typeof article.votes).toBe("number");
          expect(typeof article.article_img_url).toBe("string");
          expect(typeof article.comment_count).toBe("number");
        });
      });
  });
  it("200: filters the results by topic when passed a topic query", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(12);
        expect(articles).toBeSortedBy("created_at", { descending: true });
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  it("200: responds with an empty array if passed an existing topic that has no articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toEqual([]);
      });
  });
  it("400: responds with the correct error message when passed an invalid topic query", () => {
    return request(app)
      .get("/api/articles?topic=123")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  it("404: responds with the correct error message when passed a valid but non existant topic query", () => {
    return request(app)
      .get("/api/articles?topic=science-physics")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("That Topic Cannot Be Found");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  it("200: responds with the correct array of comments, sorted by most recent first for a given article id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments.length).toBe(11);
        expect(comments).toBeSortedBy("created_at", { descending: true });
        comments.forEach((comment) => {
          expect(Object.keys(comment).length).toBe(6);
          expect(typeof comment.comment_id).toBe("number");
          expect(typeof comment.votes).toBe("number");
          expect(typeof comment.created_at).toBe("string");
          expect(typeof comment.author).toBe("string");
          expect(typeof comment.body).toBe("string");
          expect(comment.article_id).toBe(1);
        });
      });
  });
  it("200: responds with an empty array when passed an existing article that has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toEqual([]);
      });
  });
  it("400: responds with the correct error message when passed an invalid article id", () => {
    return request(app)
      .get("/api/articles/not_an_id/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  it("404: responds with the correct error message when passed a valid but non-existant article id", () => {
    return request(app)
      .get("/api/articles/9999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No Article With That Id Found");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  it("201: should add the comment to the database and respond with the added comment", () => {
    const newComment = { username: "butter_bridge", body: "add this comment" };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment).toMatchObject({
          comment_id: 19,
          body: "add this comment",
          article_id: 2,
          author: "butter_bridge",
          votes: 0,
        });
        expect(typeof comment.created_at).toBe("string");
      })
      .then(() => {
        return request(app)
          .get("/api/articles/2/comments")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments.length).toBe(1);
          });
      });
  });
  it("400: responds with the correct error message when the article id is invalid", () => {
    const newComment = { username: "butter_bridge", body: "add this comment" };
    return request(app)
      .post("/api/articles/not_an_id/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  it("404: responds with the correct error message if the article id is valid but non-existent", () => {
    const newComment = { username: "butter_bridge", body: "add this comment" };
    return request(app)
      .post("/api/articles/999/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No Article With That Id Found");
      });
  });
  it("400: respond with the correct error message when the comment is in the wrong format", () => {
    const commentWithoutUsername = { body: "add this comment" };
    const commentWithoutBody = {
      username: "butter_bridge",
      bidy: "add this comment",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(commentWithoutUsername)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Incorrect Information For Request");
      })
      .then(() => {
        return request(app)
          .post("/api/articles/2/comments")
          .send(commentWithoutBody)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("Incorrect Information For Request");
          });
      })
      .then(() => {
        return request(app)
          .post("/api/articles/2/comments")
          .send({ username: "butter_bridge", body: 123 })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("Incorrect Information For Request");
          });
      })
      .then(() => {
        return request(app)
          .post("/api/articles/2/comments")
          .send({ username: 123, body: "add this comment" })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("Incorrect Information For Request");
          });
      });
  });
  it("404: responds with the correct error message when given a valid username that doen't exist", () => {
    return request(app)
      .post("/api/articles/2/comments")
      .send({ username: "Baz", body: "add this comment" })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("User Cannot Be Found");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  it("200: updates the article and responds with the updated article", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          votes: 101,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
        expect(typeof article.created_at).toBe("string");
      });
  });
  it("200: decreases the number of votes if passed a negative value", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -200 })
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.votes).toBe(-100);
      });
  });
  it("400: responds with the correct error message when the article id is invalid", () => {
    return request(app)
      .patch("/api/articles/not_an_id")
      .send({ inc_votes: 1 })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
  it("404: responds with the correct error message when the article id is valid but non-existent", () => {
    return request(app)
      .patch("/api/articles/999")
      .send({ inc_votes: 1 })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("No Article With That Id Found");
      });
  });
  it("400: responds with correct error messgae when passed information in the wrong format", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inv_votes: 1 })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Incorrect Information For Request");
      })
      .then(() => {
        return request(app)
          .patch("/api/articles/1")
          .send({ inc_votes: "hello" })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Incorrect Information For Request");
          });
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  it("204: removed the specified comment and responds with no content", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
        return db.query(`SELECT * FROM comments`).then((result) => {
          expect(result.rows.length).toBe(17);
        });
      });
  });
  it("400: responds with the correct error message when given an invalid comment id", () => {
    return request(app)
      .delete("/api/comments/not_an_id")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
  it("404: responds with the correct error message when given a valid but non existant comment id", () => {
    return request(app)
      .delete("/api/comments/999")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("No Comment With That Id Found");
      });
  });
});

describe("GET /api/users", () => {
  it("200: responds with an array of all users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users.length).toBe(4);
        users.forEach((user) => {
          expect(Object.keys(user).length).toBe(3);
          expect(typeof user.username).toBe("string");
          expect(typeof user.name).toBe("string");
          expect(typeof user.avatar_url).toBe("string");
        });
      });
  });
});
