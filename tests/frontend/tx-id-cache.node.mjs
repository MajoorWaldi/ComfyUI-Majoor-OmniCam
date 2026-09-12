import test from "node:test";
import assert from "node:assert/strict";

import {
  MAX_RECENT_TRANSACTION_IDS,
  hasRecentTransactionId,
  rememberTransactionId,
} from "../../web-src/director-api/tx-id-cache.js";

function makeUi() {
  return {};
}

test("MAX_RECENT_TRANSACTION_IDS is 2048", () => {
  assert.equal(MAX_RECENT_TRANSACTION_IDS, 2048);
});

test("retains up to the bound and evicts the oldest once exceeded", () => {
  const ui = makeUi();
  for (let i = 0; i < MAX_RECENT_TRANSACTION_IDS; i += 1) {
    rememberTransactionId(ui, `tx_${i}`);
  }
  assert.equal(ui._directorApiTxIds.size, MAX_RECENT_TRANSACTION_IDS);
  assert.equal(hasRecentTransactionId(ui, "tx_0"), true);

  rememberTransactionId(ui, `tx_${MAX_RECENT_TRANSACTION_IDS}`);
  assert.equal(ui._directorApiTxIds.size, MAX_RECENT_TRANSACTION_IDS);
  assert.equal(hasRecentTransactionId(ui, "tx_0"), false);
  assert.equal(hasRecentTransactionId(ui, "tx_1"), true);
  assert.equal(hasRecentTransactionId(ui, `tx_${MAX_RECENT_TRANSACTION_IDS}`), true);
});

test("a recently remembered id is reported as a duplicate", () => {
  const ui = makeUi();
  rememberTransactionId(ui, "tx_abc");
  assert.equal(hasRecentTransactionId(ui, "tx_abc"), true);
  assert.equal(hasRecentTransactionId(ui, "tx_unknown"), false);
});
