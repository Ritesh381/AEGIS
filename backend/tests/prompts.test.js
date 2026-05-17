import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ORCHESTRATOR_SYSTEM_PROMPT,
  DEBATE_USER_PROMPT,
  OUTPUT_SCHEMA,
} from '../prompts/agents.js';

describe('Agent Prompts', () => {
  describe('ORCHESTRATOR_SYSTEM_PROMPT', () => {
    it('should be a non-empty string', () => {
      assert.equal(typeof ORCHESTRATOR_SYSTEM_PROMPT, 'string');
      assert.ok(ORCHESTRATOR_SYSTEM_PROMPT.length > 100);
    });

    it('should mention all three agent roles', () => {
      assert.ok(ORCHESTRATOR_SYSTEM_PROMPT.includes('User Advocate'));
      assert.ok(ORCHESTRATOR_SYSTEM_PROMPT.includes('Strict Judge'));
      assert.ok(ORCHESTRATOR_SYSTEM_PROMPT.includes('Opposing Counsel'));
    });

    it('should define the three debate rounds', () => {
      assert.ok(ORCHESTRATOR_SYSTEM_PROMPT.includes('Round 1'));
      assert.ok(ORCHESTRATOR_SYSTEM_PROMPT.includes('Round 2'));
      assert.ok(ORCHESTRATOR_SYSTEM_PROMPT.includes('Round 3'));
    });

    it('should include the disclaimer requirement', () => {
      assert.ok(ORCHESTRATOR_SYSTEM_PROMPT.includes('disclaimer'));
      assert.ok(ORCHESTRATOR_SYSTEM_PROMPT.includes('does not constitute legal advice'));
    });

    it('should mention risk scoring rules', () => {
      assert.ok(ORCHESTRATOR_SYSTEM_PROMPT.includes('risk_score'));
      assert.ok(ORCHESTRATOR_SYSTEM_PROMPT.includes('risk_profile'));
    });

    it('should require questions generation', () => {
      assert.ok(ORCHESTRATOR_SYSTEM_PROMPT.includes('self-directed'));
      assert.ok(ORCHESTRATOR_SYSTEM_PROMPT.includes('counterparty'));
    });
  });

  describe('DEBATE_USER_PROMPT', () => {
    it('should be a function', () => {
      assert.equal(typeof DEBATE_USER_PROMPT, 'function');
    });

    it('should include the contract text in the prompt', () => {
      const result = DEBATE_USER_PROMPT('This is a test contract clause.');
      assert.ok(result.includes('This is a test contract clause.'));
    });

    it('should include analysis instruction', () => {
      const result = DEBATE_USER_PROMPT('test');
      assert.ok(result.includes('Analyze'));
      assert.ok(result.includes('CONTRACT TEXT'));
    });

    it('should ask for structured JSON output', () => {
      const result = DEBATE_USER_PROMPT('test');
      assert.ok(result.includes('JSON'));
    });
  });

  describe('OUTPUT_SCHEMA', () => {
    it('should be a valid schema object', () => {
      assert.equal(typeof OUTPUT_SCHEMA, 'object');
      assert.ok(OUTPUT_SCHEMA !== null);
    });

    it('should have a type property', () => {
      assert.ok(OUTPUT_SCHEMA.type);
    });

    it('should define clauses as an array', () => {
      const props = OUTPUT_SCHEMA.properties;
      assert.ok(props);
      assert.ok(props.clauses);
    });

    it('should define overall_risk_score', () => {
      assert.ok(OUTPUT_SCHEMA.properties.overall_risk_score);
    });

    it('should define risk_profile', () => {
      assert.ok(OUTPUT_SCHEMA.properties.risk_profile);
    });
  });
});
