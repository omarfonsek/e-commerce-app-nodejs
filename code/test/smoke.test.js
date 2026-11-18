const { describe, it, before, after } = require("node:test");
const assert = require("assert/strict");
const { resetDb, closeDb } = require("./helpers/db");
const request = require("supertest");
const app = require("../server");

describe("Smoke test", () => {
    before(resetDb);
    after(closeDb);

    it('GET /nope rejected with 404 Route Not Found error', async () => {
        const res = await request(app).get('/nope');
        assert.equal(res.status, 404);
        assert.equal(res.body.error.code, 'ROUTE_NOT_FOUND');
    });

    it ('GET /products returns 200', async () => {
        const res = await request(app).get('/products');
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { products: [] });
    })
});
