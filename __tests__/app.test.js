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
  it("200: includes comment count in the result", () => {
    return request(app)
      .get("/api/articles/5")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.comment_count).toBe(2);
      });
  });
  it("includes comment count when there are no comments on an article", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.comment_count).toBe(0);
      });
  });
});

describe("GET /api/articles", () => {
  it("200: responds with list of all articles including the amount of comments for each, sorted by date (most recent first) with 10 results, including total count", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles, totalCount } }) => {
        expect(articles.length).toBe(10);
        expect(articles).toBeSortedBy("created_at", { descending: true });
        expect(totalCount).toBe(13);
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
      .then(({ body: { articles, totalCount } }) => {
        expect(articles.length).toBe(10);
        expect(articles).toBeSortedBy("created_at", { descending: true });
        expect(totalCount).toBe(12);
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  it("200: responds with an empty array if passed an existing topic that has no articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body: { articles, totalCount } }) => {
        expect(articles).toEqual([]);
        expect(totalCount).toBe(0);
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
        expect(comments.length).toBe(10);
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
        expect(body.msg).toBe("Username And Body Are Required To Be Strings");
      })
      .then(() => {
        return request(app)
          .post("/api/articles/2/comments")
          .send(commentWithoutBody)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe(
              "Username And Body Are Required To Be Strings"
            );
          });
      })
      .then(() => {
        return request(app)
          .post("/api/articles/2/comments")
          .send({ username: "butter_bridge", body: 123 })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe(
              "Username And Body Are Required To Be Strings"
            );
          });
      })
      .then(() => {
        return request(app)
          .post("/api/articles/2/comments")
          .send({ username: 123, body: "add this comment" })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe(
              "Username And Body Are Required To Be Strings"
            );
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
        expect(msg).toBe("inc_votes Must Be A Number");
      })
      .then(() => {
        return request(app)
          .patch("/api/articles/1")
          .send({ inc_votes: "hello" })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("inc_votes Must Be A Number");
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

describe("Sort by queries for GET /api/articles", () => {
  it("200: respond with the array correctly sorted when passed a sorted by query", () => {
    return request(app)
      .get("/api/articles?sort_by=author")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("author", { descending: true });
      });
  });
  it("200: respond with the array correctly sorted when passed a sorted by query that could be ambiguous", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("article_id", { descending: true });
      });
  });
  it("400: respond with the corect error message for queries that are not allowed ", () => {
    return request(app)
      .get("/api/articles?sort_by=bubbles")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid Sort By Query");
      });
  });
});

describe("Order by queries for GET /api/articles", () => {
  it("200: responds with the array correctly ordered when passed an order query", () => {
    return request(app)
      .get("/api/articles?order=ASC")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", { ascending: true });
      });
  });
  it("400: responds with the correct error message when passed an invalid order query", () => {
    return request(app)
      .get("/api/articles?order=bubbles")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid Order Query");
      });
  });
});

describe("Interactions between queries on GET /api/articles", () => {
  it("200: responds with the correct topic articles, sorted and ordered correctly", () => {
    return request(app)
      .get("/api/articles?order=ASC&topic=mitch&sort_by=article_id")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("article_id", { ascending: true });
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  it("responds with the correct number of articles, sorted and ordered correctly on the correct page and with the correct limit, including a total count", () => {
    return request(app)
      .get("/api/articles?order=ASC&topic=mitch&sort_by=article_id&limit=5&p=2")
      .expect(200)
      .then(({ body: { articles, totalCount } }) => {
        expect(totalCount).toBe(12);
        expect(articles.length).toBe(5);
        expect(articles).toBeSortedBy("article_id", { ascending: true });
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
          expect(article.article_id).toBeGreaterThan(6);
          expect(article.article_id).toBeLessThan(12);
        });
      });
  });
});

describe("GET /api/users/:username", () => {
  it("200: responds with the correct user object", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then(({ body: { user } }) => {
        expect(user).toEqual({
          username: "butter_bridge",
          name: "jonny",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        });
      });
  });
  it("404: responds with the correct error message when a username does not exist in the database", () => {
    return request(app)
      .get("/api/users/kingpin")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("No User With That Username Can Be Found");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  it("200: updates the number of votes and responds with the updated comment", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 5 })
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment).toMatchObject({
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 21,
          author: "butter_bridge",
          article_id: 9,
        });
        expect(typeof comment.created_at).toBe("string");
      });
  });
  it("200: decreases the vote count if passed negative value", () => {
    return request(app)
      .patch("/api/comments/2")
      .send({ inc_votes: -20 })
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment.votes).toBe(-6);
      });
  });
  it("400: responds with the correct error message if passed an invalid comment_id", () => {
    return request(app)
      .patch("/api/comments/not_an_id")
      .send({ inc_votes: 1 })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
  it("404: responds with the correct error message if the comment_id is valid but non-existent", () => {
    return request(app)
      .patch("/api/comments/999")
      .send({ inc_votes: 1 })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("No Comment With That Id Found");
      });
  });
  it("400: responds with the correct error message if not passed a number for inc_votes", () => {
    return request(app)
      .patch("/api/comments/2")
      .send({ inc_votes: "bubbles" })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
  it("400: responds wit the correct error message if inc_votes is missing", () => {
    return request(app)
      .patch("/api/comments/2")
      .send({ vnc_votes: 1 })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Incorrect Information For Request");
      });
  });
});

describe("POST /api/articles", () => {
  it("201: responds with the added article", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "How to eat bricks",
      body: "don't",
      topic: "cats",
      article_img_url:
        "https://libreshot.com/wp-content/uploads/2018/02/orange-brick-wall.jpg",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          article_id: 14,
          author: "butter_bridge",
          title: "How to eat bricks",
          body: "don't",
          topic: "cats",
          article_img_url:
            "https://libreshot.com/wp-content/uploads/2018/02/orange-brick-wall.jpg",
          votes: 0,
          comment_count: 0,
        });
        expect(typeof article.created_at).toBe("string");
      });
  });
  it("400: responds with the correct error message when the provided information is in an incorrect format", () => {
    const newArticle = {
      author: 123,
      title: "How to eat bricks",
      body: "don't",
      topic: "cats",
      article_img_url:
        "https://libreshot.com/wp-content/uploads/2018/02/orange-brick-wall.jpg",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("all input values must be strings");
      });
  });
  it("400: responds with the correct error message when the required fields are missing", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "How to eat bricks",
      NOTbody: "don't",
      topic: "cats",
      article_img_url:
        "https://libreshot.com/wp-content/uploads/2018/02/orange-brick-wall.jpg",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("articles must contain: author, title, body & topic");
      });
  });
});

describe("Add pagination to GET /api/articles", () => {
  it("200: defaults to limit 10 and page 1", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles, totalCount } }) => {
        expect(articles.length).toBe(10);
        expect(totalCount).toBe(13);
      });
  });
  it("200 limits the nuber of responses when passed a limit value", () => {
    return request(app)
      .get("/api/articles?limit=3")
      .expect(200)
      .then(({ body: { articles, totalCount } }) => {
        expect(articles.length).toBe(3);
        expect(totalCount).toBe(13);
      });
  });
  it("200 responds with the correct page of results if passed a page number", () => {
    return request(app)
      .get("/api/articles?p=2&sort_by=article_id&order=asc")
      .expect(200)
      .then(({ body: { articles, totalCount } }) => {
        expect(articles.length).toBe(3);
        expect(totalCount).toBe(13);
        articles.forEach((article) => {
          expect(article.article_id).toBeGreaterThan(10);
        });
      });
  });
  it("400 responds with the correct error message when passed an invalid limit query", () => {
    return request(app)
      .get("/api/articles?limit=bubbles")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
  it("400: responds with the correct error message if passed an invalid p query", () => {
    return request(app)
      .get("/api/articles?p=bubbles")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
});

describe("Add pagination to GET /api/articles/:article_id/comments", () => {
  it("200: defaults to limit 10 and page 1", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments.length).toBe(10);
      });
  });
  it("responds with the correct number of results if passed a limit", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=3")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments.length).toBe(3);
      });
  });
  it("responds with the correct page if passed a p value", () => {
    return request(app)
      .get("/api/articles/1/comments?p=2")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments.length).toBe(1);
      });
  });
  it("respond correctly when passed both a limit and a page number ", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=7&p=2")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments.length).toBe(4);
      });
  });
  it("400: responds with the correct error message when passed an invalid limit query", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=bubbles")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
  it("400: responds with the correct error message when passed an invalid p query", () => {
    return request(app)
      .get("/api/articles/1/comments?p=bubbles")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
});

describe("POST /api/topics", () => {
  it("201: responds with the newly created topic", () => {
    const newTopic = {
      slug: "atoms",
      description: "what everything is made of",
    };
    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(201)
      .then(({ body: { topic } }) => {
        expect(topic).toEqual(newTopic);
        return request(app)
          .get("/api/topics")
          .then(({ body: { topics } }) => {
            expect(topics.length).toBe(4);
          });
      });
  });
  it("400: responds with the correct error message when the provided information is in an incorrect format", () => {
    const newTopic = {
      slug: 123,
      description: "what everything is made of",
    };
    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("all input values must be strings");
      });
  });
  it("400 responds with the correct error message when required fields are missing", () => {
    const newTopic = {
      not_slug: "atoms",
      description: "what everything is made of",
    };
    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("topics must contain: slug and description");
      });
  });
});

describe("DELETE /api/articles/:article_id", () => {
  it("204: responds with correct error code and removes article", () => {
    return request(app)
      .delete("/api/articles/1")
      .expect(204)
      .then(() => {
        return request(app)
          .get("/api/articles")
          .then(({ body: { totalCount } }) => {
            expect(totalCount).toBe(12);
          });
      });
  });
  it("removes all associated comments to the deleted article", () => {
    return request(app)
      .delete("/api/articles/1")
      .then(() => {
        return request(app)
          .get("/api/comments")
          .then(({ body: { comments } }) => {
            expect(comments.length).toBe(7);
          });
      });
  });
  it("400: responds with the correct error message when passed an invalid article_id", () => {
    return request(app)
      .delete("/api/articles/not_an_id")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
  it("404: responds with the corrrect error message when passed a valid but non-existent id", () => {
    return request(app)
      .delete("/api/articles/999")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("No Article With That Id Found");
      });
  });
});
