import test from "node:test";
import assert from "node:assert/strict";
import {
  assignmentSchema,
  querySchema,
  roleCreateSchema,
  workerCreateSchema
} from "../src/schemas.js";

test("querySchema requires query", () => {
  const result = querySchema.safeParse({});
  assert.equal(result.success, false);
});

test("roleCreateSchema accepts minimal role", () => {
  const result = roleCreateSchema.safeParse({ name: "planner" });
  assert.equal(result.success, true);
});

test("workerCreateSchema sets default status", () => {
  const result = workerCreateSchema.safeParse({ name: "agent-1" });
  assert.equal(result.success, true);
  assert.equal(result.data.status, "idle");
});

test("assignmentSchema requires roleIds", () => {
  const result = assignmentSchema.safeParse({ roleIds: [] });
  assert.equal(result.success, false);
});
